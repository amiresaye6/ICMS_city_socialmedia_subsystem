const router = require("express").Router();
const centralAuthController = require("../Controllers/centralAuth.controller");


router.post("/login", centralAuthController.centralLogin);

module.exports = router;
