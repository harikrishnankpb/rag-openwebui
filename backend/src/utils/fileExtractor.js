const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extract text content from various file types
 * @param {Object} file - File object containing path and mimetype
 * @returns {Promise<string>} Extracted text content
 */
const extractContent = async (file) => {
  try {
    const filePath = file.path;
    const mimetype = file.mimetype;

    if (mimetype === 'application/pdf') {
      // Handle PDF files
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } 
    else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Handle DOCX files
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }
    else if (mimetype === 'text/plain') {
      // Handle plain text files
      return fs.readFileSync(filePath, 'utf8');
    }
    else {
      // Unsupported file type
      return `Text extraction not supported for mimetype: ${mimetype}`;
    }
  } catch (error) {
    console.error('Error extracting content:', error);
    throw error;
  }
};

module.exports = {
  extractContent
}; 