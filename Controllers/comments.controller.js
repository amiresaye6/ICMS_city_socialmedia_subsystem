const { validationResult } = require("express-validator");
const Comment = require("../Models/comments.model");
const Post = require("../Models/posts.model");
const mongoose = require("mongoose");

module.exports.getComments = async (req, res) => {
    try {
        // Fetch all comments
        const comments = await Comment.find();

        if (!comments.length) {
            return res.status(404).json({ message: "No comments found" });
        }

        res.status(200).json(comments);
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports.createComment = async (req, res) => {
    try {
        // Validate request body using express-validator
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { postId, userId, content } = req.body;

        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid Post ID or User ID" });
        }

        // Find the post and add the comment ID
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Create the comment
        const response = await Comment.create({ postId, userId, content });

        post.comments.push(response._id);
        await post.save(); // Save the updated post

        res.status(201).json({ message: "Comment created successfully", response });
    } catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


module.exports.updateComment = async (req, res) => {
    try {
        // Validate request body using express-validator
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const commentId = req.params.commentId

        const { content } = req.body;

        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({ message: "Invalid Comment ID" });
        }

        // Update the comment
        const response = await Comment.findByIdAndUpdate(
            commentId,
            { content },
            { new: true } // Return the updated document
        );

        if (!response) {
            return res.status(404).json({ message: "Comment not found" });
        }

        res.status(200).json({ message: "Comment updated successfully", response });
    } catch (error) {
        console.error("Error updating comment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        // Validate commentId
        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({ message: "Invalid Comment ID" });
        }

        // Find the comment and its associated post
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const post = await Post.findById(comment.postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Remove the comment from the post's comments list
        post.comments = post.comments.filter(id => !id.equals(commentId));
        await post.save(); // Save the updated post

        // Delete the comment
        await Comment.findByIdAndDelete(commentId);

        res.status(200).json({ message: "Comment deleted successfully", comment });
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports.addReply = async (req, res) => {
    try {
        res.status(200).json({ message: "not implmented yet"});
    } catch (error) {
        console.error("Error updating comment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports.reactToComment = async (req, res) => {
    try {
        res.status(200).json({ message: "not implmented yet"});
    } catch (error) {
        console.error("Error updating comment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
