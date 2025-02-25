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

// Helper function to check if the user is allowed to perform an action
exports.isUserAllowed = async (req, postId = null, userId = null, commentId = null) => {
  try {
    if (userId) {
      // Check if the user is allowed to update their own data
      const user = await User.findOne({ centralUsrId: userId });

      if (!user) {
        return { error: { status: 404, message: "User not found" } };
      }

      if (user.centralUsrId.toString() !== req.user.userId.toString()) {
        return { error: { status: 403, message: "Forbidden: You are not allowed to perform this action (user update)" } };
      }

      return { user }; // Return the user if authorized
    } else if (commentId) {
      // Check if the user is allowed to update/delete a comment
      const comment = await Comment.findById(commentId);

      if (!comment) {
        return { error: { status: 404, message: "Comment not found" } };
      }

      if (comment.userId.toString() !== req.user.userId.toString()) {
        return { error: { status: 403, message: "Forbidden: You are not allowed to perform this action (comment update/delete)" } };
      }

      return { comment }; // Return the comment if authorized
    } else if (postId) {
      // Check if the user is allowed to update/delete a post
      const post = await Post.findById(postId);

      if (!post) {
        return { error: { status: 404, message: "Post not found" } };
      }

      if (post.author.toString() !== req.user.userId.toString()) {
        return { error: { status: 403, message: "Forbidden: You are not allowed to perform this action (post update/delete)" } };
      }

      return { post }; // Return the post if authorized
    } else {
      // If no valid ID is provided
      return { error: { status: 400, message: "Invalid request: No resource ID provided" } };
    }
  } catch (error) {
    console.error("Error in isUserAllowed:", error);
    return { error: { status: 500, message: "Internal server error" } };
  }
};


exports.isUserAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token
  if (!token) {
    return res.status(401).json({ message: "Access token is required" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, CENTRA_JWT_SECRET);
    const userId = decoded.nameid;

    // Check if the user is an admin
    const user = await User.findOne({ centralUsrId: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "admin" && user.role !== "superAdmin") {
      return res.status(403).json({ message: "Forbidden: You are not allowed to perform this action, require admin privileges.", debugOnly: user });
    }

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
