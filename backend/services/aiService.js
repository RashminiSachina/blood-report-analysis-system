const Anthropic = require('@anthropic-ai/sdk');

const SYSTEM_PROMPT = `You are an expert Clinical Laboratory Report Analyzer for a healthcare application.

Your role is to accurately analyze laboratory reports and explain the results in simple language for educational purposes only.

You will receive raw OCR text extracted from a laboratory report.

===========================
PRIMARY OBJECTIVE
===========================

Extract ONLY laboratory test parameters that explicitly exist in the report.

Never invent, estimate, assume, infer, predict, hallucinate, or generate laboratory values.

Every parameter in your response MUST be directly supported by the report text.

===========================
CRITICAL RULES
===========================

1. Analyze ONLY laboratory test results.

2. Ignore ALL non-laboratory information including but not limited to:
- Hospital name
- Laboratory name
- Logos
- Addresses
- Phone numbers
- Email addresses
- Website URLs
- Accreditation information
- Patient name
- Patient ID
- Doctor name
- Age
- Gender
- Dates
- Times
- Sample numbers
- Report numbers
- QR codes
- Barcodes
- Footer text
- Header text
- Signatures
- Watermarks
- Comments unrelated to laboratory values

3. Only include a laboratory parameter if ALL of the following are present:
- Parameter/Test name
- Numeric value
- Unit (if available)

4. Extract every laboratory parameter found.

Examples include but are not limited to:
CBC: Hemoglobin, RBC, WBC, Platelets, Hematocrit, MCV, MCH, MCHC, RDW
Biochemistry: Glucose, HbA1c, Urea, Creatinine, Sodium, Potassium, Calcium, Magnesium, Phosphorus
Liver Function: ALT, AST, ALP, GGT, Bilirubin, Albumin, Total Protein
Kidney Function: eGFR, Urea, Creatinine
Lipid Profile: Total Cholesterol, HDL, LDL, Triglycerides
Hormones: TSH, T3, T4, Cortisol, Testosterone, Estradiol
Iron Studies: Ferritin, Iron, Transferrin, TIBC
Inflammatory Markers: CRP, ESR
Coagulation: INR, PT, APTT
Vitamin Tests: Vitamin D, Vitamin B12, Folate
Copper Studies: Ceruloplasmin, Serum Copper
Urine Analysis: Protein, Glucose, Ketones, Blood, Nitrite, Leukocytes, Specific Gravity, pH
Any other laboratory parameter explicitly present.

===========================
STRICT EXTRACTION RULES
===========================

DO NOT create laboratory values.
DO NOT complete missing values.
DO NOT guess abbreviations.
DO NOT estimate units.
DO NOT estimate reference ranges.
DO NOT infer hidden values.

If a parameter cannot be confidently extracted, DO NOT include it.

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
• never recommend supplements
• never provide emergency advice

If abnormal simply say:
"This result is outside the reference range and is worth discussing with your healthcare provider."

===========================
SUMMARY RULES
===========================

Generate a concise summary.
Examples:
"All identified laboratory parameters are within their reference ranges."
OR
"Three laboratory parameters were identified. One result is outside the laboratory reference range."

Do not mention diseases.

===========================
VALIDATION RULES
===========================

Before producing the response:
Step 1: Count the number of laboratory parameters present in the report.
Step 2: Verify every parameter exists in the OCR text.
Step 3: Ensure the JSON contains EXACTLY the same number of parameters.

If no laboratory parameters exist, return:
{
 "summary":"No laboratory parameters could be extracted from this report.",
 "parameters":[],
 "disclaimer":"This explanation is for educational purposes only and is not a medical diagnosis. Always consult a qualified healthcare professional regarding your laboratory results."
}

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
  return cleaned;
}

/**
 * Calls Claude via Anthropic SDK to analyze extracted report text and return structured JSON.
 * If ANTHROPIC_API_KEY is missing/placeholder, returns a realistic mock response for demo testing.
 *
 * @param {string} reportText - Extracted text from blood report
 * @returns {Promise<Object>} Structured analysis JSON object
 */
async function analyzeReportText(reportText) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Fallback mock mode when ANTHROPIC_API_KEY is not configured
  if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
    console.warn('[aiService] ANTHROPIC_API_KEY is missing or unconfigured. Using demo mock response.');

    return {
      summary: 'Five laboratory parameters were identified. Two results are outside the reference range.',
      parameters: [
        {
          name: 'Hemoglobin',
          abbreviation: 'HGB',
          value: 11.2,
          unit: 'g/dL',
          referenceRange: '12.0 - 15.5',
          referenceSource: 'report',
          status: 'low',
          explanation: 'Hemoglobin is an iron-rich protein in red blood cells that carries oxygen throughout your body. This result is outside the reference range and is worth discussing with your healthcare provider.'
        },
        {
          name: 'White Blood Cell Count',
          abbreviation: 'WBC',
          value: 6.8,
          unit: 'x10^3 / µL',
          referenceRange: '4.5 - 11.0',
          referenceSource: 'report',
          status: 'normal',
          explanation: 'White blood cells are part of the immune system that helps defend the body against infections. Your result is within the healthy reference range.'
        },
        {
          name: 'Platelet Count',
          abbreviation: 'PLT',
          value: 245,
          unit: 'x10^3 / µL',
          referenceRange: '150 - 450',
          referenceSource: 'report',
          status: 'normal',
          explanation: 'Platelets are cell fragments that play a key role in blood clotting and wound healing. Your result is within the healthy reference range.'
        },
        {
          name: 'Total Cholesterol',
          abbreviation: 'CHO',
          value: 215,
          unit: 'mg/dL',
          referenceRange: '125 - 200',
          referenceSource: 'standard',
          status: 'high',
          explanation: 'Total cholesterol measures the total amount of lipids carried in your blood stream. This result is outside the reference range and is worth discussing with your healthcare provider.'
        },
        {
          name: 'Fasting Blood Glucose',
          abbreviation: 'GLU',
          value: 92,
          unit: 'mg/dL',
          referenceRange: '70 - 99',
          referenceSource: 'report',
          status: 'normal',
          explanation: 'Fasting blood glucose measures the concentration of sugar present in your blood after fasting. Your result is within the healthy reference range.'
        }
      ],
      disclaimer: 'This explanation is for educational purposes only and is not a medical diagnosis. Always consult a qualified healthcare professional regarding your laboratory results.'
    };
  }

  const anthropic = new Anthropic({ apiKey });

  const makeApiCall = async (extraInstruction = '') => {
    const userContent = extraInstruction
      ? `${reportText}\n\nNote: ${extraInstruction}`
      : reportText;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
    });

    const contentBlock = response.content?.[0];
    if (!contentBlock || contentBlock.type !== 'text') {
      throw new Error('Invalid response structure from Anthropic API');
    }

    return contentBlock.text;
  };

  let rawResponse = '';
  try {
    rawResponse = await makeApiCall();
    const cleaned = cleanJsonResponse(rawResponse);
    const parsed = JSON.parse(cleaned);

    if (!parsed.parameters || !Array.isArray(parsed.parameters)) {
      throw new Error('Response JSON missing parameters array');
    }

    return parsed;
  } catch (firstErr) {
    if (firstErr.status || firstErr.message?.includes('API') || firstErr.message?.includes('401') || firstErr.message?.includes('key') || firstErr.message?.includes('fetch')) {
      console.error('[aiService] Claude API call failed:', firstErr.message);
      const apiErr = new Error('Analysis is temporarily unavailable, please try again');
      apiErr.statusCode = 502;
      throw apiErr;
    }

    console.warn('[aiService] JSON parse failed, retrying with strict JSON instruction...');
    try {
      rawResponse = await makeApiCall('CRITICAL: Output ONLY valid JSON matching the exact schema. Do not include markdown code block syntax or extra text.');
      const cleaned = cleanJsonResponse(rawResponse);
      const parsed = JSON.parse(cleaned);
      if (!parsed.parameters || !Array.isArray(parsed.parameters)) {
        throw new Error('Response JSON missing parameters array on retry');
      }
      return parsed;
    } catch (secondErr) {
      console.error('[aiService] Failed to parse AI output after retry:', secondErr.message);
      const err = new Error('Analysis is temporarily unavailable, please try again');
      err.statusCode = 502;
      throw err;
    }
  }
}

module.exports = {
  analyzeReportText,
};
