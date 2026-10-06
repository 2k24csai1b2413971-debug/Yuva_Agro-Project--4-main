/**
 * Disease Controller for Yuva Agro
 * Handles crop disease detection requests using Google Gemini multimodal vision.
 */

// Supported image MIME types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Calls Gemini Vision API using @google/genai or native fetch fallback.
 */
async function analyzeImageWithGemini(fileBuffer, mimeType, apiKey) {
  const base64Data = fileBuffer.toString('base64');

  const promptText = `You are an expert agricultural plant pathologist and agronomist specialized in Indian crops.
Analyze the provided crop or plant image.
1. Check if the image contains a plant, leaf, crop, or botanical specimen.
2. If it is NOT a plant, set label to "Not a Plant / Unrecognized", confidence to 0, and advise the user to upload a clear crop leaf photo.
3. If the plant is healthy, set label to "Healthy Plant", high confidence (80-99), description noting good plant health, and nextStep advising standard care.
4. If a disease, pest, fungus, or nutrient deficiency is present, identify the specific disease name for label, set confidence (50-99), write a concise 1-2 sentence description of observed symptoms, and provide actionable nextStep treatment steps suitable for farmers.

Respond STRICTLY in JSON conforming to:
{
  "label": string,
  "confidence": number,
  "description": string,
  "nextStep": string
}`;

  // Try using @google/genai SDK
  try {
    const { GoogleGenAI, Type } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data,
          },
        },
        { text: promptText },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            description: { type: Type.STRING },
            nextStep: { type: Type.STRING },
          },
          required: ['label', 'confidence', 'description', 'nextStep'],
        },
      },
    });

    const rawText = response.text || (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text);
    return parseGeminiResponse(rawText);
  } catch (sdkError) {
    // If SDK encounters an error or fallback is needed, call REST endpoint
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
    const restPayload = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              },
            },
            {
              text: promptText,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    };

    const apiRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(restPayload),
    });

    if (!apiRes.ok) {
      const errBody = await apiRes.text();
      throw new Error(`Gemini API error (${apiRes.status}): ${errBody}`);
    }

    const json = await apiRes.json();
    const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error('Gemini API returned an empty response.');
    }
    return parseGeminiResponse(rawText);
  }
}

/**
 * Helper to safely extract and sanitize the structured prediction JSON.
 */
function parseGeminiResponse(rawText) {
  if (!rawText) {
    throw new Error('Empty text from AI model.');
  }

  // Remove potential markdown code blocks
  const cleaned = rawText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleaned);

  const confidenceNum = typeof parsed.confidence === 'number'
    ? Math.min(100, Math.max(0, Math.round(parsed.confidence)))
    : parseInt(parsed.confidence, 10) || 0;

  return {
    label: String(parsed.label || 'Unidentified Issue'),
    confidence: confidenceNum,
    description: String(parsed.description || 'Diagnosis completed without detailed notes.'),
    nextStep: String(parsed.nextStep || 'Consult a local agricultural extension officer before treatment.'),
  };
}

/**
 * Controller: POST /api/disease/detect
 */
async function detectDisease(req, res) {
  try {
    // 1. Validate file presence
    if (!req.file) {
      return res.status(400).json({
        error: 'No image file uploaded. Please upload a crop photo.',
      });
    }

    // 2. Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
      return res.status(400).json({
        error: `Unsupported image format (${req.file.mimetype}). Allowed types: JPEG, PNG, WebP.`,
      });
    }

    // 3. Check for API key in environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      return res.status(500).json({
        error: 'AI service configuration error: GEMINI_API_KEY is not set in backend/.env.',
      });
    }

    // 4. Call AI Vision Model
    const result = await analyzeImageWithGemini(req.file.buffer, req.file.mimetype, apiKey);

    // 5. Return JSON according to contract
    return res.status(200).json(result);
  } catch (error) {
    console.error('Disease detection error:', error);
    return res.status(500).json({
      error: 'Crop disease analysis failed. ' + (error.message || 'Please try again.'),
    });
  }
}

module.exports = {
  detectDisease,
  ALLOWED_MIME_TYPES,
};
