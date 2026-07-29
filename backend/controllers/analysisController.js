const fs = require('fs');
const path = require('path');
const { extractTextFromFile } = require('../services/extractionService');
const { analyzeReportText } = require('../services/aiService');

// Simple in-memory report cache for fast lookup alongside filesystem
const reportStore = new Map();

/**
 * Handle report file upload via Multer.
 * POST /api/reports/upload
 */
async function uploadReportFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No report file uploaded. Please select a PDF, JPG, or PNG file.',
      });
    }

    const reportId = req.file.filename;
    const record = {
      id: reportId,
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date(),
    };

    reportStore.set(reportId, record);

    return res.status(201).json({
      success: true,
      reportId: reportId,
      file: record,
    });
  } catch (err) {
    console.error('[analysisController] Upload error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload report file.',
    });
  }
}

/**
 * Analyze an uploaded blood report by ID.
 * POST /api/reports/:id/analyze
 */
async function analyzeReport(req, res) {
  const { id } = req.params;

  try {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    let filePath = null;
    let mimeType = '';

    // Check store first
    if (reportStore.has(id)) {
      const record = reportStore.get(id);
      filePath = record.path;
      mimeType = record.mimetype;
    } else {
      // Direct file lookup in uploads/ directory by filename or id
      const directPath = path.join(uploadsDir, id);
      if (fs.existsSync(directPath)) {
        filePath = directPath;
        const ext = path.extname(id).toLowerCase();
        if (ext === '.pdf') mimeType = 'application/pdf';
        else if (['.jpg', '.jpeg'].includes(ext)) mimeType = 'image/jpeg';
        else if (ext === '.png') mimeType = 'image/png';
      } else {
        // Look for matching filename starting with id
        const files = fs.readdirSync(uploadsDir);
        const matched = files.find((f) => f.includes(id));
        if (matched) {
          filePath = path.join(uploadsDir, matched);
          const ext = path.extname(matched).toLowerCase();
          if (ext === '.pdf') mimeType = 'application/pdf';
          else if (['.jpg', '.jpeg'].includes(ext)) mimeType = 'image/jpeg';
          else if (ext === '.png') mimeType = 'image/png';
        }
      }
    }

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Report file not found. Please upload your report again.',
      });
    }

    // Step 1: Extract text
    const extractedText = await extractTextFromFile(filePath, mimeType);

    // Step 2: Send text to AI Service
    const aiResult = await analyzeReportText(extractedText);

    // Step 3: Return structured analysis response
    return res.status(200).json({
      success: true,
      summary: aiResult.summary || 'Summary unavailable.',
      parameters: aiResult.parameters || [],
      disclaimer:
        aiResult.disclaimer ||
        'This is an educational summary, not a medical diagnosis. Always discuss your results with a qualified healthcare professional.',
    });
  } catch (err) {
    console.error('[analysisController] Analysis error:', err.message);

    const statusCode = err.statusCode || 500;
    const clientMessage =
      statusCode === 502
        ? 'Analysis is temporarily unavailable, please try again'
        : err.message || 'An unexpected error occurred during report analysis.';

    return res.status(statusCode).json({
      success: false,
      message: clientMessage,
    });
  }
}

module.exports = {
  uploadReportFile,
  analyzeReport,
};
