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
