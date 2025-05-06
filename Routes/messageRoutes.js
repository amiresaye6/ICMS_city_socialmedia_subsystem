const express = require("express");
const messageController = require("../Controllers/messageController");
const router = express.Router();
const authMiddleware = require("../Middlewares/auth.middleware");
const centralAuthMiddleware = require("../Middlewares/centralAuth.middleware");
const upload = require("../Middlewares/fileUpload.middleware");



// Send a new message with or without attachment (upload files if any)
router.post("/send", upload.array('attachments', 10),
centralAuthMiddleware.centralAuthenticate,
 messageController.sendMessage); 

// Get messages between two users
router.get("/:user1/:user2",
    centralAuthMiddleware.centralAuthenticate,
    messageController.getMessagesBetweenUsers);

// Mark messages as read between two users
router.put("/read/:userId",
    centralAuthMiddleware.centralAuthenticate,
    messageController.markMessagesAsRead);

// Edit a message
router.put("/:messageId/edit",
    centralAuthMiddleware.centralAuthenticate,
    messageController.editMessage);

// Soft delete a message
router.put("/:messageId/delete", 
    centralAuthMiddleware.centralAuthenticate,
    messageController.deleteMessage);

// unsend a message
router.delete("/:messageId/unsends",
    centralAuthMiddleware.centralAuthenticate,
    messageController.unsendMessage);

// Add a reaction to a message
router.post("/:messageId/reaction", 
    centralAuthMiddleware.centralAuthenticate,
    messageController.addReaction);

// Remove a reaction from a message
router.put("/:messageId/reaction/remove", 
    centralAuthMiddleware.centralAuthenticate,
    messageController.removeReaction);

module.exports = router;
