const { validationResult } = require("express-validator");
const Post = require("../Models/posts.model");

exports.getPosts = (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send({ errors: result.array() });
  }
  res.status(200).json({
    message: "Post retrieved successfully",
  });
};

exports.createPost = async (req, res) => {
  try {
    const newPost = await Post.create(req.body);
    res.status(201).json(newPost);
    // res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


  // add Reacts logic for esraa
exports.addReacts = async (req, res) => {
    try {
      const { postId, userId, reactionType } = req.body;
  
      // Ensure that the required data is provided
      if (!postId || !userId || !reactionType) {
        return res.status(400).json({ message: "Post ID, User ID, and Reaction Type are required" });
      }
  
      // Find the post using the postId
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
  
      // Check if the user has already reacted to this post
      const existingReaction = post.reactions.find(react => react.userId === userId);
      if (existingReaction) {
        // If a reaction already exists, update the reaction
        existingReaction.reactionType = reactionType;
        await post.save();
        return res.status(200).json({ message: "Reaction updated successfully", post });
      }
  
      // If no previous reaction exists, add a new reaction
      post.reactions.push({ userId, reactionType });
      await post.save();
  
      res.status(200).json({ message: "Reaction added successfully", post });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  

// the logic to add new user to the share list for esraa
exports.addToShaere = async (req, res) => {
  try {
    const { postId, userId } = req.body;

    if (!postId || !userId) {
      return res
        .status(400)
        .json({ message: "Post ID and User ID are required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyShared = post.shares.some((share) => share.userId === userId);
    if (alreadyShared) {
      return res
        .status(400)
        .json({ message: "User already added to the share list" });
    }

    post.shares.push({ userId });
    await post.save();

    res
      .status(200)
      .json({ message: "User added to the share list successfully", post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
;


exports.delete = async (req, res) => {
  // delete logic
  const id = req.params.hamada;
  const result = await Post.deleteOne({ _id: id });
  res.json(result);
  res.json({ id });
};

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
exports.updateavilabity = async (req, res) => {
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
