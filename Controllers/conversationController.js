const mongoose = require("mongoose");
const Conversation = require("../Models/conversation.model");
const Message = require("../Models/message.model");

/**
 * Fetches all conversations for a user.
 * Includes last message and unread message count.
 */
module.exports.getUserConversations = async (req, res) => {
  try {
    const { userId } = req.user; // Use userId from the JWT token instead of req.params

    // Start aggregation pipeline to fetch user conversations
    const conversations = await Conversation.aggregate([
      // Step 1: Match conversations where the userId is one of the participants
      { $match: { participants: userId } },

      // Step 2: Lookup the last message for each conversation
      { $lookup: {
        from: 'messages', // The 'messages' collection
        let: { conversationId: '$_id' }, // Pass the current conversationId for comparison
        pipeline: [
          { $match: { $expr: { $eq: ['$conversation', '$$conversationId'] } } },
          { $sort: { createdAt: -1 } }, // Sort by creation date (latest message first)
          { $limit: 1 }, // Limit to the latest message
          { $project: { content: 1, sender: 1, isRead: 1, createdAt: 1 } } // Project relevant fields
        ],
        as: 'lastMessage' // Store the last message in the `lastMessage` field
      }},
      
      // Step 3: Unwind the 'lastMessage' array to get the last message object
      { $unwind: { path: '$lastMessage', preserveNullAndEmptyArrays: true } },

      // Step 4: Lookup to count unread messages for the user
      { $lookup: {
        from: 'messages',
        let: { conversationId: '$_id' },
        pipeline: [
          { $match: { $expr: { $and: [{ $eq: ['$conversation', '$$conversationId'] }, { $eq: ['$recipient', userId] }, { $eq: ['$isRead', false] }] } } },
          { $count: 'unreadMessages' } // Count unread messages
        ],
        as: 'unreadMessagesCount'
      }},

      // Step 5: Unwind the 'unreadMessagesCount' array to get the count
      { $unwind: { path: '$unreadMessagesCount', preserveNullAndEmptyArrays: true } },

      // Step 6: Project the final output, ensuring the unread message count is 0 if no unread messages found
      { $project: {
        _id: 1,
        participants: 1,
        lastMessage: 1,
        unreadMessages: { $ifNull: ['$unreadMessagesCount.unreadMessages', 0] },
        updatedAt: 1
      }}
    ]);

    // Send the response with the conversations
    res.status(200).json(conversations);

  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "An error occurred while fetching conversations", details: error.message });
  }
};

/**
 * Creates a new conversation between participants.
 */
module.exports.createConversation = async (req, res) => {
  try {
    const { participants } = req.body;

    // Validate participants array
    if (!participants || !Array.isArray(participants) || participants.length < 2) {
      return res.status(400).json({ error: "A conversation must have at least two participants" });
    }

    const newConversation = new Conversation({ participants });
    await newConversation.save();

    res.status(201).json({ message: "Conversation created", conversation: newConversation });
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
};

/**
 * Deletes a conversation and all associated messages.
 */
module.exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Validate conversationId format
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ error: "Invalid conversation ID" });
    }

    // Delete messages and conversation
    await Message.deleteMany({ conversation: conversationId });
    await Conversation.findByIdAndDelete(conversationId);

    res.status(200).json({ message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
};

/**
 * Renames a conversation.
 */
module.exports.renameConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { newName } = req.body;
    const userId = req.user.userId;

    // Validate new name
    if (!newName || newName.trim() === "") {
      return res.status(400).json({ error: "Conversation name cannot be empty" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Check if the user is a participant of the conversation
    if (!conversation.participants.includes(req.user.userId)) {
      return res.status(403).json({ error: "Forbidden: You are not a participant in this conversation" });
    }

    const updatedConversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { name: newName },
      { new: true }
    );

    res.status(200).json({ message: "Conversation renamed successfully", conversation: updatedConversation });
  } catch (error) {
    console.error("Error renaming conversation:", error);
    res.status(500).json({ error: "Failed to rename conversation" });
  }
};

/**
 * 
 * Adds or removes a participant from a conversation.
 */
module.exports.updateParticipants = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId, action } = req.body;

    // Validate conversationId and userId formats
    if (!mongoose.Types.ObjectId.isValid(conversationId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid conversation ID or user ID" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Check if the user is a participant of the conversation
    if (!conversation.participants.includes(req.user.userId)) {
      return res.status(403).json({ error: "Forbidden: You are not a participant in this conversation" });
    }

    // Add or remove the participant
    if (action === "add") {
      if (!conversation.participants.includes(userId)) {
        conversation.participants.push(userId);
      }
    } else if (action === "remove") {
      conversation.participants = conversation.participants.filter((id) => id.toString() !== userId);
    } else {
      return res.status(400).json({ error: "Invalid action. Use 'add' or 'remove'" });
    }

    await conversation.save();

    res.status(200).json({ message: `User ${action}ed successfully`, conversation });
  } catch (error) {
    console.error("Error updating participants:", error);
    res.status(500).json({ error: "Failed to update participants" });
  }
};
 

