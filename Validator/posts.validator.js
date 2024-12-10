const { body } = require("express-validator");

module.exports.validateCreatePost = [
    body("postCaption")
        .notEmpty()
        .withMessage("caption is required")
        .isLength({ min: 3, max: 1000 })
        .withMessage("caption must be at least 3 characters")
]

module.exports.valildateAddReaction = [
    body("reactionType")
        .notEmpty()
        .withMessage("reaction type is required")
        .isIn(['like', 'love', 'care', 'laugh', 'sad', 'hate'])
        .withMessage("must chose a value from these ['like', 'love', 'care', 'laugh', 'sad', 'hate']"),
]
