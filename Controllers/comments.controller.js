const { validationResult } = require("express-validator");
const Comment = require("../Models/comments.model");
const Post = require("../Models/posts.model");
const mongoose = require("mongoose");
const { isUserAllowed } = require("../Middlewares/centralAuth.middleware");

module.exports.getComments = async (req, res) => {
    try {
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
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { content, parentCommentId } = req.body;
        const { postId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: "Invalid Post ID" });
        }

        if (parentCommentId && !mongoose.Types.ObjectId.isValid(parentCommentId)) {
            return res.status(400).json({ message: "Invalid Parent Comment ID" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId);
            if (!parentComment) {
                return res.status(404).json({ message: "Parent comment not found" });
            }
        }

        const comment = await Comment.create({
            postId,
            userId: req.user.userId,
            content,
            parentCommentId
        });

        await Comment.findByIdAndUpdate(parentCommentId,
            { $push: { replies: comment } },
        )

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

        // Check if the user is allowed to update the comment
        const isAllowed = await isUserAllowed(req, null, null, commentId);
        if (isAllowed.error) {
            return res.status(isAllowed.error.status).json({ message: isAllowed.error.message });
        }

        const comment = isAllowed.comment; // Get the comment from the isUserAllowed response
        comment.content = content;
        await comment.save();

        res.status(200).json({ message: "Comment updated successfully", comment });
    } catch (error) {
        console.error("Error updating comment:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({ message: "Invalid Comment ID" });
        }

        // Check if the user is allowed to delete the comment
        const isAllowed = await isUserAllowed(req, null, null, commentId);
        if (isAllowed.error) {
            return res.status(isAllowed.error.status).json({ message: isAllowed.error.message });
        }

        const comment = isAllowed.comment; // Get the comment from the isUserAllowed response

        // Recursively delete all replies
        const replies = await Comment.find({ parentCommentId: commentId });
        const replyIds = replies.map(reply => reply._id);
        await Comment.deleteMany({ _id: { $in: replyIds } });

        // Delete the comment itself
        await Comment.findByIdAndDelete(commentId);

        // Remove from post's comments array if it's a top-level comment
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
        const existingReactionIndex = comment.reactions.findIndex(reaction => reaction.userId === userId);

        if (existingReactionIndex !== -1) {
            // Remove the reaction if it's the same type
            if (comment.reactions[existingReactionIndex].impressionType === impressionType) {
                comment.reactions.splice(existingReactionIndex, 1);
            } else {
                // Update the reaction
                comment.reactions[existingReactionIndex].impressionType = impressionType;
            }
        } else {
            // Add a new reaction
            comment.reactions.push({ userId, impressionType });
        }

        await comment.save();

        res.status(200).json({
            message: "Reaction updated successfully",
            comment,
            reactionCount: comment.reactionCount
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
