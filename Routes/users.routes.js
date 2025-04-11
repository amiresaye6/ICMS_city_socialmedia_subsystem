const router = require('express').Router();
const centralAuthMiddleware = require("../Middlewares/centralAuth.middleware");
const usersController = require("../Controllers/users.controller");
const upload = require('../Middlewares/fileUpload.middleware');

router.get('/', centralAuthMiddleware.centralAuthenticate, usersController.getAllUsers);
router.get('/me', centralAuthMiddleware.centralAuthenticate, usersController.getMyUser);
router.get('/:userId', centralAuthMiddleware.centralAuthenticate, usersController.getUserById);
router.put('/me', centralAuthMiddleware.centralAuthenticate, usersController.changeUserName);
router.put('/me/avatar', centralAuthMiddleware.centralAuthenticate, upload.array("avatar", 1), usersController.changeAvatar);
router.put('/me/cover', centralAuthMiddleware.centralAuthenticate, upload.array("cover", 1), usersController.changeCover);
router.put('/me/bio', centralAuthMiddleware.centralAuthenticate, usersController.changeBio);


module.exports = router;