//  unread conversations
module.exports.getUnreadConversations = async (req, res) => {
  try {
    const userId = req.user.id; // Get the current user's ID

    // Get conversation IDs with unread messages
    const unreadConversationIds = await Message.find({
      recipientId: userId,
      isRead: false
    }).distinct('conversationId');

    if (unreadConversationIds.length === 0) {
      return res.status(200).json([]); // No unread conversations
    }

    // Fetch conversation details
    const unreadConversations = await Conversation.find({
      _id: { $in: unreadConversationIds }
    })
    .populate('members', 'username profilePic') // Populate member details
    .sort({ updatedAt: -1 }); // Sort by latest updatedAt

    // Fetch the last message for each conversation
    const conversationsWithLastMessage = await Promise.all(
      unreadConversations.map(async (conversation) => {
        const lastMessage = await Message.findOne({
          conversationId: conversation._id
        })
        .sort({ createdAt: -1 })
        .select('text senderId recipientId createdAt');

        return {
          conversation,
          lastMessage
        };
      })
    );

    // Send the result
    res.status(200).json(conversationsWithLastMessage);

  } catch (error) {
    console.error('Error fetching unread conversations:', error.message);
    res.status(500).json({ message: 'Failed to fetch unread conversations' });
  }
};




/**
 * Toggles a feature (Pin, Archive, Mute) for a user in a conversation.
 */
const toggleFeature = async (req, res, featureKey, featureName) => {
  try {
    const { conversationId, userId } = req.params;


    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    if (!conversation[featureKey]) conversation[featureKey] = [];
    if (conversation[featureKey].includes(userId)) {
      conversation[featureKey] = conversation[featureKey].filter((id) => id.toString() !== userId);
    } else {
      conversation[featureKey].push(userId);
    }

    await conversation.save();

    res.status(200).json({ message: `Conversation ${featureName} status updated`, conversation });
  } catch (error) {
    console.error(`Error updating ${featureName} status:`, error);
    res.status(500).json({ error: `Failed to update ${featureName} status` });
  }
};

// pin / unpin
module.exports.pinConversation = (req, res) => toggleFeature(req, res, "pinnedUsers", "pin");

// Archive/Unarchive a conversation
module.exports.archiveConversation = (req, res) => toggleFeature(req, res, "archivedUsers", "archive");

// Mute/Unmute a conversation
module.exports.muteConversation = (req, res) => toggleFeature(req, res, "mutedUsers", "mute");

/**
 * Get pinned conversations for a user
 */
module.exports.getPinnedConversations = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const pinnedConversations = await Conversation.find({
      pinnedUsers: userId
    })
    .sort({ updatedAt: -1 })
    .populate('participants', 'userName avatarUrl');
    
    // Fetch the last message for each conversation
    const conversationsWithLastMessage = await Promise.all(
      pinnedConversations.map(async (conversation) => {
        const lastMessage = await Message.findOne({
          conversationId: conversation._id
        })
        .sort({ createdAt: -1 })
        .select('content sender createdAt');

        return {
          conversation,
          lastMessage
        };
      })
    );
    
    res.status(200).json(conversationsWithLastMessage);
  } catch (error) {
    console.error("Error fetching pinned conversations:", error);
    res.status(500).json({ error: "Failed to fetch pinned conversations" });
  }
};

/**
 * Get all conversations for a user with unread counts and last message
 */
