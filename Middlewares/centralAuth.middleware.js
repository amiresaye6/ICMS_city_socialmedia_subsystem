const jwt = require("jsonwebtoken");

// Secret for JWT
const CENTRA_JWT_SECRET = process.env.CENTRA_JWT_SECRET || "temp_jwt_secret_until_you_add_one_to_the_dot_env_file";

// Middleware to authenticate user
exports.authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token
    if (!token) {
        return res.status(401).json({ message: "Access token is required" });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, CENTRA_JWT_SECRET);
        req.user = decoded; // Attach decoded token to the request
        next();
    } catch (error) {
        console.error("JWT Error:", error.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
