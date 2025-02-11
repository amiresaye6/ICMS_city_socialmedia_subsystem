const router = require("express").Router();
const centralAuthController = require("../Controllers/centralAuth.controller");
const userValidator = require("../Validator/user.validator")


router.post("/login",
    userValidator.loginValidator,
    centralAuthController.centralLogin);

module.exports = router;
