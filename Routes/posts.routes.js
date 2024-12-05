const router = require('express').Router();
const postsController = require("../Controllers/posts.controller");

router.post("/addPost", postsController.createPost);

// esraa task
router.put("/add-react", postsController.addReacts);
router.put("/add-share", postsController.addToShaere);



router.delete("/:hamada", postsController.delete)
router.put('/upadeCaptio/:id', postsController.updateCaption)
router.put('/updateavilabilty/:id', postsController.updateavilabity)


module.exports = router;
