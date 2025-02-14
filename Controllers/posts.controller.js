const { validationResult } = require("express-validator");
const Post = require("../Models/posts.model");
const User = require("../Models/users.model");
const mongoose = require("mongoose");
const { isUserAllowed } = require("../Middlewares/centralAuth.middleware");

// Get all posts with pagination
exports.getAllPosts = async (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send({ errors: result.array() });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const posts = await Post.find().skip(skip).limit(limit);
    const totalPosts = await Post.countDocuments();
    const totalPages = Math.ceil(totalPosts / limit);

    res.status(200).json({
      message: "Posts retrieved successfully",
      pagination: {
        totalPosts,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while retrieving posts",
      error: error.message,
    });
  }
};

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { postCaption } = req.body;

    if (!postCaption || postCaption.trim() === "") {
      return res.status(400).json({ error: "Post caption is required" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "At least one media file is required" });
    }

    const media = req.files.map((file) => {
      const type = getMediaType(file.mimetype);
      if (!["image", "video", "audio"].includes(type)) {
        throw new Error(`Invalid media type detected: ${type}`);
      }
      return {
        type,
        url: `/public/uploads/${file.filename}`,
      };
    });

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Unauthorized: User not authenticated" });
    }

    const newPostData = {
      postCaption: postCaption.trim(),
      author: req.user.userId,
      media,
    };

    const newPost = await Post.create(newPostData);
    const updatedUser = await User.findOne({ centralUsrId: req.user.userId });

    updatedUser.posts.push(newPost._id);
    await updatedUser.save();

    res.status(201).json(newPost);
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ error: "Validation error", details: errors });
    }

    if (error.name === "MulterError") {
      return res.status(400).json({ error: "File upload error", details: error.message });
    }

    res.status(500).json({
      error: "An unexpected error occurred while creating the post",
      details: error.message,
    });
  }
};

// Utility function to get media type
const getMediaType = (mimetype) => {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype.startsWith("audio/")) return "audio";
  return null;
};

