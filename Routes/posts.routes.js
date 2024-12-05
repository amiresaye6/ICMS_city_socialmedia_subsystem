const router = require('express').Router();
const postsController = require("../Controllers/posts.controller");

// get posts with pagination

// get one post by post id

// get all posts by user id

// create a new post
router.post("/addPost", postsController.createPost);

// add a new reaction
router.put("/addReact", postsController.addReacts);
router.put("/addShare", postsController.addToShare);

// amir tasks
// add new comment
// update existing comment
// delete existing comment

// esraa tasks
// add new tag
// update existing tag
// delete existing tag

// update status  >> esraa .>> same as the endpoint of udpate caption

// add new save  >> same as in addShare
router.put("/addSave", postsController.addToSave);

// amir tasks
// add new flag
// update existing flag
// delete existing flag

router.delete("/:hamada", postsController.delete)
router.put('/upadeCaptio/:id', postsController.updateCaption)
router.put('/updateAvailability/:id', postsController.updateAvailability)


module.exports = router;
