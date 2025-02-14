const { validationResult } = require("express-validator");
const Comment = require("../Models/comments.model");
const Post = require("../Models/posts.model");
const mongoose = require("mongoose");
const { isUserAllowed } = require("../Middlewares/centralAuth.middleware");

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

module.exports.getCommentsByPostId = async (req, res) => {
    try {
        const postId = req.params.postId;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: "Invalid Post ID" });
        }

        // Fetch comments for the post
        const comments = await Comment.find({ postId });

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

        const { content, parentCommentId } = req.body; // `parentCommentId` is optional
        const { postId } = req.params;

        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: "Invalid Post ID" });
        }

        // Validate parentCommentId if provided
        if (parentCommentId && !mongoose.Types.ObjectId.isValid(parentCommentId)) {
            return res.status(400).json({ message: "Invalid Parent Comment ID" });
        }

        // Find the post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Create the comment
        const comment = await Comment.create({
            postId,
            userId: req.user.userId,
            content,
            parentCommentId
        });

        // If it's a top-level comment, add it to the post's comments array
        if (!parentCommentId) {
            post.comments.push(comment._id);
            await post.save();
        }

        res.status(201).json({ message: "Comment created successfully", comment });
    } catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports.updateComment = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const commentId = req.params.commentId;
        const { content } = req.body;

        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({ message: "Invalid Comment ID" });
        }

        if (!content || content.trim() === "") {
            return res.status(400).json({ message: "Content cannot be empty" });
        }

        const result = await isUserAllowed(req, null, null, commentId);

        if (result.error) {
            return res.status(result.error.status).json({ message: result.error.message });
        }

        result.content = content;
        await result.save();

        res.status(200).json({ message: "Comment updated successfully", result });
    } catch (error) {
        console.error("Error updating comment:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        // Validate commentId
        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({ message: "Invalid Comment ID" });
        }

        const result = await isUserAllowed(req, null, null, commentId);

        if (result.error) {
            return res.status(result.error.status).json({ message: result.error.message });
        }

        // Find the comment
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Recursively delete replies
        const deleteReplies = async (parentCommentId) => {
            const replies = await Comment.find({ parentCommentId });
            for (const reply of replies) {
                await deleteReplies(reply._id); // Recursively delete nested replies
                await Comment.findByIdAndDelete(reply._id);
            }
        };

        await deleteReplies(commentId);

        // Delete the comment itself
        await Comment.findByIdAndDelete(commentId);

        // If it's a top-level comment, remove it from the post's comments array
        if (!comment.parentCommentId) {
            const post = await Post.findById(comment.postId);
            if (post) {
                post.comments = post.comments.filter(id => !id.equals(commentId));
                await post.save();
            }
        }

        res.status(200).json({ message: "Comment deleted successfully", comment });
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports.reactToComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { impressionType } = req.body;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({ message: "Invalid Comment ID" });
        }

        const validReactions = ["like", "love", "care", "laugh", "sad", "hate"];
        if (!validReactions.includes(impressionType)) {
            return res.status(400).json({ message: "Invalid reaction type" });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Check if the user has already reacted
        const existingReaction = comment.ReactsList.get(userId);

        if (existingReaction === impressionType) {
            // Remove the reaction if it's the same type
            comment.ReactsList.delete(userId);
        } else {
            // Add or update the reaction
            comment.ReactsList.set(userId, impressionType);
        }

        await comment.save();

        res.status(200).json({
            message: "Reaction updated successfully",
            comment,
            reactionCount: comment.reactionCount // Use the virtual property
        });
    } catch (error) {
        console.error("Error updating reaction:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports.deleteAllComments = async (req, res) => {
    try {
        await Comment.deleteMany({});
        return res.status(200).json({ message: "All comments deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
