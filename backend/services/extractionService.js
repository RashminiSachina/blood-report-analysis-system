const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');

/**
 * Extracts raw text from a given file path based on its mime type or extension.
 * Supports PDF via pdf-parse and images (JPG, PNG) via tesseract.js.
 *
 * @param {string} filePath - Absolute or relative path to the file
 * @param {string} mimeType - Mime type of the file (optional)
 * @returns {Promise<string>} Extracted raw text
 */
async function extractTextFromFile(filePath, mimeType = '') {
  if (!fs.existsSync(filePath)) {
    const error = new Error('File not found on server');
    error.statusCode = 400;
    throw error;
  }

  const ext = path.extname(filePath).toLowerCase();
  const isPdf = mimeType === 'application/pdf' || ext === '.pdf';
  const isImage =
    mimeType.startsWith('image/') ||
    ['.jpg', '.jpeg', '.png'].includes(ext);

  if (!isPdf && !isImage) {
    const error = new Error('Unsupported file format. Please upload a PDF, JPG, or PNG file.');
    error.statusCode = 400;
    throw error;
  }

  let extractedText = '';

  try {
    if (isPdf) {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text || '';
    } else if (isImage) {
      const result = await Tesseract.recognize(filePath, 'eng');
      extractedText = result?.data?.text || '';
    }
  } catch (err) {
    console.error('[extractionService] Extraction error:', err.message);
    const error = new Error('Failed to read report contents. The file may be corrupt or unreadable.');
    error.statusCode = 400;
    throw error;
  }

  const cleanedText = extractedText.trim();
  if (!cleanedText) {
    const error = new Error("We couldn't read this report. Try a clearer photo or a text-based PDF.");
    error.statusCode = 422;
    throw error;
  }

  return cleanedText;
}

module.exports = {
  extractTextFromFile,
};
