const { validationResult } = require("express-validator");
const Post = require("../Models/posts.model");
const mongoose = require("mongoose");

// Helper function to check if the user is allowed to delete the post
const isUserAllowed = async (req, postId) => {
  const post = await Post.findById(postId);

  if (!post) {
    return { error: { status: 404, message: "Post not found" } };
  }

  if (post.author.toString() !== req.user.userId) {
    return { error: { status: 403, message: "Forbidden: You are not allowed to do this action" } };
  }

  return post;
};

// get all posts to-do >> adding pagination to it like 10 posts each time
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
        hasPrevPage: page > 1
      },
      data: posts
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while retrieving posts",
      error: error.message
    });
  }
};

// create a new post to-do >> needs some data validationa and error handling
exports.createPost = async (req, res) => {
  try {
    // Check for Required Fields
    const { postCaption } = req.body;

    // Validate Post Caption
    if (!postCaption || postCaption.trim() === '') {
      return res.status(400).json({
        error: 'Post caption is required'
      });
    }

    // Validate Uploaded Media
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'At least one media file is required'
      });
    }

    // Extract and Validate Media Information
    const media = req.files.map(file => {
      // Determine the media type (image, video, audio) from mimetype
      const type = getMediaType(file.mimetype);

      // Validate the type according to the media schema enum
      if (!['image', 'video', 'audio'].includes(type)) {
        throw new Error(`Invalid media type detected: ${type}`);
      }

      // Use the correct file URL, remove "/public" from the path
      return {
        type,
        url: `/public/uploads/${file.filename}` // to be able to send req directly to it.
      };
    });

    // Check if the user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        error: 'Unauthorized: User not authenticated'
      });
    }

    // Prepare Post Data
    const newPostData = {
      postCaption: postCaption.trim(), // Remove extra spaces
      author: req.user.userId, // Ensure the user is authenticated, nameid and userId are the same
      media
    };

    // Create and Save the New Post in MongoDB
    const newPost = await Post.create(newPostData);
    res.status(201).json(newPost);

  } catch (error) {
    // Handle Validation Errors (like Mongoose validation errors)
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Validation error',
        details: errors
      });
    }

    // Handle Multer File Upload Errors
    if (error.name === 'MulterError') {
      return res.status(400).json({
        error: 'File upload error',
        details: error.message
      });
    }

    // Handle All Other Errors
    res.status(500).json({
      error: 'An unexpected error occurred while creating the post',
      details: error.message
    });
  }
};

// Utility Function to Get Media Type Based on MIME Type
const getMediaType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  return null; // If the type is not recognized
};

// add Reacts  to-do >> fix the total calc
exports.addReaction = async (req, res) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).send({ errors: result.array() });
    }
    const postId = req.params.postId;
    const userId = req.user.userId;
    const { reactionType } = req.body;

    // Ensure that the required data is provided
    if (!postId || !userId || !reactionType) {
      return res
        .status(400)
        .json({ message: "Post ID, User ID, and Reaction Type are required" });
    }

    // Find the post using the postId
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user has already reacted to this post
    const existingReactionIndex = post.impressionList.findIndex((react) =>
      react.userId.toString() === userId
    );

    if (existingReactionIndex !== -1) {
      const existingReaction = post.impressionList[existingReactionIndex];

      if (existingReaction.impressionType === reactionType) {
        // Remove the reaction if it's the same type
        post.impressionList.splice(existingReactionIndex, 1);
        post.impressionsCount[reactionType]--;

        if (post.impressionsCount[reactionType] < 0) {
          post.impressionsCount[reactionType] = 0; // Ensure no negative values
        }
      } else {
        // If it's a different reaction, update the type
        const previousReactionType = existingReaction.impressionType;

        // Decrement the count for the previous reaction type
        post.impressionsCount[previousReactionType]--;
        if (post.impressionsCount[previousReactionType] < 0) {
          post.impressionsCount[previousReactionType] = 0; // Ensure no negative values
        }

        // Update to the new reaction type
        existingReaction.impressionType = reactionType;
        post.impressionsCount[reactionType]++;
      }
    } else {
      // If no previous reaction exists, add a new reaction
      post.impressionList.push({
        userId,
        impressionType: reactionType,
      });
      post.impressionsCount[reactionType]++;
    }

    // Recalculate the total impressions
    // post.impressionsCount.total = Object.values(post.impressionsCount)
    //   .filter(
    //     (value) =>
    //       typeof value === "number" && value !== post.impressionsCount.total
    //   ) // Exclude the total itself
    //   .reduce((acc, curr) => acc + curr, 0);

    // Save the updated post
    await post.save();

    res.status(200).json({ message: "Reaction processed successfully", post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// add a share to do >> needs some enhancments
exports.sharePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const { userId } = req.user;

    // Validate required fields
    if (!postId || !userId) {
      return res
        .status(400)
        .json({ message: "Post ID and User ID are required" });
    }

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user has already shared the post
    const alreadyShared = post.shareList.some((sharedUserId) =>
      sharedUserId.toString() === userId
    );

    if (alreadyShared) {
      // If already shared, return a message without making changes
      return res
        .status(400)
        .json({ message: "User has already shared this post" });
    }

    // Add the user to the share list and increment shareCount
    post.shareList.push(userId);
    post.shareCount += 1;

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

// delete an existing post, to-do >> nees some error ahndling and data validation
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;

    const result = await isUserAllowed(req, postId);

    // If an error exists, return the error response
    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    await Post.deleteOne({ _id: postId });
    res.json({ message: "Post deleted successfully" });


  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


// update an existing post caption to-do >> needs some error handling and data validation
exports.updateCaption = async (req, res) => {
  try {
    const postId = req.params.postId;

    const result = await isUserAllowed(req, postId);

    // If an error exists, return the error response
    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId, // Document ID
      { $set: { postCaption: req.body.newCaption } }, // Update operation
      { new: true } // Return the updated document
    );
    res.status(201).json(updatedPost);
  } catch (error) {
    console.error(error.message);
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { postId } = req.params; // ID of the post
    const { newStatus } = req.body; // The new status to be updated

    if (!postId || !newStatus) {
      return res
        .status(400)
        .json({ message: "Post ID and new status are required" });
    }

    // make sure the new status validation
    const validStatuses = ["active", "archived", "deleted"];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const result = await isUserAllowed(req, postId);

    // If an error exists, return the error response
    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $set: { status: newStatus } }, //Update operation
      { new: true } // Return the updated document
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    // res after update
    res.status(200).json({
      message: "Post status updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Error while updating post status:", error.message);
  }
};

// update an existing post caption to-do >> needs some error handling and data validation
exports.updateAvailability = async (req, res) => {
  try {
    const postId = req.params.postId;

    const result = await isUserAllowed(req, postId);

    // If an error exists, return the error response
    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId, // Document ID
      { $set: { availability: req.body.newAvailability } }, // Update operation
      { new: true } // Return the updated document
    );
    res.status(201).json(updatedPost);
  } catch (error) {
    console.error(error.message);
  }
};

