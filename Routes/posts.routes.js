const router = require('express').Router();
const postsController = require("../Controllers/posts.controller");

router.get("/", postsController.getPosts)

module.exports = router;
