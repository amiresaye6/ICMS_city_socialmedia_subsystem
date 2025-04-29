const express = require("express");
const authMiddleware = require("../Middlewares/auth.middleware");
const centralAuthMiddleware = require("../Middlewares/centralAuth.middleware");
const conversationController = require("../Controllers/conversationController");

const router = express.Router();

// Route to get all conversations for a specific user
router.get("/:userId", 
    centralAuthMiddleware.centralAuthenticate,
    conversationController.getUserConversations);

// Route to create a new conversation
router.post("/",
    centralAuthMiddleware.centralAuthenticate,
    conversationController.createConversation);

// Route to delete a conversation
router.delete("/:conversationId",
    centralAuthMiddleware.centralAuthenticate,
    conversationController.deleteConversation);

// Route to rename a conversation
router.put("/:conversationId/rename",
    centralAuthMiddleware.centralAuthenticate,
    conversationController.renameConversation);

// Route to add or remove participants in a conversation
router.put("/:conversationId/participants",
    centralAuthMiddleware.centralAuthenticate,
    conversationController.updateParticipants);
//  unread conversations 
router.get("/:conversationId/unread", 
    centralAuthMiddleware.centralAuthenticate, 
    conversationController.getUnreadConversations
);
// Route to pin or unpin a conversation
router.put("/:conversationId/pin/:userId",
    centralAuthMiddleware.centralAuthenticate,
    conversationController.pinConversation);

// Route to archive or unarchive a conversation
router.put("/:conversationId/archive/:userId",
    centralAuthMiddleware.centralAuthenticate,
    conversationController.archiveConversation);

// Route to mute or unmute a conversation
router.put("/:conversationId/mute/:userId", 
    centralAuthMiddleware.centralAuthenticate,
    conversationController.muteConversation);


module.exports = router;
