const multer = require('multer'); // Middleware for handling file uploads
const sharp = require('sharp'); // Library for processing images (resize, compress, thumbnails)
const path = require('path'); // Core module to handle file paths
const fs = require('fs').promises; // Use promises version for better async handling
const fsSync = require('fs'); // Keep sync version for some operations
const crypto = require('crypto'); // Module for generating secure and unique filenames

// Configuration constants
const MAX_FILE_SIZE = {
  image: 5 * 1024 * 1024,    // 5MB for images
  video: 50 * 1024 * 1024,   // 50MB for videos
  audio: 10 * 1024 * 1024,   // 10MB for audio
  default: 10 * 1024 * 1024  // 10MB default
};

const IMAGE_QUALITY = {
  high: { width: 1920, height: 1080, quality: 90 },
  medium: { width: 1280, height: 720, quality: 85 },
  thumbnail: { width: 300, height: 300, quality: 80 }
};

const ALLOWED_MIME_TYPES = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif'],
  videos: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3']
};

//  Ensure the upload directory exists, create it if not
const ensureDirExists = (dirPath) => {
  if (!fsSync.existsSync(dirPath)) {
    fsSync.mkdirSync(dirPath, { recursive: true });
  }
};

// Helper function to get file type category
const getFileTypeCategory = (mimetype) => {
  if (ALLOWED_MIME_TYPES.images.includes(mimetype)) return 'image';
  if (ALLOWED_MIME_TYPES.videos.includes(mimetype)) return 'video';
  if (ALLOWED_MIME_TYPES.audio.includes(mimetype)) return 'audio';
  return null;
};

// Helper function to get max file size based on type
const getMaxFileSize = (mimetype) => {
  const category = getFileTypeCategory(mimetype);
  return MAX_FILE_SIZE[category] || MAX_FILE_SIZE.default;
};

// Enhanced file validation
const validateFile = (file) => {
  const category = getFileTypeCategory(file.mimetype);
  if (!category) {
    throw new Error(`Unsupported file type: ${file.mimetype}`);
  }

  const maxSize = getMaxFileSize(file.mimetype);
  if (file.size > maxSize) {
    throw new Error(`File too large. Maximum size for ${category} files is ${Math.round(maxSize / (1024 * 1024))}MB`);
  }

  return category;
};

//  Configure disk storage
const storage = multer.diskStorage({
  // Set upload destination based on request URL
  destination: (req, file, cb) => {
    let folder = 'general'; // Default folder
    const url = req.originalUrl.toLowerCase();

    // Dynamically determine upload folder
    if (url.includes('/avatar')) {
      folder = 'avatar';
    } else if (url.includes('/cover')) {
      folder = 'cover';
    } else if (url.includes('/posts')) {
      folder = 'posts';
    } else if (url.includes('/messages')) {
      folder = 'messages';
    }

    const uploadPath = path.join(__dirname, '../public/uploads', folder);
    ensureDirExists(uploadPath); // Create folder if it doesn't exist
    file.folder = folder; // Save folder name to use later
    cb(null, uploadPath);
  },

  // Generate unique file name using timestamp + random string
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname); // e.g., .jpg, .png
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_'); // Clean file name
    cb(null, `${Date.now()}_${uniqueSuffix}_${name}${ext}`);
  }
});

//  Enhanced file filter with better validation
const fileFilter = (req, file, cb) => {
  try {
    const category = validateFile(file);
    console.log(`File accepted: ${file.originalname} (${category})`);
    cb(null, true);
  } catch (error) {
    console.error(`File rejected: ${file.originalname} - ${error.message}`);
    cb(error);
  }
};

//  Enhanced Multer configuration with dynamic limits
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE.default, // Default max file size
    files: 10, // Maximum number of files
    fieldSize: 1024 * 1024, // Maximum field value size (1MB)
    fieldNameSize: 100, // Maximum field name size
    headerPairs: 2000 // Maximum number of header key-value pairs
  }
});

