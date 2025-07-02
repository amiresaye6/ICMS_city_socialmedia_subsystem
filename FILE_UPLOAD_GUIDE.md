# File Upload Middleware Guide

## Overview
Enhanced file upload middleware with advanced image processing, validation, and error handling.

## Features

### ✅ **Enhanced Security**
- File type validation with comprehensive MIME type checking
- Dynamic file size limits based on file type
- Secure filename generation with crypto
- Path traversal protection

### ✅ **Advanced Image Processing**
- Automatic image compression and resizing
- Multiple quality levels (high, medium, thumbnail)
- Progressive JPEG encoding
- Metadata extraction and logging
- Thumbnail generation

### ✅ **Better Error Handling**
- Detailed error messages with error codes
- Partial success handling (some files succeed, others fail)
- Automatic cleanup on errors
- Comprehensive logging

### ✅ **Performance Optimizations**
- Async/await for better performance
- Batch processing with individual error handling
- Memory-efficient image processing
- Processing time tracking

## Configuration

### File Size Limits
```javascript
const MAX_FILE_SIZE = {
  image: 5 * 1024 * 1024,    // 5MB for images
  video: 50 * 1024 * 1024,   // 50MB for videos
  audio: 10 * 1024 * 1024,   // 10MB for audio
  default: 10 * 1024 * 1024  // 10MB default
};
```

### Image Quality Settings
```javascript
const IMAGE_QUALITY = {
  high: { width: 1920, height: 1080, quality: 90 },
  medium: { width: 1280, height: 720, quality: 85 },
  thumbnail: { width: 300, height: 300, quality: 80 }
};
```

### Supported File Types
- **Images**: JPEG, PNG, GIF, WebP, AVIF
- **Videos**: MP4, MPEG, QuickTime, AVI
- **Audio**: MP3, WAV, OGG

## Usage Examples

### Basic Upload with Processing
```javascript
const { upload, processImage } = require('./fileUpload.middleware');

router.post('/upload', 
  upload.single('file'), 
  processImage, 
  (req, res) => {
    res.json({
      success: true,
      files: req.processedFiles,
      errors: req.fileProcessingErrors
    });
  }
);
```

### Multiple Files with Validation
```javascript
const { upload, processImage, validateUploadedFiles } = require('./fileUpload.middleware');

router.post('/upload-multiple', 
  upload.array('files', 5),
  validateUploadedFiles,
  processImage, 
  (req, res) => {
    res.json({
      success: true,
      processed: req.processedFiles.length,
      errors: req.fileProcessingErrors?.length || 0
    });
  }
);
```

### Error Handling
```javascript
const { handleUploadErrors } = require('./fileUpload.middleware');

// Add this after your upload routes
app.use(handleUploadErrors);
```

## Response Format

### Successful Image Processing
```json
{
  "originalName": "photo.jpg",
  "mimetype": "image/jpeg",
  "originalSize": 2048576,
  "processedSize": 512000,
  "url": "/uploads/posts/processed_image.jpg",
  "thumbnailUrl": "/uploads/posts/thumbnail.jpg",
  "metadata": {
    "originalDimensions": "3000x2000",
    "processedDimensions": "1920x1080",
    "compressionRatio": 75
  }
}
```

### Error Response
```json
{
  "error": "File too large",
  "message": "Maximum file size for image files is 5MB",
  "code": "FILE_TOO_LARGE"
}
```

## Logging
The middleware provides detailed console logging:
- 🔄 Processing start/completion
- 📁 File count and details
- 📄 Individual file processing
- 🖼️ Image metadata and compression stats
- ✅ Success confirmations
- ❌ Error details with cleanup info
- ⏱️ Processing time tracking

## Best Practices
1. Always use `processImage` after `upload` for image files
2. Implement proper error handling with `handleUploadErrors`
3. Use `validateUploadedFiles` for additional validation
4. Check `req.fileProcessingErrors` for partial failures
5. Monitor processing times for performance optimization
