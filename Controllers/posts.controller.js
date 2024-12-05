const { validationResult } = require("express-validator");
const Post = require("../Models/posts.model");

exports.getPosts = (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).send({ errors: result.array() });
    }
    res.status(200).json({
        message: "Post retrieved successfully"
    });
}

exports.createPost = async (req, res) => {
    try {
        const newPost = await Post.create(req.body);
        res.status(201).json(newPost);
        // res.status(201).json(newPost);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

exports.addReacts = async (req, res) => {
    // add Reacts logic for esraa
}

exports.addToShaere = async (req, res) => {
    // the logic to add new user to the share list for esraa
}

exports.delete = async (req, res) => {
    // delete logic
    const id = req.params.hamada
    const result = await Post.deleteOne({_id: id})
    res.json(result)
    res.json({ id })
}

exports.updateCaption = async (req, res) => {
    try {
        const id = req.params.id
        const updatedPost = await Post.findByIdAndUpdate(
            id, // Document ID
            { $set: { postCaption: req.body.newCaption } }, // Update operation
            { new: true } // Return the updated document
        );
        res.status(201).json(updatedPost);
    } catch (error) {
        console.error(error.message);
    }
}
exports.updateavilabity = async (req, res) => {
    try {
        const id = req.params.id
        const updatedPost = await Post.findByIdAndUpdate(
            id, // Document ID
            { $set: { availability: req.body.newAvailability } }, // Update operation
            { new: true } // Return the updated document
        );
        res.status(201).json(updatedPost);
    } catch (error) {
        console.error(error.message);
    }

}
