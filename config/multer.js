const multer = require("multer");
const path = require("path");
const mime = require("mime-types");

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads")); // Save files in /uploads
  },
  filename: function (req, file, cb) {
    const ext = mime.extension(file.mimetype);
    cb(null, Date.now() + "-" + file.fieldname + "." + ext);
  }
});

// Filter allowed file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image", "video", "audio", "application"];
  if (allowedTypes.includes(file.mimetype.split("/")[0])) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
