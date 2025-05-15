const File = require('../models/file');
const { extractContent } = require('../utils/fileExtractor');
const vectorDB = require('../utils/vectordb');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { splitText } = require('../utils/textSplitter')
const crypto = require('crypto');

/**
 * Upload a file and extract content if possible
 */
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract text content based on file type
    let extractedText = null;
    try {
      extractedText = await extractContent(req.file);
    } catch (error) {
      console.error('Error extracting content:', error);
      // Continue with file upload even if extraction fails
    }

    const hash = crypto.createHash('sha256').update(extractedText).digest('hex');



    const chunks = await splitText(extractedText)


    // Create file record in database
    const uuid = uuidv4()
    const isDuplicate = await File.findOne({ hash: hash })
    if (isDuplicate) {
      return res.status(400).json({ error: 'File already exists' });
    }
    const file = new File({
      filename: uuid,
      originalname: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      extractedContent: extractedText,
      hash: hash
    });

    await file.save();

    // Store extracted content in vector database if available
    if (extractedText) {


      try {
        for (const [index, chunk] of chunks.entries()) {
          const fileId = file._id.toString();
          const vectorId = `${fileId}_${index}`;
          await vectorDB.storeVector(vectorId, chunk, {
            fileId: fileId,
            filename: file.originalname,
            mimetype: file.mimetype,
            chunkIndex: index,
            totalChunks: chunks.length,
            hash: hash
          });
        }
        // await vectorDB.storeVector(file._id.toString(), extractedText, {
        //   filename: file.originalname,
        //   mimetype: file.mimetype,
        //   fileId: file._id.toString()
        // });
      } catch (error) {
        console.error('Error storing vector in ChromaDB:', error);
        // Continue even if vector storage fails
      }
    }

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: file._id,
        filename: file.originalname,
        size: file.size,
        contentExtracted: !!extractedText
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

/**
 * Get all files
 */
exports.getAllFiles = async (req, res) => {
  try {
    const files = await File.find().select('_id originalname filename mimetype size createdAt');
    res.status(200).json({ files });
  } catch (error) {
    console.error('Error getting files:', error);
    res.status(500).json({ error: 'Failed to retrieve files' });
  }
};

/**
 * Get file by ID
 */
exports.getFileById = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.status(200).json({ file });
  } catch (error) {
    console.error('Error getting file:', error);
    res.status(500).json({ error: 'Failed to retrieve file' });
  }
};

/**
 * Delete file by ID
 */
exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete file from filesystem
    try {
      await fs.unlink(file.path);
    } catch (err) {
      console.error('Error deleting file from filesystem:', err);
      // Continue with database deletion even if file removal fails
    }

    // Delete from vector database if content was extracted
    if (file.extractedContent) {
      try {
        await vectorDB.deleteVectorByFileId(file._id.toString());
      } catch (error) {
        console.error('Error deleting vector from ChromaDB:', error);
        // Continue with deletion even if vector deletion fails
      }
    }

    // Delete file from database
    await File.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
};

/**
 * Get extracted content from a file
 */
exports.getFileContent = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (!file.extractedContent) {
      return res.status(404).json({ error: 'No content extracted from this file' });
    }

    res.status(200).json({
      fileId: file._id,
      filename: file.originalname,
      content: file.extractedContent
    });
  } catch (error) {
    console.error('Error getting file content:', error);
    res.status(500).json({ error: 'Failed to retrieve file content' });
  }
};

/**
 * Search for similar content across files
 */
exports.searchContent = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Search for similar content in vector database
    const results = await vectorDB.search(query, 5);

    // Fetch additional file details from MongoDB
    const enhancedResults = await Promise.all(
      results.map(async (result) => {
        try {
          const file = await File.findById(result.id);
          return {
            ...result,
            file: file ? {
              id: file._id,
              filename: file.originalname,
              mimetype: file.mimetype,
              createdAt: file.createdAt
            } : null
          };
        } catch (error) {
          console.error(`Error fetching file details for ${result.id}:`, error);
          return result;
        }
      })
    );

    res.status(200).json({
      query,
      results: enhancedResults
    });
  } catch (error) {
    console.error('Error searching content:', error);
    res.status(500).json({ error: 'Failed to search content' });
  }
}; 