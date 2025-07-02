const Message = require("./Models/message.model");
const Conversation = require("./Models/conversation.model");

const onlineUsers = new Map(); // Store online users in memory
const messageRateLimit = new Map(); // Track message sending timestamps for rate limiting
const typingUsers = new Map(); // Track typing users per conversation
const typingTimeouts = new Map(); // Track typing timeouts to auto-stop typing

const handleSocketConnection = (io) => {
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Notify others when a user comes online
    socket.on("user-online", (userId) => {
      // Store user in Map instead of Redis
      onlineUsers.set(userId, socket.id);
      io.emit("user-status-update", { userId, status: "online" });
    });

    // Join a conversation and fetch the last message
    socket.on("join-conversation", async ({ conversationId, userId }) => {
      socket.join(conversationId);
      console.log(`User ${userId} joined conversation: ${conversationId}`);

      try {
        // Fetch the last message instead of all messages to improve performance
        const lastMessage = await Message.findOne({ conversation: conversationId })
          .sort({ timestamp: -1 })
          .populate("sender", "username avatar");

        socket.emit("last-message", lastMessage);
      } catch (error) {
        console.error("Error fetching last message:", error);
        socket.emit("error", { message: "Failed to load messages" });
      }
    });

    // Enhanced typing indicators with auto-timeout
    socket.on("typing", ({ conversationId, userId, userName }) => {
      if (!conversationId || !userId) {
        return socket.emit("error", {
          message: "Missing required fields",
          required: ["conversationId", "userId"]
        });
      }

      // Initialize typing users for this conversation if not exists
      if (!typingUsers.has(conversationId)) {
        typingUsers.set(conversationId, new Set());
      }

      const conversationTypingUsers = typingUsers.get(conversationId);
      const timeoutKey = `${conversationId}-${userId}`;

      // Clear existing timeout for this user (if any)
      if (typingTimeouts.has(timeoutKey)) {
        clearTimeout(typingTimeouts.get(timeoutKey));
      }

      // Add user to typing list if not already typing
      if (!conversationTypingUsers.has(userId)) {
        conversationTypingUsers.add(userId);

        // Notify others in the conversation (exclude sender)
        socket.to(conversationId).emit("user-typing", {
          userId,
          userName: userName || 'User',
          conversationId,
          timestamp: new Date().toISOString()
        });

        console.log(`  ${userName || userId} started typing in ${conversationId}`);
      }

      // Set/reset auto-stop typing after 3 seconds of inactivity
      const timeout = setTimeout(() => {
        if (conversationTypingUsers && conversationTypingUsers.has(userId)) {
          conversationTypingUsers.delete(userId);

          // Clean up empty conversation sets
          if (conversationTypingUsers.size === 0) {
            typingUsers.delete(conversationId);
          }

          // Notify others that user stopped typing
          socket.to(conversationId).emit("user-stopped-typing", {
            userId,
            userName: userName || 'User',
            conversationId,
            reason: "timeout",
            timestamp: new Date().toISOString()
          });

          console.log(` ${userName || userId} auto-stopped typing (timeout)`);
        }
        typingTimeouts.delete(timeoutKey);
      }, 3000); // 3 seconds timeout

      typingTimeouts.set(timeoutKey, timeout);
    });

    //  Manual stop typing
    socket.on("stop-typing", ({ conversationId, userId, userName }) => {
      if (!conversationId || !userId) {
        return socket.emit("error", {
          message: "Missing required fields",
          required: ["conversationId", "userId"]
        });
      }

      const conversationTypingUsers = typingUsers.get(conversationId);
      const timeoutKey = `${conversationId}-${userId}`;

      if (conversationTypingUsers && conversationTypingUsers.has(userId)) {
        conversationTypingUsers.delete(userId);

        // Clean up empty conversation sets
        if (conversationTypingUsers.size === 0) {
          typingUsers.delete(conversationId);
        }

        // Clear timeout
        if (typingTimeouts.has(timeoutKey)) {
          clearTimeout(typingTimeouts.get(timeoutKey));
          typingTimeouts.delete(timeoutKey);
        }

        // Notify others that user stopped typing
        socket.to(conversationId).emit("user-stopped-typing", {
          userId,
          userName: userName || 'User',
          conversationId,
          reason: "manual",
          timestamp: new Date().toISOString()
        });

        console.log(` ${userName || userId} manually stopped typing`);
      }
    });

    //  Get current typing users in a conversation
    socket.on("get-typing-users", ({ conversationId }) => {
      if (!conversationId) {
        return socket.emit("error", {
          message: "Missing conversationId",
          code: "MISSING_CONVERSATION_ID"
        });
      }

      const conversationTypingUsers = typingUsers.get(conversationId);
      const typingUsersList = conversationTypingUsers ? Array.from(conversationTypingUsers) : [];

      socket.emit("typing-users-list", {
        conversationId,
        typingUsers: typingUsersList,
        count: typingUsersList.length,
        timestamp: new Date().toISOString()
      });

      console.log(` Sent typing users list for ${conversationId}: ${typingUsersList.length} users`);
    });

    // Handle sending a message
    socket.on("send-message", async ({ conversationId, sender, recipient, content }) => {
      const now = Date.now();

      // Rate Limiting: Prevent sending more than one message every 2 seconds
      if (messageRateLimit.has(sender) && now - messageRateLimit.get(sender) < 2000) {
        return socket.emit("error", { message: "You are sending messages too quickly!" });
      }

      // Update the last sent timestamp
      messageRateLimit.set(sender, now);

      try {
        // Create a new message and save it to the database
        const newMessage = await new Message({
          conversation: conversationId,
          sender,
          recipient,
          content,
        }).save();

        // Populate sender details before sending the message
        const populatedMessage = await newMessage.populate("sender", "username avatar");

        // Send the message only to users in the specific conversation room
        io.to(conversationId).emit("receive-message", populatedMessage);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Add support for message editing
    socket.on("edit-message", async ({ messageId, sender, content }) => {
      try {
        // Find the message by ID
        const message = await Message.findById(messageId);
        
        if (!message) {
          return socket.emit("error", { message: "Message not found" });
        }
        
        // Verify the sender is the original message author
        if (message.sender.toString() !== sender) {
          return socket.emit("error", { message: "You can only edit your own messages" });
        }
        
        // Update the message content and mark as edited
        message.content = content;
        message.edited = true;
        await message.save();
        
        // Populate sender details before sending the updated message
        const updatedMessage = await message.populate("sender", "username avatar");
        
        // Broadcast the edited message to all users in the conversation
        io.to(message.conversation.toString()).emit("message-edited", updatedMessage);
      } catch (error) {
        console.error("Error editing message:", error);
        socket.emit("error", { message: "Failed to edit message" });
      }
    });

    // Add support for message reactions
    socket.on("react-to-message", async ({ messageId, sender, emoji }) => {
      try {
        // Validate emoji
        const allowedReactions = ["like", "love", "haha", "sad", "angry", "wow", "care"];
        if (!allowedReactions.includes(emoji)) {
          return socket.emit("error", { message: "Invalid reaction emoji" });
        }
        
        // Find if user already reacted with this emoji
        const message = await Message.findById(messageId);
        if (!message) {
          return socket.emit("error", { message: "Message not found" });
        }
        
        // Check if user already has this reaction
        const existingReaction = message.reactions.find(
          reaction => reaction.user.toString() === sender && reaction.emoji === emoji
        );
        
        if (existingReaction) {
          // Remove the reaction if it already exists (toggle behavior)
          message.reactions = message.reactions.filter(
            reaction => !(reaction.user.toString() === sender && reaction.emoji === emoji)
          );
        } else {
          // Remove any existing reaction from this user
          message.reactions = message.reactions.filter(
            reaction => reaction.user.toString() !== sender
          );
          // Add the new reaction
          message.reactions.push({ user: sender, emoji });
        }
        
        await message.save();
        
        // Broadcast reaction update to all users in the conversation
        io.to(message.conversation.toString()).emit("message-reaction-updated", {
          messageId,
          reactions: message.reactions
        });
      } catch (error) {
        console.error("Error updating reaction:", error);
        socket.emit("error", { message: "Failed to update reaction" });
      }
    });

    // Add support for message read status
    socket.on("mark-read", async ({ conversationId, userId, messageIds }) => {
      try {
        // Update read status for multiple messages at once
        await Message.updateMany(
          { 
            _id: { $in: messageIds },
            readBy: { $ne: userId }
          },
          { 
            $addToSet: { readBy: userId } 
          }
        );
        
        // Notify other users that messages were read
        socket.to(conversationId).emit("messages-read", {
          reader: userId,
          messageIds
        });
      } catch (error) {
        console.error("Error marking messages as read:", error);
        socket.emit("error", { message: "Failed to mark messages as read" });
      }
    });

    // Add support for pinning messages
    socket.on("pin-message", async ({ messageId, userId, conversationId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) {
          return socket.emit("error", { message: "Message not found" });
        }
        
        // Toggle pin status
        message.isPinned = !message.isPinned;
        message.pinnedBy = message.isPinned ? userId : null;
        await message.save();
        
        // Notify all users in the conversation about the pin status change
        io.to(conversationId).emit("message-pin-updated", {
          messageId,
          isPinned: message.isPinned,
          pinnedBy: message.pinnedBy
        });
      } catch (error) {
        console.error("Error updating pin status:", error);
        socket.emit("error", { message: "Failed to update pin status" });
      }
    });

    // Add support for message forwarding
    socket.on("forward-message", async ({ originalMessageId, sender, targetConversationIds }) => {
      try {
        // Find the original message
        const originalMessage = await Message.findById(originalMessageId);
        if (!originalMessage) {
          return socket.emit("error", { message: "Original message not found" });
        }
        
        // Create new messages in each target conversation
        const forwardedMessages = [];
        
        for (const conversationId of targetConversationIds) {
          // Create a new message with the same content
          const newMessage = new Message({
            conversation: conversationId,
            sender,
            content: originalMessage.content,
            messageType: originalMessage.messageType,
            attachments: originalMessage.attachments,
            forwardedFrom: originalMessageId
          });
          
          await newMessage.save();
          const populatedMessage = await newMessage.populate("sender", "username avatar");
          forwardedMessages.push(populatedMessage);
          
          // Send the forwarded message to the target conversation
          io.to(conversationId).emit("receive-message", populatedMessage);
        }
        
        // Confirm to the sender that messages were forwarded
        socket.emit("messages-forwarded", {
          originalMessageId,
          forwardedMessages: forwardedMessages.map(msg => ({
            id: msg._id,
            conversationId: msg.conversation
          }))
        });
      } catch (error) {
        console.error("Error forwarding message:", error);
        socket.emit("error", { message: "Failed to forward message" });
      }
    });

    // Handle user disconnection and notify others
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);

      // Find user ID associated with this socket
      const userId = [...onlineUsers.entries()].find(([_, id]) => id === socket.id)?.[0];

      if (userId) {
        // Remove user from online users Map
        onlineUsers.delete(userId);

        // Clean up typing indicators for this user
        typingUsers.forEach((conversationTypingUsers, conversationId) => {
          if (conversationTypingUsers.has(userId)) {
            conversationTypingUsers.delete(userId);

            // Notify others that user stopped typing
            socket.to(conversationId).emit("user-stopped-typing", {
              userId,
              conversationId,
              reason: "disconnected",
              timestamp: new Date().toISOString()
            });

            // Clean up empty conversation sets
            if (conversationTypingUsers.size === 0) {
              typingUsers.delete(conversationId);
            }

            console.log(`👤 User ${userId} stopped typing due to disconnect in conversation ${conversationId}`);
          }
        });

        // Clear all typing timeouts for this user
        typingTimeouts.forEach((timeout, key) => {
          if (key.includes(userId)) {
            clearTimeout(timeout);
            typingTimeouts.delete(key);
          }
        });

        // Notify other users that this user is now offline
        io.emit("user-status-update", { userId, status: "offline" });
      }

      // Remove the user from all joined rooms
      socket.rooms.forEach((room) => socket.leave(room));
    });
  });
};

module.exports = { handleSocketConnection };
