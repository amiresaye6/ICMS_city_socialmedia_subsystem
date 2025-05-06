const mongoose = require("mongoose");
const Message = require("../Models/message.model");
const mime = require('mime-types'); 

/**
 * Helper function to validate ObjectIds.
 */
const validateUserId = (id, res, fieldName) => {
  if (typeof id !== "string" || !id.trim()) {
    res.status(400).json({ error: `Invalid ${fieldName} ID` });
    return false;
  }
  return true;
};


const validateObjectId = (id, res, fieldName = "ID") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: `Invalid ${fieldName}` });
    return false;
  }
  return true;
}; 
// Send a new message.const  

module.exports.sendMessage = async (req, res) => {
  try {
    const sender = req.user.userId;
    const { conversation, content, messageType, replyTo } = req.body;
    const files = req.files;


    // Validate required fields: either text or attachments must exist
    if (!conversation || !sender || (!content?.trim() && (!files || files.length === 0))) {
      return res.status(400).json({ error: "Message must have text or attachments" });
    }

    // Prepare attachments: extract URL and file type automatically using mime-types
    const attachments = files?.map(file => {
      const ext = mime.extension(file.mimetype); // Get file extension from mimetype
      let fileType = "file";

      // Check the file type and classify it
      if (file.mimetype.startsWith("image/")) fileType = "image";
      else if (file.mimetype.startsWith("video/")) fileType = "video";
      else if (file.mimetype.startsWith("audio/")) fileType = "audio";
      else if (ext === "pdf" || ext === "docx" || ext === "txt") fileType = "file";

      return {
        url: `/uploads/${file.filename}`,
        fileType,
      };
    }) || [];

    // If no content and no attachments, return an error
    if (!content && attachments.length === 0) {
      return res.status(400).json({ error: "Message must have text or attachments" });
    }

    const newMessage = new Message({
      conversation,
      sender,
      content: content || "",
      messageType: messageType || (attachments.length ? attachments[0].fileType : "text"),  // If no text, use first attachment's type
      attachments,
      replyTo: replyTo || null,
    });

    // Save the message to the database
    await newMessage.save();

    res.status(201).json({ message: "Message sent", data: newMessage });
  } catch (error) {
    res.status(500).json({ error: "Error sending message", details: error.message });
  }
};


/**
 * Retrieve messages between two users.
 */
module.exports.getMessagesBetweenUsers = async (req, res) => {
  try {
    const user1 =req.user.userId
    const {user2 } = req.params;

    if (!validateObjectId(user1, res, "user1") || !validateObjectId(user2, res, "user2")) {
      return;
    }
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const conversation = await Conversation.findOne({
      participants: { $all: [user1, user2] },
    }); 

    const messages = await Message.find({
    
         sender: user1, recipient: user2 
        
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
 */module.exports.markMessagesAsRead = async (req, res) => {
  try {
    const UserId = req.user.userId; 
    const { userId: otherUserId } = req.params;

    if (!validateUserId(UserId, res, "User") || !validateUserId(otherUserId, res, "otherUser")) {
      return;
    }

    await Message.updateMany(
      {
        sender: otherUserId,
        readBy: { $ne: UserId }
      },
      {
        $addToSet: { readBy: UserId }
      }
    );

    res.status(200).json({ message: "Messages marked as read " });
  } catch (error) {
    res.status(500).json({ error: "Error updating messages", details: error.message });
  }
};



/**
 * Edit a message.
 */

module.exports.editMessage = async (req, res) => {
  try {
    // Extract message ID from URL parameters and new text from the request body
    const { messageId } = req.params;
    const { text } = req.body;

    // Get the currently authenticated user's ID
    const userId = req.user.userId;

    // Validate the message ID format
    if (!validateObjectId(messageId, res, "message")) return;

    // Ensure the new text is not empty or invalid
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Text content is required" });
    }

    // Find the message by its ID
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Only allow the original sender to edit their own message
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ error: "You are not authorized to edit this message" });
    }

    // Update the message content and mark it as edited
    message.content = text.trim();
    message.edited = true;
    await message.save();

    // Send success response with the updated message
    res.status(200).json({ message: "Message edited successfully", data: message });

  } catch (error) {
    // Catch and handle any unexpected errors
    console.error("Error editing message:", error);
    res.status(500).json({ error: "Error editing message", details: error.message });
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
    const sender = req.user.userId;
    const { messageId } = req.params;

    if (!messageId || !sender) {
      return res.status(400).json({ error: "messageId and userId are required" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    message.reactions = message.reactions.filter(
      reaction => reaction.user.toString() !== sender
    );

    await message.save();

    res.status(200).json({ message: "Reaction removed successfully", data: message });
  } catch (error) {
    res.status(500).json({ error: "Error removing reaction" });
  }
};

