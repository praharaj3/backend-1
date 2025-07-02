const express = require('express');
const router = express.Router();
const authMiddlewares = require('../middlewares/auth');
const upload = require('../config/multer-config');
const cloudinary = require('../config/cloudinary.config');
const filesModel = require('../models/files.model');
const fs = require('fs');

// Protected Home Route
router.get("/home", authMiddlewares, async (req, res) => {
  const userFiles = await filesModel.find({ user: req.user.userId });
  res.render("home", { 
    files: userFiles,
    user: req.user,
    uploadSuccess: req.query.uploadSuccess
  });
});

// File Upload Route
router.post("/upload", authMiddlewares, upload.single('file'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: `user_uploads/${req.user.userId}`,
      resource_type: 'auto'
    });

    await filesModel.create({
      path: result.secure_url,
      originalname: req.file.originalname,
      user: req.user.userId
    });

    fs.unlinkSync(req.file.path);
    res.redirect('/home?uploadSuccess=true');
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).render("home", { 
      error: "File upload failed",
      user: req.user
    });
  }
});

module.exports = router;