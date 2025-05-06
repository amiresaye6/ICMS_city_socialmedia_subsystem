const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: String,
     
      required: true,
    },
    content: {
      type: String,
      trim: true,
      default: "",
    },
    messageType: {
      type: String,
      enum: ["text", "image", "video", "file", "audio"],
      default: "text",
    },
    attachments: [
      {
        url: String,
        fileType: String, // e.g., "image", "video", "pdf"
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
      },
    ],
    readBy: [
      {
        type: String,
       
      },
    ],
    deleted: {
      type: Boolean,
      default: false,
    },
    edited: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", MessageSchema);
module.exports = Message;
