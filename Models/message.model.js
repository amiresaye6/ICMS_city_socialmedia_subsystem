const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true // Add index for faster queries
    },
    sender: {
      type: String,
      required: true,
      index: true // Add index for faster queries
    },
    content: {
      type: String,
      trim: true,
      default: "",
    },
    messageType: {
      type: String,
      enum: ["text", "image", "video", "file", "audio", "location", "contact", "sticker"],
      default: "text",
    },
    attachments: [
      {
        url: String,
        fileType: String, // e.g., "image", "video", "pdf"
        fileName: String, // Add file name for better UX
        fileSize: Number, // Add file size information
        thumbnailUrl: String, // Add thumbnail for media files
      },
    ],
    replyTo: {
      type: String,
      ref: "Message",
      default: null,
    },
    reactions: [
      {
        user: {
          type: String,
        },
        emoji: {
          type: String,
          enum: ["like", "love", "haha", "sad", "angry", "wow", "care"],
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      },
    ],
    deliveredTo: [
      {
        type: String,
        ref: "User",
      },
    ],
    readBy: [
      {
        type: String,
        user: {
          type: String
        },
        readAt: {
          type: Date,
          default: Date.now
        }
      },
    ],
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedFor: [
      {
        type: String, // User IDs who deleted this message for themselves
      }
    ],
    edited: {
      type: Boolean,
      default: false,
    },
    editHistory: [
      {
        content: String,
        editedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    forwardedFrom: {
      type: String,
      ref: "Message",
      default: null,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    pinnedBy: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null, // For ephemeral messages
      index: true // Add index for TTL
    },
    mentions: [
      {
        user: {
          type: String,
          ref: "User"
        },
        startIndex: Number, // Position in the content string
        endIndex: Number
      }
    ],
    status: {
      type: String,
      enum: ["sent", "delivered", "read", "failed"],
      default: "sent"
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed, // For extensibility
      default: {}
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true }, // Include virtuals when converting to JSON
    toObject: { virtuals: true } // Include virtuals when converting to object
  }
);

// Add virtual for reaction counts
MessageSchema.virtual('reactionCounts').get(function() {
  const counts = {};
  this.reactions.forEach(reaction => {
    counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1;
  });
  return counts;
});

// Add compound index for common queries
MessageSchema.index({ conversation: 1, createdAt: -1 });
MessageSchema.index({ sender: 1, conversation: 1 });

// Add TTL index for ephemeral messages
MessageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { expiresAt: { $ne: null } } });

// Add text index for search functionality
MessageSchema.index({ content: 'text' });

// Middleware to handle message deletion
MessageSchema.pre('save', function(next) {
  if (this.isModified('deleted') && this.deleted) {
    // If message is being marked as deleted, clear sensitive content
    if (!this.content.startsWith("This message was deleted")) {
      // Store original content in metadata if needed for admin purposes
      this.metadata.set('originalContent', this.content);
      this.content = "This message was deleted";
      
      // Clear attachments but keep metadata about them
      if (this.attachments && this.attachments.length > 0) {
        this.metadata.set('hadAttachments', true);
        this.metadata.set('attachmentCount', this.attachments.length);
        this.attachments = [];
      }
    }
  }
  next();
});

// Method to safely get message content based on user permissions
MessageSchema.methods.getContentForUser = function(userId) {
  // If message is deleted for this specific user, return deleted message text
  if (this.deletedFor.includes(userId)) {
    return "This message was deleted";
  }
  
  // Otherwise return normal content
  return this.content;
};

const Message = mongoose.model("Message", MessageSchema);
module.exports = Message;
