const { body } = require("express-validator");

exports.loginValidator = [
    body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format"),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8, max: 50 })
        .withMessage("Password must be at least 8 characters"),
];
