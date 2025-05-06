const express = require("express");
const router = express.Router(); 
const upload = require('../middlewares/upload');
const postsController = require("../Controllers/posts.controller");
const messageController = require("../Controllers/messageController");
const usersController = require('../Controllers/users.controller');

// Profile picture
router.post('/profilepic', upload.single('avatar'), usersController.changeAvatar);

// Cover picture
router.post('/coverpic', upload.single('coverphoto'), usersController.changeCover);

// Post attachments
router.post('/posts', upload.array('media', 5), postsController.createPost);

// Message attachments
router.post('/messages', upload.single('attachment'), messageController.sendMessage);

module.exports = router;
