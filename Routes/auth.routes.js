const router = require('express').Router();
const authController = require("../Controllers/auth.controller");
const authMiddleware = require("../Middlewares/auth.middleware");
const userValidator = require("../Validator/user.validator");

router.post("/login", userValidator.signupValidator, authController.login)
router.post("/signup", userValidator.registerValidation, authController.signup)
router.post("/logout", authMiddleware.authenticate, authController.logout)

module.exports = router;
