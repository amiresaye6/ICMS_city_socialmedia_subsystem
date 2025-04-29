const Message = require("./Models/message.model");
const Conversation = require("./Models/conversation.model");

const onlineUsers = new Map(); // Store online users in memory
const messageRateLimit = new Map(); // Track message sending timestamps for rate limiting

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

    // Notify others when a user is typing
    socket.on("typing", ({ conversationId, userId }) => {
      socket.to(conversationId).emit("user-typing", { userId });
    });

    // Notify when the user stops typing
    socket.on("stop-typing", ({ conversationId, userId }) => {
      socket.to(conversationId).emit("user-stopped-typing", { userId });
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

    // Handle user disconnection and notify others
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);

      // Find user ID associated with this socket
      const userId = [...onlineUsers.entries()].find(([_, id]) => id === socket.id)?.[0];

      if (userId) {
        // Remove user from Map
        onlineUsers.delete(userId);
        // Notify other users that this user is now offline
        io.emit("user-status-update", { userId, status: "offline" });
      }

      // Remove the user from all joined rooms
      socket.rooms.forEach((room) => socket.leave(room));
    });
  });
};

module.exports = { handleSocketConnection };
