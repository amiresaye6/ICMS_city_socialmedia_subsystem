const router = require('express').Router();
const authController = require("../Controllers/auth.controller");
const authMiddleware = require("../Middlewares/auth.middleware");

router.post("/login", authController.login)
router.post("/signup", authController.signup)
router.post("/logout", authMiddleware.authenticate, authController.logout)

module.exports = router;