// Add reaction to a post
exports.addReaction = async (req, res) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).send({ errors: result.array() });
    }

    const postId = req.params.postId;
    const userId = req.user.userId;
    const { reactionType } = req.body;

    if (!postId || !userId || !reactionType) {
      return res.status(400).json({ message: "Post ID, User ID, and Reaction Type are required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const existingReactionIndex = post.impressionList.findIndex(
      (react) => react.userId.toString() === userId
    );

    if (existingReactionIndex !== -1) {
      const existingReaction = post.impressionList[existingReactionIndex];

      if (existingReaction.impressionType === reactionType) {
        post.impressionList.splice(existingReactionIndex, 1);
        post.impressionsCount[reactionType]--;
        if (post.impressionsCount[reactionType] < 0) {
          post.impressionsCount[reactionType] = 0;
        }
      } else {
        const previousReactionType = existingReaction.impressionType;
        post.impressionsCount[previousReactionType]--;
        if (post.impressionsCount[previousReactionType] < 0) {
          post.impressionsCount[previousReactionType] = 0;
        }
        existingReaction.impressionType = reactionType;
        post.impressionsCount[reactionType]++;
      }
    } else {
      post.impressionList.push({ userId, impressionType: reactionType });
      post.impressionsCount[reactionType]++;
    }

    await post.save();

    res.status(200).json({ message: "Reaction processed successfully", post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Share a post
exports.sharePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const { userId } = req.user;

    if (!postId || !userId) {
      return res.status(400).json({ message: "Post ID and User ID are required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyShared = post.shareList.some((sharedUserId) => sharedUserId.toString() === userId);
    if (alreadyShared) {
      return res.status(400).json({ message: "User has already shared this post" });
    }

    post.shareList.push(userId);
    post.shareCount += 1;

    const result = await isUserAllowed(req, null, userId);
    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    await User.updateOne({ centralUsrId: userId }, { $push: { sharedPosts: postId } });
    await post.save();

    res.status(200).json({
      message: "User added to the share list successfully",
      post,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;

    const result = await isUserAllowed(req, postId);
    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    await Post.deleteOne({ _id: postId });
    const updatedUser = await User.findOne({ centralUsrId: req.user.userId });

    updatedUser.posts.pull(postId);
    await updatedUser.save();

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update post caption
exports.updateCaption = async (req, res) => {
  try {
    const postId = req.params.postId;
    const { newCaption } = req.body;

    if (!postId || !newCaption) {
      return res.status(400).json({ message: "Post ID and new caption are required" });
    }

    const result = await isUserAllowed(req, postId);
    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $set: { postCaption: newCaption } },
      { new: true }
    );

    res.status(200).json({
      message: "Caption updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Error updating caption:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Update post status
exports.updateStatus = async (req, res) => {
  try {
    const { postId } = req.params;
    const { newStatus } = req.body;

    if (!postId || !newStatus) {
      return res.status(400).json({ message: "Post ID and new status are required" });
    }

    const validStatuses = ["active", "archived", "deleted"];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const result = await isUserAllowed(req, postId);
    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $set: { status: newStatus } },
      { new: true }
    );

    res.status(200).json({
      message: "Post status updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Error updating status:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Update post availability
exports.updateAvailability = async (req, res) => {
  try {
    const postId = req.params.postId;
    const { newAvailability } = req.body;

    if (!postId || !newAvailability) {
      return res.status(400).json({ message: "Post ID and new availability are required" });
    }

    const result = await isUserAllowed(req, postId);
    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $set: { availability: newAvailability } },
      { new: true }
    );

    res.status(200).json({
      message: "Availability updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Error updating availability:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Save a post
exports.savePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.user;

    if (!postId || !userId) {
      return res.status(400).json({ message: "Post ID and User ID are required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadySaved = post.saveList.some((saveUserId) => saveUserId.toString() === userId);
    if (alreadySaved) {
      return res.status(400).json({ message: "User has already saved this post" });
    }

    post.saveList.push(userId);
    post.saveCount += 1;

    const updatedUser = await User.findOne({ centralUsrId: req.user.userId });
    updatedUser.savedPosts.push(postId);
    await updatedUser.save();

    await post.save();

    res.status(200).json({
      message: "User added to the save list successfully",
      post,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Unsave a post
exports.unSavePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.user;

    if (!postId || !userId) {
      return res.status(400).json({ message: "Post ID and User ID are required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const result = await isUserAllowed(req, null, userId);
    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    const alreadySaved = post.saveList.some((saveUserId) => saveUserId.toString() === userId);
    if (!alreadySaved) {
      return res.status(400).json({ message: "User has not saved this post" });
    }

    post.saveList = post.saveList.filter((saveUserId) => saveUserId.toString() !== userId);
    post.saveCount -= 1;

    await User.updateOne({ centralUsrId: userId }, { $pull: { savedPosts: postId } });
    await post.save();

    res.status(200).json({
      message: "User removed from the save list successfully",
      post,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Add a tag to a post
exports.addTag = async (req, res) => {
  try {
    const { postId } = req.params;
    const { newTag } = req.body;

    if (!postId || !newTag) {
      return res.status(400).json({ message: "Post ID and new tag are required" });
    }

    const result = await isUserAllowed(req, postId);
    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    const post = result.post;
    post.tags.push(newTag);
    await post.save();

    res.status(200).json({
      message: "Tag added successfully",
      post,
    });
  } catch (error) {
    console.error("Error while adding tag:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Update a tag in a post
exports.updateTag = async (req, res) => {
  try {
    const { postId } = req.params;
    const { oldTag, newTag } = req.body;

    if (!postId || !oldTag || !newTag) {
      return res.status(400).json({ message: "Post ID, old tag, and new tag are required" });
    }

    const result = await isUserAllowed(req, postId);
    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    const post = result.post;
    const tagIndex = post.tags.indexOf(oldTag);
    if (tagIndex === -1) {
      return res.status(404).json({ message: "Old tag not found" });
    }

    post.tags[tagIndex] = newTag;
    await post.save();

    res.status(200).json({
      message: "Tag updated successfully",
      post,
    });
  } catch (error) {
    console.error("Error while updating tag:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Delete a tag from a post
exports.deleteTag = async (req, res) => {
  try {
    const { postId } = req.params;
    const { tagToDelete } = req.body;

    if (!postId || !tagToDelete) {
      return res.status(400).json({ message: "Post ID and tag to delete are required" });
    }

    const result = await isUserAllowed(req, postId);
    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    const post = result.post;
    const tagIndex = post.tags.indexOf(tagToDelete);
    if (tagIndex === -1) {
      return res.status(404).json({ message: "Tag not found" });
    }

    post.tags.splice(tagIndex, 1);
    await post.save();

    res.status(200).json({
      message: "Tag deleted successfully",
      post,
    });
  } catch (error) {
    console.error("Error while deleting tag:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get post by ID
exports.getPostById = async (req, res) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({
      message: "Post retrieved successfully",
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while retrieving the post",
      error: error.message,
    });
  }
};

// Get posts by user ID
exports.getPostsByUserId = async (req, res) => {
  const userId = req.params.userId;

  try {
    const posts = await Post.find({ author: userId });

    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: "No posts found for this user" });
    }

    res.status(200).json({
      message: "Posts retrieved successfully",
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while retrieving the posts",
      error: error.message,
    });
  }
};

// Unshare a post
exports.unshare = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.user;

    if (!postId || !userId) {
      return res.status(400).json({ message: "Post ID and User ID are required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const result = await isUserAllowed(req, null, userId);
    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    const alreadyShared = post.shareList.some((shareUserId) => shareUserId.toString() === userId);
    if (!alreadyShared) {
      return res.status(400).json({ message: "User has not shared this post" });
    }

    post.shareList = post.shareList.filter((shareUserId) => shareUserId.toString() !== userId);
    post.shareCount -= 1;

    await User.updateOne({ centralUsrId: userId }, { $pull: { sharedPosts: postId } });
    await post.save();

    res.status(200).json({
      message: "User removed from the share list successfully",
      post,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