module.exports.getConversationsForUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Validate that the requesting user is fetching their own conversations
    if (userId !== req.user.userId) {
      return res.status(403).json({ error: "Forbidden: You can only view your own conversations" });
    }

    // Find all conversations where the user is a participant and not deleted for them
    const conversations = await Conversation.find({
      participants: userId,
      deletedFor: { $ne: userId }
    })
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

    // Get unread counts for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        // Count unread messages
        const unreadCount = await Message.countDocuments({
          conversation: conversation._id,
          sender: { $ne: userId },
          readBy: { $ne: userId },
          createdAt: { $gt: conversation.userSettings.find(s => s.userId === userId)?.lastSeen || new Date(0) }
        });

        // Format the response
        return {
          _id: conversation._id,
          name: conversation.getNameForUser(userId),
          isGroup: conversation.isGroup,
          participants: conversation.participants,
          lastMessage: conversation.lastMessage,
          unreadCount,
          isPinned: conversation.pinnedUsers.includes(userId),
          isArchived: conversation.archivedUsers.includes(userId),
          isMuted: conversation.isMuted(userId),
          updatedAt: conversation.updatedAt,
          userSettings: conversation.getUserSettings(userId)
        };
      })
    );

    // Sort by pinned status first, then by last message date
    conversationsWithUnread.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

    res.status(200).json(conversationsWithUnread);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

/**
 * Create a new group conversation
 */
module.exports.createGroupConversation = async (req, res) => {
  try {
    const { name, participants } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!name || !participants || !Array.isArray(participants) || participants.length < 2) {
      return res.status(400).json({ 
        error: "Invalid input. Group name and at least 2 participants are required" 
      });
    }

    // Ensure the creator is included in participants
    if (!participants.includes(userId)) {
      participants.push(userId);
    }

    // Create the group conversation
    const conversation = await Conversation.create({
      name,
      participants,
      isGroup: true,
      groupAdmin: userId,
      groupSettings: {
        description: req.body.description || "",
        avatar: req.body.avatar || null
      }
    });

    res.status(201).json({ 
      message: "Group conversation created successfully", 
      conversation 
    });
  } catch (error) {
    console.error("Error creating group conversation:", error);
    res.status(500).json({ error: "Failed to create group conversation" });
  }
};

/**
 * Update group settings
 */
module.exports.updateGroupSettings = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;
    const { name, description, avatar, permissions } = req.body;

    // Find the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Check if it's a group conversation
    if (!conversation.isGroup) {
      return res.status(400).json({ error: "This is not a group conversation" });
    }

    // Check if the user is an admin
    if (conversation.groupAdmin !== userId) {
      return res.status(403).json({ 
        error: "Forbidden: Only group admin can update group settings" 
      });
    }

    // Update the settings
    if (name) conversation.name = name;
    
    if (description !== undefined) {
      conversation.groupSettings.description = description;
    }
    
    if (avatar !== undefined) {
      conversation.groupSettings.avatar = avatar;
    }
    
    if (permissions) {
      // Update permissions if provided
      Object.keys(permissions).forEach(key => {
        if (conversation.groupSettings.permissions[key] !== undefined) {
          conversation.groupSettings.permissions[key] = permissions[key];
        }
      });
    }

    await conversation.save();

    res.status(200).json({ 
      message: "Group settings updated successfully", 
      conversation 
    });
  } catch (error) {
    console.error("Error updating group settings:", error);
    res.status(500).json({ error: "Failed to update group settings" });
  }
};

/**
 * Generate or refresh group join link
 */
module.exports.generateJoinLink = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;
    const { expiryHours } = req.body;

    // Find the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Check if it's a group conversation
    if (!conversation.isGroup) {
      return res.status(400).json({ error: "This is not a group conversation" });
    }

    // Check if the user is an admin
    if (conversation.groupAdmin !== userId) {
      return res.status(403).json({ 
        error: "Forbidden: Only group admin can generate join links" 
      });
    }

    // Generate a unique join link
    const joinCode = crypto.randomBytes(6).toString('hex');
    const joinLink = `http://graduation.amiralsayed.me/join/${joinCode}`;
    
    // Set expiry if provided
    let joinLinkExpiry = null;
    if (expiryHours && !isNaN(expiryHours)) {
      joinLinkExpiry = new Date();
      joinLinkExpiry.setHours(joinLinkExpiry.getHours() + parseInt(expiryHours));
    }

    // Update the conversation
    conversation.groupSettings.joinLink = joinLink;
    conversation.groupSettings.joinLinkExpiry = joinLinkExpiry;
    await conversation.save();

    res.status(200).json({ 
      message: "Join link generated successfully", 
      joinLink,
      expiresAt: joinLinkExpiry
    });
  } catch (error) {
    console.error("Error generating join link:", error);
    res.status(500).json({ error: "Failed to generate join link" });
  }
};