//  Enhanced middleware to process images with better error handling and logging
const processImage = async (req, _res, next) => {
  if (!req.files && !req.file) return next(); // Skip if no files

  const startTime = Date.now();
  console.log('🔄 Starting file processing...');

  try {
    // Handle both single file and multiple files
    let files = [];
    if (req.files) {
      // If req.files is an array (from upload.array())
      if (Array.isArray(req.files)) {
        files = req.files;
      } else {
        // If req.files is an object with field names (from upload.fields())
        files = Object.values(req.files).flat();
      }
    } else if (req.file) {
      // Single file from upload.single()
      files = [req.file];
    }

    console.log(`📁 Processing ${files.length} file(s)`);
    const processed = [];
    const errors = [];

    for (const [index, file] of files.entries()) {
      try {
        console.log(`📄 Processing file ${index + 1}/${files.length}: ${file.originalname}`);

        // If the uploaded file is an image, process it
        if (file.mimetype.startsWith('image/')) {
          const inputPath = file.path;
          const folder = file.folder || 'general';

          // Output processed image path (same name but _processed.jpg)
          const outputPath = inputPath.replace(/\.[^/.]+$/, '_processed.jpg');
          const thumbPath = inputPath.replace(/\.[^/.]+$/, '_thumb.jpg');

          // Get image metadata for logging
          const metadata = await sharp(inputPath).metadata();
          console.log(`🖼️  Original image: ${metadata.width}x${metadata.height}, ${Math.round(file.size / 1024)}KB`);

          //  Resize and compress image using dynamic quality settings
          const highQuality = IMAGE_QUALITY.high;
          await sharp(inputPath)
            .resize(highQuality.width, highQuality.height, {
              fit: 'inside',
              withoutEnlargement: true
            })
            .jpeg({
              quality: highQuality.quality,
              progressive: true,
              mozjpeg: true // Better compression
            })
            .toFile(outputPath);

          //  Create square thumbnail with better quality
          const thumbQuality = IMAGE_QUALITY.thumbnail;
          await sharp(inputPath)
            .resize(thumbQuality.width, thumbQuality.height, {
              fit: 'cover',
              position: 'center'
            })
            .jpeg({
              quality: thumbQuality.quality,
              progressive: true
            })
            .toFile(thumbPath);

          // Get processed file sizes for logging
          const processedStats = await fs.stat(outputPath);
          const thumbStats = await fs.stat(thumbPath);

          console.log(`✅ Processed: ${Math.round(processedStats.size / 1024)}KB, Thumbnail: ${Math.round(thumbStats.size / 1024)}KB`);

          //  Delete original uploaded image after processing
          await fs.unlink(inputPath);

          // Save processed file info to send in response
          processed.push({
            originalName: file.originalname,
            mimetype: file.mimetype,
            originalSize: file.size,
            processedSize: processedStats.size,
            url: `/uploads/${folder}/${path.basename(outputPath)}`,
            thumbnailUrl: `/uploads/${folder}/${path.basename(thumbPath)}`,
            metadata: {
              originalDimensions: `${metadata.width}x${metadata.height}`,
              processedDimensions: `${highQuality.width}x${highQuality.height}`,
              compressionRatio: Math.round((1 - processedStats.size / file.size) * 100)
            }
          });
        } else {
          // If the file is not an image, just return the uploaded file info
          console.log(`📎 Non-image file: ${file.originalname} (${Math.round(file.size / 1024)}KB)`);
          processed.push({
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `/uploads/${file.folder || 'general'}/${file.filename}`,
            thumbnailUrl: null
          });
        }
      } catch (fileError) {
        console.error(`❌ Error processing file ${file.originalname}:`, fileError.message);
        errors.push({
          filename: file.originalname,
          error: fileError.message
        });

        // Clean up failed file if it exists
        try {
          if (fsSync.existsSync(file.path)) {
            await fs.unlink(file.path);
          }
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError.message);
        }
      }
    }

    // Log processing summary
    const processingTime = Date.now() - startTime;
    console.log(`⏱️  Processing completed in ${processingTime}ms`);
    console.log(`✅ Successfully processed: ${processed.length} files`);

    if (errors.length > 0) {
      console.log(`❌ Failed to process: ${errors.length} files`);
      console.log('Errors:', errors);
    }

    // Attach processed files and any errors to the request
    req.processedFiles = processed;
    req.fileProcessingErrors = errors;

    // Continue even if some files failed (partial success)
    next();
  } catch (err) {
    console.error('❌ Critical error in file processing:', err);

    // Clean up any uploaded files on critical error
    const allFiles = [];
    if (req.files) {
      if (Array.isArray(req.files)) {
        allFiles.push(...req.files);
      } else {
        allFiles.push(...Object.values(req.files).flat());
      }
    } else if (req.file) {
      allFiles.push(req.file);
    }

    // Cleanup uploaded files
    for (const file of allFiles) {
      try {
        if (fsSync.existsSync(file.path)) {
          await fs.unlink(file.path);
        }
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError.message);
      }
    }

    next(err);
  }
};

// Middleware to validate uploaded files before processing
const validateUploadedFiles = (req, res, next) => {
  if (!req.files && !req.file) {
    return res.status(400).json({
      error: 'No files uploaded',
      message: 'At least one file is required'
    });
  }

  let files = [];
  if (req.files) {
    files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
  } else if (req.file) {
    files = [req.file];
  }

  // Additional validation can be added here
  console.log(`📋 Validating ${files.length} uploaded file(s)`);

  for (const file of files) {
    console.log(`   - ${file.originalname} (${file.mimetype}, ${Math.round(file.size / 1024)}KB)`);
  }

  next();
};

// Middleware for handling upload errors
const handleUploadErrors = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.error('Multer Error:', error);

    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          error: 'File too large',
          message: `Maximum file size is ${Math.round(MAX_FILE_SIZE.default / (1024 * 1024))}MB`,
          code: 'FILE_TOO_LARGE'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          error: 'Too many files',
          message: 'Maximum 10 files allowed per upload',
          code: 'TOO_MANY_FILES'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          error: 'Unexpected file field',
          message: 'File field name not recognized',
          code: 'UNEXPECTED_FIELD'
        });
      default:
        return res.status(400).json({
          error: 'Upload error',
          message: error.message,
          code: error.code
        });
    }
  }

  if (error.message && error.message.includes('Unsupported file type')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: error.message,
      code: 'INVALID_FILE_TYPE',
      allowedTypes: {
        images: ALLOWED_MIME_TYPES.images,
        videos: ALLOWED_MIME_TYPES.videos,
        audio: ALLOWED_MIME_TYPES.audio
      }
    });
  }

  next(error);
};

//  Export all middleware functions
module.exports = {
  upload,
  processImage,
  validateUploadedFiles,
  handleUploadErrors,
  // Export configuration for external use
  config: {
    MAX_FILE_SIZE,
    IMAGE_QUALITY,
    ALLOWED_MIME_TYPES
  }
};
