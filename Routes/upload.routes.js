const express = require("express");
const router = express.Router();
const {
  upload,
  processImage,
  validateUploadedFiles,
  handleUploadErrors
} = require('../Middlewares/fileUpload.middleware');
const postsController = require("../Controllers/posts.controller");
const messageController = require("../Controllers/messageController");
const usersController = require('../Controllers/users.controller');

// Profile picture with enhanced validation
router.post('/profilepic',
  upload.single('avatar'),
  validateUploadedFiles,
  processImage,
  usersController.changeAvatar
);

// Cover picture with enhanced validation
router.post('/coverpic',
  upload.single('coverphoto'),
  validateUploadedFiles,
  processImage,
  usersController.changeCover
);

// Post attachments with enhanced validation
router.post('/posts',
  upload.array('media', 5),
  validateUploadedFiles,
  processImage,
  postsController.createPost
);

// Message attachments with enhanced validation
router.post('/messages',
  upload.single('attachment'),
  validateUploadedFiles,
  processImage,
  messageController.sendMessage
);

// Test endpoint to check upload functionality
router.post('/test',
  upload.array('files', 3),
  validateUploadedFiles,
  processImage,
  (req, res) => {
    res.json({
      success: true,
      message: 'Files processed successfully',
      processedFiles: req.processedFiles,
      errors: req.fileProcessingErrors || [],
      summary: {
        totalFiles: req.processedFiles?.length || 0,
        errorCount: req.fileProcessingErrors?.length || 0
      }
    });
  }
);

// Error handling middleware (should be last)
router.use(handleUploadErrors);

module.exports = router;
