const express = require('express');
const router = express.Router();
const centralAuthMiddleware = require('../Middlewares/centralAuth.middleware');
const searchController = require('../Controllers/searchController');

router.get('/messages',
    centralAuthMiddleware.centralAuthenticate,
     searchController.searchMessages);
router.get('/users',
  
  centralAuthMiddleware.centralAuthenticate,
    searchController.searchUsers);
router.get('/conversations',
    centralAuthMiddleware.centralAuthenticate, 
    searchController.searchConversations);
router.get('/global',
    centralAuthMiddleware.centralAuthenticate,
     searchController.globalSearch);

module.exports = router;
