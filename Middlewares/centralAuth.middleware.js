const jwt = require("jsonwebtoken");
const Post = require("../Models/posts.model");
const User = require("../Models/users.model");
const Comment = require("../Models/comments.model");

// Secret for JWT
const CENTRA_JWT_SECRET = process.env.CENTRA_JWT_SECRET || "temp_jwt_secret_until_you_add_one_to_the_dot_env_file";

// Middleware to authenticate user
exports.centralAuthenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token
  if (!token) {
    return res.status(401).json({ message: "Access token is required" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, CENTRA_JWT_SECRET);
    req.user = {
      userId: decoded.nameid,
      ...decoded
    }; // Attach decoded token to the request
    next();
  } catch (error) {
    console.error("JWT Error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Helper function to check if the user is allowed to delete the post
exports.isUserAllowed = async (req, postId, userId = null, commentId = null) => {
  if (userId) {
    const user = await User.find({ "centralUsrId": userId });

    if (!user) {
      return { error: { status: 404, message: "user not found" } };
    }

    if (user[0].centralUsrId !== req.user.userId) {
      return { error: { status: 403, message: "Forbidden: You are not allowed to do this action, userUpdate" } };
    }

    return user;
  } else if (commentId) {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return { error: { status: 404, message: "comment not found" } };
    }

    if (comment.userId !== req.user.userId) {
      return { error: { status: 403, message: "Forbidden: You are not allowed to do this action, commentUpdate" } };
    }

    return comment;
  }


  const post = await Post.findById(postId);

  if (!post) {
    return { error: { status: 404, message: "Post not found" } };
  }

  if (post.author.toString() !== req.user.userId) {
    return { error: { status: 403, message: "Forbidden: You are not allowed to do this action postUpdate" } };
  }

  return post;
};
