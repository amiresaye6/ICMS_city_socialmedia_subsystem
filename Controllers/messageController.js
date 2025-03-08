const mongoose = require("mongoose");
const Message = require("../Models/message.model");

/**
 * Helper function to validate ObjectIds.
 */
const validateObjectId = (id, res, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: `Invalid ${fieldName} ID` });
    return false;
  }
  return true;
};

/*
 * Send a new message.
 */
module.exports.sendMessage = async (req, res) => {
  try {
    const { conversation, sender, text, messageType, attachments, replyTo } = req.body;

    if (!conversation || !sender || (!text?.trim() && !attachments?.length)) {
      return res.status(400).json({ error: "Message must have either text or attachments" });
    }

    if (!validateObjectId(sender, res, "sender") || !validateObjectId(conversation, res, "conversation")) {
      return;
    }

    const newMessage = new Message({
      conversation,
      sender,
      content: text || "",
      messageType: messageType || "text",
      attachments: attachments || [],
      replyTo: replyTo || null,
    });
    
    await newMessage.save();

    res.status(201).json({ message: "Message sent successfully", data: newMessage });
  } catch (error) {
    res.status(500).json({ error: "Error sending message", details: error.message });
  }
};

/**
 * Retrieve messages between two users.
 */
module.exports.getMessagesBetweenUsers = async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    if (!validateObjectId(user1, res, "user1") || !validateObjectId(user2, res, "user2")) {
      return;
    }

    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "username avatar")
      .populate("replyTo")
      .populate("reactions.user", "username avatar");

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Error fetching messages" });
  }
};

/**
 * Mark messages as read between two users.
 */
module.exports.markMessagesAsRead = async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    if (!validateObjectId(user1, res, "user1") || !validateObjectId(user2, res, "user2")) {
      return;
    }

    await Message.updateMany(
      { sender: user1, recipient: user2, readBy: { $ne: user2 } },
      { $addToSet: { readBy: user2 } }
    );

    res.status(200).json({ message: "Seen" });
  } catch (error) {
    res.status(500).json({ error: "Error updating messages" });
  }
};

/**
 * Edit a message.
 */
module.exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;

    if (!validateObjectId(messageId, res, "message")) {
      return;
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { content: text, edited: true },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.status(200).json({ message: "Message edited successfully", data: updatedMessage });
  } catch (error) {
    res.status(500).json({ error: "Error editing message" });
  }
};

/**
 * Soft delete a message.
 */
module.exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    if (!validateObjectId(messageId, res, "message")) {
      return;
    }

    const deletedMessage = await Message.findByIdAndUpdate(
      messageId,
      { deleted: true, content: "This message was deleted." },
      { new: true }
    );

    if (!deletedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.status(200).json({ message: "Message deleted successfully", data: deletedMessage });
  } catch (error) {
    res.status(500).json({ error: "Error deleting message" });
  }
};

/**
 * Unsend a message (permanent deletion).
 */
module.exports.unsendMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    if (!validateObjectId(messageId, res, "message")) {
      return;
    }

    const deletedMessage = await Message.findByIdAndDelete(messageId);

    if (!deletedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.status(200).json({ message: "Message unsent successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error unsending message" });
  }
};

/**
 * Add a reaction to a message.
 */
module.exports.addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId, emoji } = req.body;

    if (!validateObjectId(messageId, res, "message") || !validateObjectId(userId, res, "user")) {
      return;
    }

    const allowedReactions = ["like", "love", "haha", "sad", "angry", "wow", "care"];
    if (!allowedReactions.includes(emoji)) {
      return res.status(400).json({ error: "Invalid reaction emoji" });
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { $addToSet: { reactions: { user: userId, emoji } } },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.status(200).json({ message: "Reaction added successfully", data: updatedMessage });
  } catch (error) {
    res.status(500).json({ error: "Error adding reaction" });
  }
}; 


module.exports.removeReaction = async (req, res) => {
  try {
    const { userId } = req.body;
    const { messageId } = req.params;    

    if (!messageId || !userId) {
      return res.status(400).json({ error: "messageId and userId are required" });
    }

  
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    message.reactions = message.reactions.filter(reaction => reaction.user.toString() !== userId);

   
    await message.save();

    res.status(200).json({ message: "Reaction removed successfully", data: message });
  } catch (error) {
    res.status(500).json({ error: "Error removing reaction", details: error.message });
  }
};

