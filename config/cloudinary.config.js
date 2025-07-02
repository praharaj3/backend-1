const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Validate required environment variables
const requiredConfig = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingConfig = requiredConfig.filter(key => !process.env[key]);

if (missingConfig.length > 0) {
  throw new Error(`Missing required Cloudinary config: ${missingConfig.join(', ')}`);
}

// Main configuration
const config = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
  api_proxy: process.env.CLOUDINARY_PROXY, // Optional
  cdn_subdomain: true
};

cloudinary.config(config);

// Test connection on startup
cloudinary.api.ping((error, result) => {
  if (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
  } else {
    console.log('✅ Cloudinary connected successfully');
    console.log(`ℹ️ Account: ${config.cloud_name}`);
  }
});

// Custom methods for better error handling
cloudinary.secureUpload = async (filePath, options = {}) => {
  try {
    return await cloudinary.uploader.upload(filePath, {
      folder: 'secure_uploads',
      resource_type: 'auto',
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || 'default_preset',
      ...options
    });
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
};

module.exports = cloudinary;