exports.savePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.user;

    // Validate required fields
    if (!postId || !userId) {
      return res
        .status(400)
        .json({ message: "Post ID and User ID are required" });
    }

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user has already shared the post
    const alreadyShared = post.saveList.some((sharedUserId) =>
      sharedUserId.equals(userId)
    );

    if (alreadyShared) {
      // If already shared, return a message without making changes
      return res
        .status(400)
        .json({ message: "User has already saved this post" });
    }

    // Add the user to the share list and increment shareCount
    post.saveList.push(userId);
    post.saveCount += 1;

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

exports.addTag = async (req, res) => {
  try {
    const { postId } = req.params; // ID of the post
    const { newTag } = req.body; // The new tag to be added

    // make sure the id and the new tag
    if (!postId || !newTag) {
      return res
        .status(400)
        .json({ message: "Post ID and new tag are required" });
    }

    const post = await isUserAllowed(req, postId);

    // If an error exists, return the error response
    if (post.error) {
      return res.status(post.error.status).json({ message: post.error.message });
    }

    //add new tag for tags
    post.tags.push(newTag);

    // save post after new tag added
    await post.save();

    res.status(200).json({
      message: "Tag added successfully",
      post,
    });
  } catch (error) {
    console.error("Error while adding tag:", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.updateTag = async (req, res) => {
  try {
    const { postId } = req.params; // ID of the post
    const { oldTag, newTag } = req.body; // The old tag to be updated and the new tag value

    // makesure ID ,oldTag and newTag
    if (!postId || !oldTag || !newTag) {
      return res
        .status(400)
        .json({ message: "Post ID, old tag, and new tag are required" });
    }

    const post = await isUserAllowed(req, postId);

    // If an error exists, return the error response
    if (post.error) {
      return res.status(post.error.status).json({ message: post.error.message });
    }

    // search for old tag and make sure it exists
    const tagIndex = post.tags.indexOf(oldTag);
    if (tagIndex === -1) {
      return res.status(404).json({ message: "Old tag not found" });
    }

    // update existing tag
    post.tags[tagIndex] = newTag;
    await post.save();

    res.status(200).json({
      message: "Tag updated successfully",
      post,
    });
  } catch (error) {
    console.error("Error while updating tag:", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.deleteTag = async (req, res) => {
  try {
    const { postId } = req.params; // ID of the post
    const { tagToDelete } = req.body; // The tag to be deleted

    // make sure for ID,tagToDelete
    if (!postId || !tagToDelete) {
      return res
        .status(400)
        .json({ message: "Post ID and tag to delete are required" });
    }

    const post = await isUserAllowed(req, postId);

    // If an error exists, return the error response
    if (post.error) {
      return res.status(post.error.status).json({ message: post.error.message });
    }

    const tagIndex = post.tags.indexOf(tagToDelete); //tag we want to delete
    if (tagIndex === -1) {
      // make sure tag is exist
      return res.status(404).json({ message: "Tag not found" });
    }
    post.tags.splice(tagIndex, 1); //delete tag
    await post.save();

    res.status(200).json({
      message: "Tag deleted successfully",
      post,
    });
  } catch (error) {
    console.error("Error while deleting tag:", error.message);
  }
};

// new functions

exports.getPostById = async (req, res) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    res.status(200).json({
      message: "Post retrieved successfully",
      data: post
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while retrieving the post",
      error: error.message
    });
  }
};


exports.getPostsByUserId = async (req, res) => {
  const userId = req.params.userId;

  try {
    const posts = await Post.find({ author: userId });

    if (!posts || posts.length === 0) {
      return res.status(404).json({
        message: "No posts found for this user"
      });
    }

    res.status(200).json({
      message: "Posts retrieved successfully",
      data: posts
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while retrieving the posts",
      error: error.message
    });
  }
};


exports.deleteShare = async (req, res) => {
  res.json({ message: 'route and function not implmented yet' })
}
