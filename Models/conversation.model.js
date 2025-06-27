const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: null, // For group conversations
    },
    participants: [
      {
        type: String,
        ref: "User",
        required: true,
      },
    ],
    isGroup: {
      type: Boolean,
      default: false,
    },
    groupAdmin: {
      type: String,
      ref: "User",
      default: null, // Only relevant for group conversations
    },
    pinnedUsers: [
      {
        type: String,
        ref: "User",
      },
    ],
    archivedUsers: [
      {
        type: String,
        ref: "User",
      },
    ],
    mutedUsers: [
      {
        type: String,
        ref: "User",
        // Add mute expiration time
        expires: {
          type: Date,
          default: null, // null means muted indefinitely
        },
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    pinnedMessages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
    theme: {
      type: String,
      default: "default",
    },
    emoji: {
      type: String,
      default: "👍",
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Track user-specific settings
    userSettings: [
      {
        userId: {
          type: String,
          ref: "User",
        },
        nickname: {
          type: String,
          default: null,
        },
        notifications: {
          type: Boolean,
          default: true,
        },
        color: {
          type: String,
          default: "#0084FF",
        },
        lastSeen: {
          type: Date,
          default: null,
        },
      },
    ],
    // For group conversations
    groupSettings: {
      joinLink: {
        type: String,
        default: null,
      },
      joinLinkExpiry: {
        type: Date,
        default: null,
      },
      permissions: {
        sendMessages: {
          type: String,
          enum: ["all", "admins"],
          default: "all",
        },
        addMembers: {
          type: String,
          enum: ["all", "admins"],
          default: "all",
        },
        removeMembers: {
          type: String,
          enum: ["all", "admins"],
          default: "admins",
        },
        editGroupInfo: {
          type: String,
          enum: ["all", "admins"],
          default: "admins",
        },
      },
      description: {
        type: String,
        default: "",
      },
      avatar: {
        type: String,
        default: null,
      },
    },
    // Track deleted conversations per user
    deletedFor: [
      {
        type: String,
        ref: "User",
      },
    ],
    // Track when users left the conversation (for groups)
    leftUsers: [
      {
        userId: {
          type: String,
          ref: "User",
        },
        leftAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Add compound index for faster queries
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ pinnedUsers: 1 });
ConversationSchema.index({ archivedUsers: 1 });

// Virtual for getting unread messages count for a specific user
ConversationSchema.virtual("unreadCount").get(function () {
  return 0; // This will be populated by the controller
});

// Method to check if a user is a participant
ConversationSchema.methods.isParticipant = function (userId) {
  return this.participants.includes(userId);
};

// Method to check if a user is an admin (for group conversations)
ConversationSchema.methods.isAdmin = function (userId) {
  if (!this.isGroup) return false;
  return this.groupAdmin === userId;
};

// Method to get user-specific settings
ConversationSchema.methods.getUserSettings = function (userId) {
  const settings = this.userSettings.find(
    (setting) => setting.userId.toString() === userId
  );
  return settings || { notifications: true, color: "#0084FF" };
};

// Method to check if conversation is muted for a user
ConversationSchema.methods.isMuted = function (userId) {
  const mutedUser = this.mutedUsers.find(
    (user) => user.toString() === userId
  );
  
  if (!mutedUser) return false;
  
  // Check if mute has expired
  if (mutedUser.expires && mutedUser.expires < new Date()) {
    // Mute has expired, remove user from mutedUsers
    this.mutedUsers = this.mutedUsers.filter(
      (user) => user.toString() !== userId
    );
    this.save();
    return false;
  }
  
  return true;
};

// Method to get conversation name for a specific user
ConversationSchema.methods.getNameForUser = function (userId) {
  // If it's a named group, return the name
  if (this.name) return this.name;
  
  // For direct conversations, return the other participant's name
  if (this.participants.length === 2) {
    const otherParticipant = this.participants.find(
      (participant) => participant.toString() !== userId
    );
    
    // This would need to be populated with user data
    return otherParticipant ? otherParticipant.username || "User" : "Unknown";
  }
  
  // Fallback for unnamed groups
  return `Group with ${this.participants.length} participants`;
};

// Pre-save middleware to ensure group conversations have a name
ConversationSchema.pre("save", function (next) {
  if (this.isGroup && !this.name) {
    this.name = `Group (${this.participants.length})`;
  }
  next();
});

const Conversation = mongoose.model("Conversation", ConversationSchema);
module.exports = Conversation;
