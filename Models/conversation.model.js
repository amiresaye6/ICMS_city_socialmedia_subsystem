const mongoose = require("mongoose");
const ConversationSchema = new mongoose.Schema(
  {
    // Array of participant user IDs (at least 2 users are required)
    participants: {
      type: [{ type: String,
        
         required: true }],
      validate: {
        validator: function (participants) {
          return participants.length >= 2; // Ensures at least 2 participants
        },
        message: "A conversation must have at least 2 participants.",
      },
    },
    mutedUsers: [{
       type: String, 
         }],
    
    archivedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Stores the last message of the conversation (optional)
    lastMessage: {
      type: String,
      ref: "Message",
      default: null, // Stores the latest message ID instead of text for better consistency
    },

    // Indicates if this conversation is a group chat
    isGroup: {
      type: Boolean,
      default: false,
    },

    // Group chat name (only applicable if isGroup is true)
    groupName: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: true } // Automatically manages createdAt and updatedAt fields
);

// Indexing for optimized query performance
ConversationSchema.index({ participants: 1 }); // Helps in finding conversations by participants
ConversationSchema.index({ updatedAt: -1 }); // Sorts conversations by latest activity

module.exports = mongoose.model("Conversation", ConversationSchema);
