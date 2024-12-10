const { body } = require("express-validator");

exports.registerValidation = [
    body("userName")
        .notEmpty()
        .withMessage("Username is required")
        .isLength({ min: 3, max: 12 })
        .withMessage("Username must be at least 3 characters"),

    body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format"),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8, max: 16 })
        .withMessage("Password must be at least 8 characters"),
];
exports.signupValidator = [
    body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format"),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8, max: 16 })
        .withMessage("Password must be at least 8 characters"),
];
