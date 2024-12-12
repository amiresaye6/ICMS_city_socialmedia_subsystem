const router = require("express").Router();
const postsController = require("../Controllers/posts.controller");
const authMiddleware = require("../Middlewares/auth.middleware");
const upload = require("../Middlewares/fileUpload.middleware");
const postsValidator = require("../Validator/posts.validator");
//  **POST ROUTES**

// Get all posts (with optional pagination)
router.get("/", authMiddleware.authenticate, postsController.getAllPosts);

// Get a specific post by postId
router.get(
  "/:postId",
  authMiddleware.authenticate,
  postsController.getPostById
);

// Get all posts created by a specific user
router.get(
  "/user/:userId",
  authMiddleware.authenticate,
  postsController.getPostsByUserId
);

// Create a new post
router.post(
  "/",
  authMiddleware.authenticate,
  upload.array("media", 5),
  postsValidator.validateCreatePost,
  postsController.createPost
);

// Delete a specific post
router.delete("/:postId", postsController.deletePost);

//  **REACTIONS ROUTES**

// Add a new reaction to a post
router.post(
  "/:postId/reactions",
  authMiddleware.authenticate,
  postsValidator.valildateAddReaction,
  postsController.addReaction
);

//  **SHARE ROUTES**

// Share a post
router.post(
  "/:postId/shares",
  authMiddleware.authenticate,
  postsController.sharePost
);

// Delete a share (optional) // need implementation
router.delete(
  "/:postId/shares",
  authMiddleware.authenticate,
  postsController.deleteShare
);

//  **TAG ROUTES**

// Add a new tag to a post // esraa validation
router.post(
  "/:postId/tags",
  authMiddleware.authenticate,
  postsValidator.valildateAddTag ,
  postsController.addTag
);

// Update an existing tag on a post // esraa validation
router.put(
  "/:postId/tags",
  authMiddleware.authenticate,
  postsValidator.validateUpdateTag,
  postsController.updateTag
);

// Delete a tag from a post // esraa validation
router.delete(
  "/:postId/tags",
  authMiddleware.authenticate,
  postsValidator.validateDeleteTag,
  postsController.deleteTag
);

//  **SAVE ROUTES**

// Save a post (similar to a bookmark or "favorite" feature)
//===============>> needs some updates to unsave too.
router.post(
  "/:postId/saves",
  authMiddleware.authenticate,
  postsController.savePost
);

//  **STATUS & AVAILABILITY ROUTES**

// Update the status of a post (e.g., published, draft, etc.) // esraa validation
router.put(
  "/:postId/status",
  authMiddleware.authenticate,
  postsValidator.validateUpdateStatus,
  postsController.updateStatus
);

// Update the availability of a post (e.g., visible/hidden) // esraa validation
router.put(
  "/:postId/availability",
  authMiddleware.authenticate,
  postsValidator.validateAvailability,
  postsController.updateAvailability
);

//  **CAPTION ROUTE**

// Update the caption of a post // esraa validation
router.put(
  "/:postId/caption",
  authMiddleware.authenticate,
  postsValidator.validateUpdateCaption,
  postsController.updateCaption
);

module.exports = router;
