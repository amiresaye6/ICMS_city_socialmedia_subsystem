const express = require("express");
const messageController = require("../Controllers/messageController");
const router = express.Router();

// Send a new message
router.post("/send",messageController.sendMessage); 

// Get messages between two users
router.get("/:user1/:user2", messageController.getMessagesBetweenUsers);

// Mark messages as read between two users
router.put("/read/:user1/:user2", messageController.markMessagesAsRead);

// Edit a message
router.put("/:messageId/edit", messageController.editMessage);

// Soft delete a message
router.put("/:messageId/delete", messageController.deleteMessage);

// unsend a message
router.delete("/:messageId/unsends", messageController.unsendMessage);
// Add a reaction to a message
router.post("/:messageId/reaction", messageController.addReaction);

// Remove a reaction from a message
router.put("/:messageId/reaction/remove", messageController.removeReaction);



module.exports = router;
