const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Configure Multer to store files temporarily
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = './tmp/';
    // Create 'tmp' directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 2. File filter (allow only specific file types)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images (JPEG/PNG/WEBP) and MP4 videos are allowed'), false);
  }
};

// 3. Initialize Multer with configurations
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB (Cloudinary's max)
    files: 5 // Maximum 5 files per upload
  }
});

module.exports = upload;