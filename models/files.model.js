const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  path: {
    type: String,
    required: [true, "File path is required"]
  },
  originalname: {
    type: String,
    required: [true, "Original file name is required"]
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"]
  }
});

const File = mongoose.model("File", fileSchema);
module.exports = File;