const router = require('express').Router();
const authController = require("../Controllers/auth.controller");

router.post("/login", authController.login)
router.post("/signup", authController.signup)

module.exports = router;
