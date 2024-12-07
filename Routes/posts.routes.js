const router = require('express').Router();
const postsController = require('../Controllers/posts.controller');

//  **POST ROUTES**

// Get all posts (with optional pagination)
router.get('/', postsController.getAllPosts);

// Get a specific post by postId
router.get('/:postId', postsController.getPostById);

// Get all posts created by a specific user
router.get('/user/:userId', postsController.getPostsByUserId);

// Create a new post
router.post('/', postsController.createPost);

// Delete a specific post
router.delete('/:postId', postsController.deletePost);

//  **REACTIONS ROUTES**

// Add a new reaction to a post
router.post('/:postId/reactions', postsController.addReaction);

//  **SHARE ROUTES**

// Share a post
router.post('/:postId/shares', postsController.sharePost);

// Delete a share (optional)
router.delete('/:postId/shares', postsController.deleteShare);

//  **TAG ROUTES**

// Add a new tag to a post
router.post('/:postId/tags', postsController.addTag);

// Update an existing tag on a post
router.put('/:postId/tags', postsController.updateTag);

// Delete a tag from a post
router.delete('/:postId/tags', postsController.deleteTag);

//  **SAVE ROUTES**

// Save a post (similar to a bookmark or "favorite" feature)
//===============>> needs some updates to unsave too.
router.post('/:postId/saves', postsController.savePost);

//  **STATUS & AVAILABILITY ROUTES**

// Update the status of a post (e.g., published, draft, etc.)
router.put('/:postId/status', postsController.updateStatus);

// Update the availability of a post (e.g., visible/hidden)
router.put('/:postId/availability', postsController.updateAvailability);

//  **CAPTION ROUTE**

// Update the caption of a post
router.put('/:postId/caption', postsController.updateCaption);

module.exports = router;
