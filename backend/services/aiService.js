const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

const SYSTEM_PROMPT = `You are an expert Clinical Laboratory Report Analyzer for a healthcare application.

Your role is to accurately analyze laboratory reports and explain the results in simple language for educational purposes only.

You will receive raw OCR text extracted from a laboratory report, and optionally the original report image.

===========================
PRIMARY OBJECTIVE
===========================

Extract ALL laboratory test parameters that explicitly exist in the report.

Never invent, estimate, assume, infer, predict, hallucinate, or generate laboratory values.

Every parameter in your response MUST be directly supported by the report text.

===========================
CRITICAL RULES
===========================

1. Analyze ONLY laboratory test results.

2. Ignore ALL non-laboratory information including hospital name, patient info, doctor name, dates, footer text, etc.

3. Extract every laboratory parameter found. Ensure that you do not miss any parameters. Specifically ensure that parameters like Hemoglobin (Hb), MCH, RDW, Eosinophils, MPV, Serum Iron, TIBC, C-Reactive Protein (CRP), and any others present are extracted.

4. Decimal and Numeric values MUST be preserved exactly as they appear. 
- Look specifically for decimal points, e.g., '1.8' vs '18', '13.2' vs '132'. Make sure you do not miss or drop any decimal points. 
- Never round values or omit digits after the decimal point. If a value is 1.8, extract 1.8 (do not extract 18).

===========================
REFERENCE RANGE RULES
===========================

If the laboratory report contains a reference range:
Use ONLY that laboratory reference range. Do NOT replace it. Do NOT modify it.
Set "referenceSource":"report"

If no laboratory reference range exists:
Use a standard adult reference range.
Set "referenceSource":"standard"

===========================
STATUS RULES
===========================

Determine status using the reference range.
Possible values: low | normal | high | unknown

If status cannot be determined, return "status":"unknown"

===========================
EXPLANATION RULES
===========================

Each explanation must:
• be 2–3 short sentences
• explain what the laboratory test measures
• explain whether the value is within the reference range
• use simple language
• never diagnose disease
• never recommend medication
• never recommend treatment

If abnormal simply say:
"This result is outside the reference range and is worth discussing with your healthcare provider."

===========================
SUMMARY RULES
===========================

Generate a concise summary describing the total count of parameters checked and out of range parameters.

===========================
OUTPUT FORMAT
===========================

Return ONLY valid JSON.
Do NOT include markdown code fences or any text outside JSON.

Return exactly this JSON schema:
{
  "summary": "string",
  "parameters": [
    {
      "name": "string",
      "abbreviation": "string",
      "value": number,
      "unit": "string",
      "referenceRange": "string",
      "referenceSource": "report | standard",
      "referenceLow": number | null,
      "referenceHigh": number | null,
      "status": "low | normal | high | unknown",
      "explanation": "string"
    }
  ],
  "disclaimer": "This explanation is for educational purposes only and is not a medical diagnosis. Always consult a qualified healthcare professional regarding your laboratory results."
}`;

function cleanJsonResponse(rawText) {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  }
  return cleaned.trim();
}

function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType: mimeType
    },
  };
}

/**
 * Parses ranges to ensure deterministic status.
 */
function parseRange(rangeStr) {
  if (!rangeStr) return { low: null, high: null };
  const str = String(rangeStr).trim();
  
  // Try pattern X - Y or X-Y or X to Y (includes en-dash, em-dash, hyphen, space)
  const rangeRegex = /(\d+(?:\.\d+)?)\s*[-–—to|\s]+\s*(\d+(?:\.\d+)?)/i;
  const rangeMatches = str.match(rangeRegex);
  if (rangeMatches) {
    return {
      low: parseFloat(rangeMatches[1]),
      high: parseFloat(rangeMatches[2])
    };
  }
  
  // Try pattern < X
  const lessRegex = /<\s*(\d+(?:\.\d+)?)/;
  const lessMatches = str.match(lessRegex);
  if (lessMatches) {
    return {
      low: 0,
      high: parseFloat(lessMatches[1])
    };
  }

  // Try pattern <= X
  const lessEqRegex = /<=\s*(\d+(?:\.\d+)?)/;
  const lessEqMatches = str.match(lessEqRegex);
  if (lessEqMatches) {
    return {
      low: 0,
      high: parseFloat(lessEqMatches[1])
    };
  }

  // Try pattern > X
  const greaterRegex = />\s*(\d+(?:\.\d+)?)/;
  const greaterMatches = str.match(greaterRegex);
  if (greaterMatches) {
    return {
      low: parseFloat(greaterMatches[1]),
      high: Infinity
    };
  }

  // Try pattern >= X
  const greaterEqRegex = />=\s*(\d+(?:\.\d+)?)/;
  const greaterEqMatches = str.match(greaterEqRegex);
  if (greaterEqMatches) {
    return {
      low: parseFloat(greaterEqMatches[1]),
      high: Infinity
    };
  }

  // Try pattern "Up to X"
  const upToRegex = /up\s+to\s+(\d+(?:\.\d+)?)/i;
  const upToMatches = str.match(upToRegex);
  if (upToMatches) {
    return {
      low: 0,
      high: parseFloat(upToMatches[1])
    };
  }

  return { low: null, high: null };
}

/**
 * Programmatic validation to ensure math correctness
 */
