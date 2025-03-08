const express = require("express");

const conversationController = require("../Controllers/conversationController");

const router = express.Router();

// Route to get all conversations for a specific user
router.get("/:userId", conversationController.getUserConversations);

// Route to create a new conversation
router.post("/", conversationController.createConversation);

// Route to delete a conversation
router.delete("/:conversationId", conversationController.deleteConversation);

// Route to rename a conversation
router.put("/:conversationId/rename", conversationController.renameConversation);

// Route to add or remove participants in a conversation
router.put("/:conversationId/participants", conversationController.updateParticipants);

// Route to pin or unpin a conversation
router.put("/:conversationId/pin/:userId", conversationController.pinConversation);

// Route to archive or unarchive a conversation
router.put("/:conversationId/archive/:userId", conversationController.archiveConversation);

// Route to mute or unmute a conversation
router.put("/:conversationId/mute/:userId", conversationController.muteConversation);


module.exports = router;
