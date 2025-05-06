const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure folder exists
const ensureDirExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Set up storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'general'; // Default folder

        const url = req.originalUrl.toLowerCase();

        if (url.includes('/profilepic')) {
            folder = 'avatar';
        } else if (url.includes('/coverpic')) {
            folder = 'cover';
        } else if (url.includes('/posts')) {
            folder = 'posts';
        } else if (url.includes('/messages')) {
            folder = 'messages';
        }

        const uploadPath = path.join(__dirname, '../public/uploads', folder);
        ensureDirExists(uploadPath);
        cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4',
        'audio/mpeg', 'audio/wav'
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images, videos, and audio are allowed.'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

module.exports = upload;
