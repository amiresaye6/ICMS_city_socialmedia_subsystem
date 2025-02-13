const router = require("express").Router();
const postsController = require("../Controllers/posts.controller");
const authMiddleware = require("../Middlewares/auth.middleware");
const centralAuthMiddleware = require("../Middlewares/centralAuth.middleware");
const upload = require("../Middlewares/fileUpload.middleware");
const postsValidator = require("../Validator/posts.validator");
//  **POST ROUTES**

// Get all posts (with optional pagination)
router.get("/",
  centralAuthMiddleware.centralAuthenticate,
  postsController.getAllPosts);

// Get a specific post by postId
router.get(
  "/:postId",
  centralAuthMiddleware.centralAuthenticate,
  postsController.getPostById
);

// Get all posts created by a specific user
router.get(
  "/user/:userId",
  centralAuthMiddleware.centralAuthenticate,
  postsController.getPostsByUserId
);

// Create a new post
router.post(
  "/",
  centralAuthMiddleware.centralAuthenticate,
  upload.array("media", 5),
  postsValidator.validateCreatePost,
  postsController.createPost
);

// Delete a specific post
router.delete("/:postId",
  centralAuthMiddleware.centralAuthenticate,
  postsController.deletePost);

//  **REACTIONS ROUTES**

// Add a new reaction to a post
router.post(
  "/:postId/reactions",
  centralAuthMiddleware.centralAuthenticate,
  postsValidator.valildateAddReaction,
  postsController.addReaction
);

//  **SHARE ROUTES**

// Share a post
router.post(
  "/:postId/shares",
  centralAuthMiddleware.centralAuthenticate,
  postsController.sharePost
);

// Delete a share (optional) // need implementation
router.post(
  "/:postId/unshare",
  centralAuthMiddleware.centralAuthenticate,
  postsController.unshare
);

//  **TAG ROUTES**

// Add a new tag to a post // esraa validation
router.post(
  "/:postId/tags",
  centralAuthMiddleware.centralAuthenticate,
  postsValidator.valildateAddTag,
  postsController.addTag
);

// Update an existing tag on a post // esraa validation
router.put(
  "/:postId/tags",
  centralAuthMiddleware.centralAuthenticate,
  postsValidator.validateUpdateTag,
  postsController.updateTag
);

// Delete a tag from a post // esraa validation
router.delete(
  "/:postId/tags",
  centralAuthMiddleware.centralAuthenticate,
  postsValidator.validateDeleteTag,
  postsController.deleteTag
);

//  **SAVE ROUTES**

// Save a post (similar to a bookmark or "favorite" feature)
//===============>> needs some updates to unsave too.
router.post(
  "/:postId/saves",
  centralAuthMiddleware.centralAuthenticate,
  postsController.savePost
);

// unsave a post
router.post(
  "/:postId/unsave",
  centralAuthMiddleware.centralAuthenticate,
  postsController.unSavePost
);

//  **STATUS & AVAILABILITY ROUTES**

// Update the status of a post (e.g., published, draft, etc.) // esraa validation
router.put(
  "/:postId/status",
  centralAuthMiddleware.centralAuthenticate,
  postsValidator.validateUpdateStatus,
  postsController.updateStatus
);

// Update the availability of a post (e.g., visible/hidden) // esraa validation
router.put(
  "/:postId/availability",
  centralAuthMiddleware.centralAuthenticate,
  postsValidator.validateAvailability,
  postsController.updateAvailability
);

//  **CAPTION ROUTE**

// Update the caption of a post // esraa validation
router.put(
  "/:postId/caption",
  centralAuthMiddleware.centralAuthenticate,
  postsValidator.validateUpdateCaption,
  postsController.updateCaption
);

module.exports = router;
