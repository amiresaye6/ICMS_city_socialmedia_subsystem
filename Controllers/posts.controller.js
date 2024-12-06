const { validationResult } = require("express-validator");
const Post = require("../Models/posts.model");
const mongoose = require("mongoose");

// get all posts to-do >> adding pagination to it like 10 posts each time
exports.getPosts = (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send({ errors: result.array() });
  }
  res.status(200).json({
    message: "Post retrieved successfully",
  });
};

// create a new post to-do >> needs some data validationa and error handling
exports.createPost = async (req, res) => {
  try {
    const newPost = await Post.create(req.body);
    res.status(201).json(newPost);
    // res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// add Reacts  to-do >> fix the total calc
exports.addReacts = async (req, res) => {
  try {
    const { postId, userId, reactionType } = req.body;

    // Ensure that the required data is provided
    if (!postId || !userId || !reactionType) {
      return res
        .status(400)
        .json({ message: "Post ID, User ID, and Reaction Type are required" });
    }

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(postId)
    ) {
      return res.status(400).json({ message: "Invalid User ID or Post ID" });
    }

    // Find the post using the postId
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user has already reacted to this post
    const existingReactionIndex = post.impressionList.findIndex((react) =>
      react.userId.equals(userId)
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
        userId: new mongoose.Types.ObjectId(userId),
        impressionType: reactionType,
      });
      post.impressionsCount[reactionType]++;
    }

    // Recalculate the total impressions
    post.impressionsCount.total = Object.values(post.impressionsCount)
      .filter(
        (value) =>
          typeof value === "number" && value !== post.impressionsCount.total
      ) // Exclude the total itself
      .reduce((acc, curr) => acc + curr, 0);

    // Save the updated post
    await post.save();

    res.status(200).json({ message: "Reaction processed successfully", post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// add a share to do >> needs some enhancments
exports.addToShare = async (req, res) => {
  try {
    const { postId, userId } = req.body;

    // Validate required fields
    if (!postId || !userId) {
      return res
        .status(400)
        .json({ message: "Post ID and User ID are required" });
    }

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(postId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({ message: "Invalid Post ID or User ID" });
    }

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user has already shared the post
    const alreadyShared = post.shareList.some((sharedUserId) =>
      sharedUserId.equals(userId)
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
exports.delete = async (req, res) => {
  // delete logic
  const id = req.params.hamada;
  const result = await Post.deleteOne({ _id: id });
  res.json(result);
  res.json({ id });
};
// update an existing post caption to-do >> needs some error handling and data validation
exports.updateCaption = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedPost = await Post.findByIdAndUpdate(
      id, // Document ID
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
    const { id } = req.params;  // ID of the post
    const { newStatus } = req.body;  // The new status to be updated

  
    if (!id || !newStatus) {
      return res.status(400).json({ message: "Post ID and new status are required" });
    }

    // make sure the new status validation 
    const validStatuses = ['active', 'archived', 'deleted'];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

  
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { $set: { status: newStatus } },  //Update operation
      { new: true }  // Return the updated document
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
    console.error('Error while updating post status:', error.message);
  }
};


// update an existing post caption to-do >> needs some error handling and data validation
exports.updateAvailability = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedPost = await Post.findByIdAndUpdate(
      id, // Document ID
      { $set: { availability: req.body.newAvailability } }, // Update operation
      { new: true } // Return the updated document
    );
    res.status(201).json(updatedPost);
  } catch (error) {
    console.error(error.message);
  }
};

exports.addToSave = async (req, res) => {
  try {
    const { postId, userId } = req.body;

    // Validate required fields
    if (!postId || !userId) {
      return res
        .status(400)
        .json({ message: "Post ID and User ID are required" });
    }

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(postId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({ message: "Invalid Post ID or User ID" });
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
    const { id } = req.params; // ID of the post
    const { newTag } = req.body; // The new tag to be added

    // make sure the id and the new tag
    if (!id || !newTag) {
      return res.status(400).json({ message: "Post ID and new tag are required" });
    }

    // search for post
    const post = await Post.findById(id);

    // make sure the post exists
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
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
    console.error('Error while adding tag:', error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
exports.updateTag = async (req, res) => {
  try {
    const { id } = req.params; // ID of the post
    const { oldTag, newTag } = req.body; // The old tag to be updated and the new tag value

    // makesure ID ,oldTag and newTag
    if (!id || !oldTag || !newTag) {
      return res.status(400).json({ message: "Post ID, old tag, and new tag are required" });
    }
    const post = await Post.findById(id);

    // post existing
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
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
    console.error('Error while updating tag:', error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
exports.deleteTag = async (req, res) => {
  try {
    const { id } = req.params; // ID of the post
    const { tagToDelete } = req.body; // The tag to be deleted

    // make sure for ID,tagToDelete
    if (!id || !tagToDelete) {
      return res.status(400).json({ message: "Post ID and tag to delete are required" });
    }
    const post = await Post.findById(id);
    if (!post) {    //post existing
      return res.status(404).json({ message: "Post not found" });
    }
    const tagIndex = post.tags.indexOf(tagToDelete); //tag we want to delete
    if (tagIndex === -1) { // make sure tag is exist
      return res.status(404).json({ message: "Tag not found" });
    }
    post.tags.splice(tagIndex, 1); //delete tag
    await post.save();

    res.status(200).json({
      message: "Tag deleted successfully",
      post,
    });
  } catch (error) {
    console.error('Error while deleting tag:', error.message);
  }
};

// new functions
