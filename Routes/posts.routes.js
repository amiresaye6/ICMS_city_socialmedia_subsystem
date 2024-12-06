const router = require('express').Router();
const postsController = require("../Controllers/posts.controller");

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
// add new tag   ..done
router.put('/addTag/:id', postsController.addTag);
router.put('/updateTag/:id', postsController.updateTag);
router.put('/deleteTag/:id', postsController.deleteTag);
// update existing tag   ..done
// delete existing tag    ..done

// update status  >> esraa .>> same as the endpoint of udpate caption .. done
router.put('/updateStatus/:id', postsController.updateStatus);

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
