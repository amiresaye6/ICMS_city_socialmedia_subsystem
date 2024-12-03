const Posts = require("../Models/posts.model");

exports.getPosts = (req, res) => {
    
    res.status(200).json(
        {
            message: "post created succesfully"
        }
    )
}
