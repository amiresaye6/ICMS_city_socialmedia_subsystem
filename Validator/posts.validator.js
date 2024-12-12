const { body } = require("express-validator");

module.exports.validateCreatePost = [
  body("postCaption")
    .notEmpty()
    .withMessage("caption is required")
    .isLength({ min: 3, max: 1000 })
    .withMessage("caption must be at least 3 characters"),
];

module.exports.valildateAddReaction = [
  body("reactionType")
    .notEmpty()
    .withMessage("reaction type is required")
    .isIn(["like", "love", "care", "laugh", "sad", "hate"])
    .withMessage(
      "must chose a value from these ['like', 'love', 'care', 'laugh', 'sad', 'hate']"
    ),
];
module.exports.valildateAddTag = [
  body("tag")
    .trim() // to remove unwanted spaces
    .notEmpty()
    .withMessage("tag is required")
    .isLength({ min: 2, max: 30 })
    .withMessage("tag must be between 2 and 30 characters"),
];
exports.validateUpdateTag = [
  body("oldTag")
    .notEmpty()
    .withMessage("Old tag is required")
    .isString()
    .withMessage("Old tag must be a string"),

  body("newTag")
    .notEmpty()
    .withMessage("New tag is required")
    .isString()
    .withMessage("New tag must be a string")
    .isLength({ min: 2, max: 30 })
    .withMessage("New tag must be between 2 and 30 characters"),
];
exports.validateDeleteTag = [
    body('tagToDelete')
      .notEmpty()
      .withMessage('Tag is required')  
      .isString()
      .withMessage('Tag must be a string'),
  ]; 
  exports.validateUpdateStatus = [
    body('newStatus')
      .notEmpty()
      .withMessage('New status is required') 
      .isIn(['active', 'archived', 'deleted']) 
      .withMessage('Invalid status value.'),
  ];
  exports.validateAvailability = [
    body('availability')
      .optional()  // becauseof default value
      .isIn(['public', 'private', 'friends', 'specific_groups'])  
      .withMessage('Invalid value.'),
  ];
exports.validateUpdateCaption = [
  body('caption')
  .notEmpty()
  .withMessage('Caption is required')
  .isLength({ max: 500 })
  .withMessage('Caption must be less than 500 characters') ,
];