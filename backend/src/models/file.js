const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalname: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  extractedContent: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  hash:{
    type: String,
    required: true
  }
});

module.exports = mongoose.model('File', fileSchema); 