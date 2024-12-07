const router = require('express').Router();
const commentsController = require("../Controllers/comments.controller");
const authMiddleware = require("../Middlewares/auth.middleware");

// Get comments with pagination
router.get('/', commentsController.getComments);

// Add a comment to a post
router.post('/', authMiddleware.authenticate, commentsController.createComment);

// Update an existing comment
router.put('/:commentId', authMiddleware.authenticate, commentsController.updateComment);

// Add a reply to a comment
// ==========>> not implmented yet
router.post('/:commentId/replies', authMiddleware.authenticate, commentsController.addReply);

// Delete an existing comment
router.delete('/:commentId', authMiddleware.authenticate, commentsController.deleteComment);

// React to a comment
// ==========>> not implmented yet
router.post('/:commentId/reactions', authMiddleware.authenticate, commentsController.reactToComment);

module.exports = router;
