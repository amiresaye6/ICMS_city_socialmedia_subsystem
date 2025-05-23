const User = require("../Models/users.model");
const { isUserAllowed } = require("../Middlewares/centralAuth.middleware");
const { validationResult } = require("express-validator")

module.exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.getMyUser = async (req, res) => {
    try {
        const user = await User.findOne({ centralUsrId: req.user.userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: "Invalid request, user ID is required" });
        }
        const user = await User.findOne({ centralUsrId: userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.changeUserName = async (req, res) => {
    try {
        const { userId } = req.user;
        const { userName } = req.body;

        if (!userId || !userName) {
            return res.status(400).json({ message: "Invalid request, user ID and user name are required" });
        }

        const result = await isUserAllowed(req, null, userId);

        if (result.error) {
            return res.status(result.error.status).json({ message: result.error.message });
        }

        const user = await User.findOneAndUpdate(
            { centralUsrId: userId },
            { $set: { localUserName: userName } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.changeBio = async (req, res) => {
    try {
        const { userId } = req.user;
        const { newBio } = req.body;

        if (!userId || !newBio) {
            return res.status(400).json({ message: "Invalid request, user ID and user newBio are required" });
        }

        const result = await isUserAllowed(req, null, userId);

        if (result.error) {
            return res.status(result.error.status).json({ message: result.error.message });
        }

        const user = await User.findOneAndUpdate(
            { centralUsrId: userId },
            { $set: { bio: newBio } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.changeAvatar = async (req, res) => {
    try {
        // Validate Uploaded Media
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                error: 'At least one media file is required'
            });
        }

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

        const { userId } = req.user;

        if (!userId) {
            return res.status(400).json({ message: "Invalid request, user ID is required" });
        }

        const result = await isUserAllowed(req, null, userId);

        if (result.error) {
            return res.status(result.error.status).json({ message: result.error.message });
        }

        const user = await User.findOneAndUpdate(
            { centralUsrId: userId },
            { $set: { avatarUrl: media[0].url } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.changeCover = async (req, res) => {
    try {
        // Validate Uploaded Media
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                error: 'At least one media file is required'
            });
        }

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

        const { userId } = req.user;

        if (!userId) {
            return res.status(400).json({ message: "Invalid request, user ID is required" });
        }

        const result = await isUserAllowed(req, null, userId);

        if (result.error) {
            return res.status(result.error.status).json({ message: result.error.message });
        }

        const user = await User.findOneAndUpdate(
            { centralUsrId: userId },
            { $set: { coverUrl: media[0].url } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.searchUser = async (req, res) => {
    try {
        const { q } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        if (!q || q.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        // Create search regex once
        const searchRegex = new RegExp(q, 'i');

        const [users, total] = await Promise.all([
            User.find({
                $or: [
                    { userName: searchRegex },
                    { localUserName: searchRegex },
                    { email: searchRegex }
                ]
            })
                .select('userName localUserName bio centralUsrId avatarUrl')
                .sort({ userName: 1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            User.countDocuments({
                $or: [
                    { userName: searchRegex },
                    { localUserName: searchRegex },
                    { email: searchRegex }
                ]
            })
        ]);

        res.json({
            success: true,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            data: users
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to search users",
            error: error.message
        });
    }
}

module.exports.changeUserRole = async (req, res) => {
    try {
        const { idToChange, newRole } = req.body;

        if (!idToChange || idToChange.trim() === '') {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        if (!newRole || newRole.trim() === '') {
            return res.status(400).json({ success: false, message: "New role is required" });
        }

        const validRoles = ['user', 'admin'];
        if (!validRoles.includes(newRole)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role value",
                validRoles
            });
        }

        const userRole = await User.findOne({ centralUsrId: idToChange });
        if (userRole.role === "superAdmin") {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to perform this action (user update) to this user"
            });
        }

        const user = await User.findOneAndUpdate(
            { centralUsrId: idToChange },
            { $set: { role: newRole } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found with the provided ID"
            });
        }

        res.status(200).json({
            success: true,
            message: `User role successfully updated to ${newRole}`,
            user
        });
    } catch (error) {
        console.error("Error changing user role:", error);
        res.status(500).json({
            success: false,
            message: "Failed to change user role",
            error: error.message
        });
    }
}

function getMediaType(mimetype) {
    if (mimetype.startsWith('image/')) {
        return 'image';
    } else if (mimetype.startsWith('video/')) {
        return 'video';
    } else if (mimetype.startsWith('audio/')) {
        return 'audio';
    } else {
        return 'unknown';
    }
}
