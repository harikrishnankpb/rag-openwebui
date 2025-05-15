const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const upload = require('../middleware/upload');

// Upload a new file
router.post('/upload', upload.single('file'), fileController.uploadFile);

// Get all files
router.get('/', fileController.getAllFiles);

// Search similar content across files
router.get('/search', fileController.searchContent);

// Get a specific file by ID
router.get('/:id', fileController.getFileById);

// Delete a file
router.delete('/:id', fileController.deleteFile);

// Get extracted content from a file
router.get('/:id/content', fileController.getFileContent);

module.exports = router; 