// no need for this module any more
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/users.model");
const Token = require("../Models/tokens.model");
const { validationResult } = require("express-validator")
const mailer = require("../Middlewares/emailSender.middleware");

module.exports.login = async (req, res) => {
    try {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).send({ errors: result.array() });
        }

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
            { expiresIn: "15m" } // Token expiration time
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

        // Send login notification email (non-blocking)
        const emailSubject = "Login Notification - ICMS";
        const emailText = `
            Dear ${user.userName || "User"},

            This email is to inform you that a login attempt was made to your ICMS account.

            Details:
            - Email: ${email}
            - Time: ${new Date().toLocaleString()}

            If this was you, no further action is required. If this was not you, please contact our support team immediately.

            Best regards,
            The ICMS Team
        `;

        mailer.sendEmail(email, emailSubject, emailText)
            // .then(() => console.log("Login notification email sent successfully"))
            .catch((error) => console.error("Failed to send login notification email:", error));

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


module.exports.signup = async (req, res) => {
    try {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).send({ errors: result.array() });
        }

        const { userName, email, password } = req.body;

        // Validate input
        // if (!userName || !email || !password) {
        //     return res.status(400).json({ message: "Username, email, and password are required" });
        // }

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