/**
 * Join a group conversation using a join link
 */
module.exports.joinGroupWithLink = async (req, res) => {
  try {
    const { joinCode } = req.params;
    const userId = req.user.userId;

    // Find the conversation with this join link
    const conversation = await Conversation.findOne({
      'groupSettings.joinLink': { $regex: joinCode }
    });

    if (!conversation) {
      return res.status(404).json({ error: "Invalid or expired join link" });
    }

    // Check if the link has expired
    if (conversation.groupSettings.joinLinkExpiry && 
        new Date() > conversation.groupSettings.joinLinkExpiry) {
      return res.status(400).json({ error: "Join link has expired" });
    }

    // Check if user is already a participant
    if (conversation.participants.includes(userId)) {
      return res.status(400).json({ error: "You are already a member of this group" });
    }

    // Add user to participants
    conversation.participants.push(userId);
    
    // If user previously left, remove from leftUsers
    conversation.leftUsers = conversation.leftUsers.filter(
      user => user.userId !== userId
    );
    
    await conversation.save();

    res.status(200).json({ 
      message: "Successfully joined the group", 
      conversation 
    });
  } catch (error) {
    console.error("Error joining group:", error);
    res.status(500).json({ error: "Failed to join group" });
  }
};

/**
 * Leave a group conversation
 */
module.exports.leaveGroup = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    // Find the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Check if it's a group conversation
    if (!conversation.isGroup) {
      return res.status(400).json({ error: "This is not a group conversation" });
    }

    // Check if user is a participant
    if (!conversation.participants.includes(userId)) {
      return res.status(400).json({ error: "You are not a member of this group" });
    }

    // If user is the admin and there are other participants, transfer admin role
    if (conversation.groupAdmin === userId && conversation.participants.length > 1) {
      // Find another participant to make admin
      const newAdmin = conversation.participants.find(p => p !== userId);
      conversation.groupAdmin = newAdmin;
    }

    // Remove user from participants
    conversation.participants = conversation.participants.filter(
      p => p !== userId
    );
    
    // Add to leftUsers
    conversation.leftUsers.push({
      userId,
      leftAt: new Date()
    });
    
    // If no participants left, delete the conversation
    if (conversation.participants.length === 0) {
      await Conversation.findByIdAndDelete(conversationId);
      return res.status(200).json({ message: "You left the group and it was deleted (no members left)" });
    }
    
    await conversation.save();

    res.status(200).json({ message: "You have left the group successfully" });
  } catch (error) {
    console.error("Error leaving group:", error);
    res.status(500).json({ error: "Failed to leave group" });
  }
};

/**
 * Update user-specific settings for a conversation
 */
module.exports.updateUserSettings = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;
    const { nickname, color, notifications } = req.body;

    // Find the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Check if user is a participant
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ 
        error: "Forbidden: You are not a participant in this conversation" 
      });
    }

    // Find existing settings or create new ones
    let userSettings = conversation.userSettings.find(
      setting => setting.userId === userId
    );
    
    if (!userSettings) {
      userSettings = { userId };
      conversation.userSettings.push(userSettings);
    }
    
    // Update settings
    if (nickname !== undefined) userSettings.nickname = nickname;
    if (color !== undefined) userSettings.color = color;
    if (notifications !== undefined) userSettings.notifications = notifications;
    
    await conversation.save();

    res.status(200).json({ 
      message: "User settings updated successfully", 
      settings: userSettings 
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    res.status(500).json({ error: "Failed to update user settings" });
  }
};

/**
 * Delete conversation for a user (soft delete)
 */
module.exports.deleteConversationForUser = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    // Find the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Check if user is a participant
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ 
        error: "Forbidden: You are not a participant in this conversation" 
      });
    }

    // Add user to deletedFor array
    if (!conversation.deletedFor.includes(userId)) {
      conversation.deletedFor.push(userId);
    }
    
    await conversation.save();

    res.status(200).json({ message: "Conversation deleted successfully for you" });
  } catch (error) {
    console.error("Error deleting conversation for user:", error);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
};
