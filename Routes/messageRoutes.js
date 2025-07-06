const express = require("express");
const messageController = require("../Controllers/messageController");
const router = express.Router();
const authMiddleware = require("../Middlewares/auth.middleware");
const centralAuthMiddleware = require("../Middlewares/centralAuth.middleware");
const { upload, processImage } = require("../Middlewares/fileUpload.middleware");



// Send a new message with or without attachment (upload files if any)
router.post("/send",
centralAuthMiddleware.centralAuthenticate,
upload.array('attachments', 10),
processImage,
 messageController.sendMessage);

// Get messages between two users
router.get("/:user1/:user2",
    centralAuthMiddleware.centralAuthenticate,
    messageController.getMessagesBetweenUsers);
    
// Messages marked as delivered
    router.put("/delivered/:userId", 
        centralAuthMiddleware.centralAuthenticate, 
        messageController.markMessagesAsDelivered);
 
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



// Forward a message
router.post("/forward",
    centralAuthMiddleware.centralAuthenticate,
    messageController.forwardMessage);

// Pin/Unpin a message
router.put("/:messageId/pin", 
    centralAuthMiddleware.centralAuthenticate,
    messageController.togglePinMessage);

// Get pinned messages
router.get("/pinned/:conversationId", 
    centralAuthMiddleware.centralAuthenticate,
    messageController.getPinnedMessages);

module.exports = router;
