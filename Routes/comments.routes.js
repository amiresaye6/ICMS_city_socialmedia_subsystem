const router = require('express').Router();
const commentsController = require("../Controllers/comments.controller");

// Get comments with pagination
router.get('/', commentsController.getComments);

// Add a comment to a post
router.post('/', commentsController.createComment);

// Update an existing comment
router.put('/:commentId', commentsController.updateComment);

// Add a reply to a comment
router.post('/:commentId/replies', commentsController.addReply);

// Delete an existing comment
router.delete('/:commentId', commentsController.deleteComment);

// React to a comment
router.post('/:commentId/reactions', commentsController.reactToComment);

module.exports = router;