function validateAndCorrectParameters(parameters) {
  if (!Array.isArray(parameters)) return [];
  
  return parameters.map(param => {
    // Make sure name, value, unit are clean
    const value = param.value !== undefined && param.value !== null ? parseFloat(param.value) : null;
    
    // Auto-calculate bounds if not provided
    let low = param.referenceLow !== undefined ? param.referenceLow : null;
    let high = param.referenceHigh !== undefined ? param.referenceHigh : null;
    
    if (low === null && high === null && param.referenceRange) {
      const parsed = parseRange(param.referenceRange);
      low = parsed.low;
      high = parsed.high;
    }
    
    const parsedParam = {
      ...param,
      value,
      referenceLow: low,
      referenceHigh: high
    };

    if (value !== null && !isNaN(value)) {
      const originalStatus = (param.status || 'unknown').toLowerCase();
      let calculatedStatus = 'normal';

      if (low !== null && high !== null) {
        if (value < low) calculatedStatus = 'low';
        else if (value > high) calculatedStatus = 'high';
      } else if (high !== null) {
        if (value > high) calculatedStatus = 'high';
      } else if (low !== null) {
        if (value < low) calculatedStatus = 'low';
      } else {
        calculatedStatus = originalStatus;
      }
      
      // If calculated status differs from the AI-provided status, correct it
      if (calculatedStatus !== originalStatus) {
        console.log(`[aiService] Overwriting status mismatch for ${param.name}: AI said '${originalStatus}', calculated '${calculatedStatus}'`);
        parsedParam.status = calculatedStatus;
        
        // Re-write explanation to avoid diagnosing and reflect corrected status
        if (calculatedStatus === 'normal') {
          parsedParam.explanation = `This value of ${value} ${param.unit || ''} is within the expected range of ${param.referenceRange || ''}.`;
        } else {
          parsedParam.explanation = `This result is outside the reference range and is worth discussing with your healthcare provider.`;
        }
      }
    }
    
    return parsedParam;
  });
}

/**
 * Calls Gemini to analyze extracted report text/image and return structured JSON.
 */
async function analyzeReportText(reportText, filePath = null, mimeType = null) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Using gemini-3.5-flash — supports multimodal input and generateContent
  const model = genAI.getGenerativeModel({
    model: "gemini-3.5-flash"
  });

  const isImage = mimeType && (
    mimeType.startsWith('image/') ||
    ['.jpg', '.jpeg', '.png'].includes(path.extname(filePath || '').toLowerCase())
  );

  const makeApiCall = async (extraInstruction = '') => {
    const promptText = `
${SYSTEM_PROMPT}

Report Text:
${reportText}

${extraInstruction}
`;

    const parts = [promptText];

    if (filePath && isImage && fs.existsSync(filePath)) {
      console.log(`[aiService] Including image in Gemini multimodal request: ${filePath}`);
      try {
        parts.push(fileToGenerativePart(filePath, mimeType));
      } catch (err) {
        console.error('[aiService] Failed to read image bytes:', err.message);
      }
    } else {
      console.log('[aiService] Text-only analysis mode');
    }

    console.log("Sending request to Gemini...");
    const response = await model.generateContent(parts);
    console.log("Gemini response received");
    return response.response.text();
  };

  let rawResponse = '';
  try {
    rawResponse = await makeApiCall();
    const cleaned = cleanJsonResponse(rawResponse);
    const parsed = JSON.parse(cleaned);

    if (!parsed.parameters || !Array.isArray(parsed.parameters)) {
      throw new Error('Response JSON missing parameters array');
    }

    // Run programmatic validation
    parsed.parameters = validateAndCorrectParameters(parsed.parameters);

    // Re-verify the counts for the overall summary check
    const totalCount = parsed.parameters.length;
    const outOfRange = parsed.parameters.filter(p => p.status === 'low' || p.status === 'high').length;
    parsed.summary = outOfRange === 0 
      ? `All ${totalCount} identified laboratory parameters are within their reference ranges.`
      : `${totalCount} laboratory parameters were identified. ${outOfRange} result${outOfRange === 1 ? '' : 's'} are outside the laboratory reference range.`;

    return parsed;
  } catch (firstErr) {
    console.warn('[aiService] First attempt failed:', firstErr.message);
    try {
      rawResponse = await makeApiCall('CRITICAL: Output ONLY valid JSON matching the exact schema. Do not include markdown code block syntax or extra text.');
      const cleaned = cleanJsonResponse(rawResponse);
      const parsed = JSON.parse(cleaned);
      if (!parsed.parameters || !Array.isArray(parsed.parameters)) {
        throw new Error('Response JSON missing parameters array on retry');
      }

      parsed.parameters = validateAndCorrectParameters(parsed.parameters);
      
      const totalCount = parsed.parameters.length;
      const outOfRange = parsed.parameters.filter(p => p.status === 'low' || p.status === 'high').length;
      parsed.summary = outOfRange === 0 
        ? `All ${totalCount} identified laboratory parameters are within their reference ranges.`
        : `${totalCount} laboratory parameters were identified. ${outOfRange} result${outOfRange === 1 ? '' : 's'} are outside the laboratory reference range.`;

      return parsed;
    } catch (secondErr) {
      console.error('[aiService] Failed to parse Gemini output:', secondErr.message);
      const err = new Error('Analysis is temporarily unavailable, please try again');
      err.statusCode = 502;
      throw err;
    }
  }
}

module.exports = {
  analyzeReportText,
};
