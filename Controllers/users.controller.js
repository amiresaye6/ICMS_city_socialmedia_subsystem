const jwt = require("jsonwebtoken");
const User = require("../Models/users.model");
const Token = require("../Models/tokens.model");
const { validationResult } = require("express-validator")

module.exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.getUserById = async (req, res) => {
    try {
        const {userId} = req.params;
        const users = await User.findOne({centralUsrId: userId});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
