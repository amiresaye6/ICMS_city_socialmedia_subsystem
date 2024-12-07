const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/users.model");
const Token = require("../Models/tokens.model");

module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role, // Assuming `role` is a field in the User model (e.g., 'user', 'admin')
            },
            process.env.JWT_SECRET, // Your JWT secret from environment variables
            { expiresIn: "1h" } // Token expiration time
        );

        // Store the token in the database
        await Token.create({ token, userId: user._id });

        // Respond with the token and user info
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


module.exports.signup = async (req, res) => {
    try {
        const { userName, email, password } = req.body;

        // Validate input
        if (!userName || !email || !password) {
            return res.status(400).json({ message: "Username, email, and password are required" });
        }

        // Check if the email is already in use
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email is already in use" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await User.create({
            userName,
            email,
            password: hashedPassword,
        });

        // Respond with user info (no token needed here)
        res.status(201).json({
            message: "User created successfully",
            user: {
                id: newUser._id,
                userName: newUser.userName,
                email: newUser.email,
            },
        });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports.logout = async (req, res) => {
    try {
        // Extract the token from headers (it should be "Bearer <token>")
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(400).json({ message: "No token provided" });
        }

        // Remove the token from the database
        const deletedToken = await Token.findOneAndDelete({ token });

        if (!deletedToken) {
            return res.status(400).json({ message: "Token not found or already logged out" });
        }

        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
