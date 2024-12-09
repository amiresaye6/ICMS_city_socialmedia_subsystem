const jwt = require("jsonwebtoken");
const Post = require("../Models/posts.model");
const Comment = require("../Models/comments.model");

// Secret for JWT
const JWT_SECRET = process.env.JWT_SECRET || "temp_jwt_secret_until_you_add_one_to_the_dot_env_file";

// Middleware to authenticate user
exports.authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token
    if (!token) {
        return res.status(401).json({ message: "Access token is required" });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach decoded token to the request
        next();
    } catch (error) {
        console.error("JWT Error:", error.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

// Middleware to check if user is an admin
exports.isAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied: Admins only" });
    }
    next();
};

// Middleware to check if the user is the creator of the post
exports.isPostCreator = async (req, res, next) => {
    const { postId } = req.params;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.author.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Access denied: Not the creator of this post" });
        }

        // Attach the post to the request for further use
        req.post = post;
        next();
    } catch (error) {
        console.error("Error checking creator:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.isCommentCreator = async (req, res, next) => {
    const { commentId } = req.params;

    try {
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        if (comment.userId.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Access denied: Not the creator of this comment" });
        }

        // Attach the post to the request for further use
        // req.post = post;
        next();
    } catch (error) {
        console.error("Error checking creator:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};


// Middleware to check if user has permission based on role or ownership
exports.hasPermission = (permissions = []) => {
    return (req, res, next) => {
        const { role, userId } = req.user;

        if (permissions.includes("admin") && role === "admin") {
            return next();
        }

        if (permissions.includes("creator") && req.post?.author.toString() === userId) {
            return next();
        }

        return res.status(403).json({ message: "Access denied: Insufficient permissions" });
    };
};
