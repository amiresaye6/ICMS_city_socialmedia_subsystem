const router = require('express').Router();
const commentsController = require("../Controllers/comments.controller");
const { centralAuthenticate } = require('../Middlewares/centralAuth.middleware');

// Fetch all comments
router.get('/', commentsController.getComments);

// Fetch comments by post ID (including replies)
router.get('/post/:postId', commentsController.getCommentsByPostId);

// Create a new comment or reply
router.post('/post/:postId', centralAuthenticate, commentsController.createComment);

// Update an existing comment
router.put('/:commentId', centralAuthenticate, commentsController.updateComment);

// Delete all comments (for testing purposes only)
router.delete("/allComments", commentsController.deleteAllComments);

// Delete an existing comment (and its replies recursively)
router.delete('/:commentId', centralAuthenticate, commentsController.deleteComment);

// React to a comment (like, love, care, laugh, sad, hate)
router.post('/:commentId/reactions', centralAuthenticate, commentsController.reactToComment);

module.exports = router;
