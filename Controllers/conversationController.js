const mongoose = require("mongoose");
const Conversation = require("../Models/conversation.model");
const Message = require("../Models/message.model");

/**
 * Fetches all conversations for a user.
 * Includes last message and unread message count.
 */
module.exports.getUserConversations = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const conversations = await Conversation.find({ participants: userId })
      .populate("participants", "username email avatar")
      .sort({ updatedAt: -1 });

    const Conversations = await Promise.all(
      conversations.map(async (conversation) => {
        const lastMessage = await Message.findOne({ conversation: conversation._id })
          .sort({ createdAt: -1 })
          .select("content sender isRead createdAt");

        const unreadMessagesCount = await Message.countDocuments({
          conversation: conversation._id,
          recipient: userId,
          isRead: false,
        });

        return {
          _id: conversation._id,
          participants: conversation.participants,
          lastMessage: lastMessage || null,
          unreadMessages: unreadMessagesCount,
          updatedAt: conversation.updatedAt,
        };
      })
    );

    res.status(200).json(Conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "An error occurred while fetching conversations", details: error.message });
  }
};


 //Creates a new conversation between participants.

module.exports.createConversation = async (req, res) => {
  try {
    const { participants } = req.body;

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


 // Deletes a conversation and all associated messages.
 
module.exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ error: "Invalid conversation ID" });
    }

    await Message.deleteMany({ conversation: conversationId });
    await Conversation.findByIdAndDelete(conversationId);

    res.status(200).json({ message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
};


 // Renames a conversation.
 
module.exports.renameConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { newName } = req.body;

    if (!newName || newName.trim() === "") {
      return res.status(400).json({ error: "Conversation name cannot be empty" });
    }

    const updatedConversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { name: newName },
      { new: true }
    );

    if (!updatedConversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.status(200).json({ message: "Conversation renamed successfully", conversation: updatedConversation });
  } catch (error) {
    console.error("Error renaming conversation:", error);
    res.status(500).json({ error: "Failed to rename conversation" });
  }
};

/**
 * Adds or removes a participant from a conversation.
 */
module.exports.updateParticipants = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId, action } = req.body;

    if (!mongoose.Types.ObjectId.isValid(conversationId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid conversation ID or user ID" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

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

/**
 * Toggles a feature (Pin, Archive, Mute) for a user in a conversation.
 */
const toggleFeature = async (req, res, featureKey, featureName) => {
  try {
    const { conversationId, userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(conversationId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid conversation ID or user ID" });
    }

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


// Archive/Unarchive a conversation.

module.exports.archiveConversation = (req, res) => toggleFeature(req, res, "archivedUsers", "archive");


 // Mute/Unmute a conversation.
 
module.exports.muteConversation = (req, res) => toggleFeature(req, res, "mutedUsers", "mute");



