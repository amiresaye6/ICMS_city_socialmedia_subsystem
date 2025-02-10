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

module.exports.getCommentsByPostId = async (req, res) => {
    try {
        // Fetch all comments
        const postId = req.params.postId;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: "Invalid Post ID" });
        }

        const comments = await Comment.find({postId});

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

        const { postId, content } = req.body;

        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: "Invalid Post ID" });
        }

        // Find the post and add the comment ID
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Create the comment
        const response = await Comment.create({ postId, userId: req.user.userId, content });

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

        const commentId = req.params.commentId;
        const { content } = req.body;
        const userId = req.user.userId; // get user id from token
     
        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({ message: "Invalid Comment ID" });
        }

        // search for comment
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found"});
        }

        // verify that user is the commenter
        if (comment.userId.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to edit this comment" });
        }

        // Update the comment
        comment.content = content;
        await comment.save();

        res.status(200).json({ message: "Comment updated successfully", comment });
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
        const { commentId } = req.params;
        const { userId, replyContent } = req.body;

        // Validate input fields
        if (!commentId || !userId || !replyContent) {
            return res.status(400).json({ message: "Missing required fields: commentId, userId, replyContent" });
        }

        // Check if the commentId exists in the database
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Update the comment by adding a reply
        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            { $push: { replies: { userId, text: replyContent, createdAt: new Date() } } },
            { new: true } // Return the updated comment
        );

        res.status(200).json({ message: "Reply added successfully", comment: updatedComment });

    } catch (error) {
        console.error("Error adding reply:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


module.exports.reactToComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { userId, impressionType } = req.body; // The reaction type (like, love, care, etc.)

        // Validate input fields
        if (!commentId || !userId || !impressionType) {
            return res.status(400).json({ message: "Missing required fields: commentId, userId, impressionType" });
        }

        // Validate the reaction type
        const validReactions = ["like", "love", "care", "laugh", "sad", "hate"];
        if (!validReactions.includes(impressionType)) {
            return res.status(400).json({ message: "Invalid reaction type" });
        }

        // Find the comment
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Check if the user has already reacted
        const existingReactionIndex = comment.ReactsLIst.list.findIndex(
            (reaction) => reaction.userId.toString() === userId
        );

        let update;
        if (existingReactionIndex !== -1) {
            // If the user has already reacted
            if (comment.ReactsLIst.list[existingReactionIndex].impressionType === impressionType) {
                //  Remove the reaction if it's the same type
                update = {
                    $pull: { "ReactsLIst.list": { userId } },
                    $inc: { "ReactsLIst.count": -1 }
                };
            } else {
                // Update the reaction type
                update = {
                    $set: { [`ReactsLIst.list.${existingReactionIndex}.impressionType`]: impressionType }
                };
            }
        } else {
            // If the user has not reacted, add a new reaction
            update = {
                $push: { "ReactsLIst.list": { userId, impressionType } },
                $inc: { "ReactsLIst.count": 1 }
            };
        }

        // Update the comment with the new reaction
        const updatedComment = await Comment.findByIdAndUpdate(commentId, update, { new: true });

        res.status(200).json({ message: "Reaction updated successfully", comment: updatedComment });

    } catch (error) {
        console.error("Error updating reaction:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

