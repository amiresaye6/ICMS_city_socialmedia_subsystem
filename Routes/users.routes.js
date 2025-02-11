const router = require('express').Router();
const centralAuthMiddleware = require("../Middlewares/centralAuth.middleware");
const usersController = require("../Controllers/users.controller")

router.get('/', centralAuthMiddleware.centralAuthenticate, usersController.getAllUsers);
router.get('/:userId', centralAuthMiddleware.centralAuthenticate, usersController.getUserById);
// router.put('/:userId', centralAuthMiddleware.centralAuthenticate, usersController.updateUser);


module.exports = router;
