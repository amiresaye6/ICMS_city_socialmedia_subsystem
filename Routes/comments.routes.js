const router = require('express').Router();
const commentsController = require("../Controllers/comments.controller");

// get comments with pagination route
router.get('/', commentsController.getComments)

// add comment to a post
router.post('/', commentsController.createComment)

// update existing comment
router.put('/', commentsController.updateComment)

// add a rebly to a comment

// delete existing comment
router.delete('/:commentId', commentsController.deleteComment)

// react to a comment

module.exports = router;
