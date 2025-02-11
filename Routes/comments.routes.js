const router = require('express').Router();
const commentsController = require("../Controllers/comments.controller");
const { centralAuthenticate } = require('../Middlewares/centralAuth.middleware');
//const authMiddleware = require("../Middlewares/auth.middleware");

// Get comments with pagination
router.get('/', commentsController.getComments);

router.get('/post/:postId', commentsController.getCommentsByPostId);

// Add a comment to a post
router.post('/', centralAuthenticate, commentsController.createComment);

// Update an existing comment
router.put('/:commentId', centralAuthenticate,  commentsController.updateComment);

// Add a reply to a comment
// ==========>> not implmented yet
router.post('/:commentId/replies', centralAuthenticate, commentsController.addReply);

// Delete an existing comment
router.delete('/:commentId', centralAuthenticate,  commentsController.deleteComment);


// React to a comment
// ==========>> not implmented yet
router.post('/:commentId/reactions', centralAuthenticate, commentsController.reactToComment);

module.exports = router;
