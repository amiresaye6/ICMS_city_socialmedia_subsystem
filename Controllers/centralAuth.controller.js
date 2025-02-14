const { validationResult } = require("express-validator")
const mailer = require("../Middlewares/emailSender.middleware");
const fetch = require("node-fetch");
const User = require("../Models/users.model");

const baseUrl = "https://cms-central-ffb6acaub5afeecj.uaenorth-01.azurewebsites.net/api/Auth/login"


module.exports.centralLogin = async (req, res) => {
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

        const user = await fetch(baseUrl, {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json());

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Check if the user already exists in the local database
        const myUser = await User.findOne({centralUsrId: user.value.id})
        if (!myUser) {
            // create a new user
            const newUser = new User({
                centralUsrId: user.value.id,
                userName: user.value.userName,
                localUserName: user.value.userName,
                email: user.value.email,
            });
            await newUser.save();
        }

        // res.cookie('token', token, {
        //     httpOnly: true,   // Prevents client-side access
        //     // secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        //     sameSite: 'Strict',
        // });

        // Respond with the token and user info
        res.status(200).json({
            message: "Login successful",
            token: user.value.token,
            user: {
                id: user.value.id,
                userName: user.value.userName,
                email: user.value.email,
            },
        });

        // Send login notification email (non-blocking)
        const emailSubject = "Login Notification - ICMS";
        const emailText = `
            Dear ${user.value.userName || "User"},

            This email is to inform you that a login attempt was made to your ICMS account.

            Details:
            - Email: ${email}
            - Time: ${new Date().toLocaleString()}

            If this was you, no further action is required. If this was not you, please contact our support team immediately.

            Best regards,
            The ICMS Team
        `;

        // mailer.sendEmail(email, emailSubject, emailText)
            // .then(() => console.log("Login notification email sent successfully"))
            // .catch((error) => console.error("Failed to send login notification email:", error));

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
