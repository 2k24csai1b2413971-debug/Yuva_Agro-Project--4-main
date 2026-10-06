/**
 * Chat Controller for Yuva Agro
 * Handles farmer chatbot inquiries with agronomy expertise, multi-turn history,
 * regional language support (English & Hindi), and safety guardrails.
 */

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_TURNS = 10;
const SUPPORTED_LANGUAGES = ['en', 'hi'];

/**
 * Agronomy system instruction for Indian agriculture.
 */
function getSystemInstruction(language) {
  const langDirective = language === 'hi'
    ? 'आप किसान मित्र हैं। किसान के सभी सवालों का जवाब शुद्ध, सरल और व्यावहारिक हिंदी (देवनागरी लिपि) में दें।'
    : 'You are Kisan Mitra. Answer the farmer\'s questions in clear, accessible English.';

  return `You are "Yuva Kisan Mitra", a dedicated agricultural AI assistant built for Indian farmers by Yuva Agro.
${langDirective}

Your expertise includes:
- Agronomy and crop advisory for Kharif, Rabi, and Zaid seasons (Wheat, Paddy/Rice, Mustard, Cotton, Sugarcane, Maize, Pulses, Vegetables).
- Soil health, organic manures, bio-fertilizers, and balanced N-P-K nutrient application.
- Modern irrigation methods (drip, sprinkler, furrow timing).
- Integrated Pest Management (IPM), cultural practices, and biological controls.
- Major Indian farmer welfare schemes (e.g., PM-KISAN, PM Fasal Bima Yojana, Soil Health Card).

Safety and Responsibility Guidelines:
1. Always prioritize sustainable, cultural, and biological control measures before recommending chemical pesticides.
2. For chemical sprays, emphasize following certified manufacturer dosages, using clean water, and wearing protective equipment (mask, gloves).
3. Always include a reminder to consult with local Krishi Vigyan Kendra (KVK) scientists or Block Agricultural Officers for localized confirmation.
4. Keep explanations clear, well-structured (bullet points where helpful), and actionable without unnecessary academic jargon.
5. If a query is completely unrelated to agriculture, farming, rural life, livestock, or weather, politely steer the conversation back to farming.`;
}

/**
 * Invokes Gemini 2.5 Flash with multi-turn history.
 */
async function callGeminiChat(message, language, history, apiKey) {
  const systemInstruction = getSystemInstruction(language);

  // Format multi-turn conversation contents
  const contents = [];

  // Append sanitized history turns
  if (Array.isArray(history)) {
    const recentHistory = history.slice(-MAX_HISTORY_TURNS);
    for (const turn of recentHistory) {
      if (turn && turn.role && turn.content && typeof turn.content === 'string') {
        const role = turn.role === 'model' || turn.role === 'assistant' ? 'model' : 'user';
        contents.push({
          role,
          parts: [{ text: turn.content.substring(0, MAX_MESSAGE_LENGTH) }],
        });
      }
    }
  }

  // Append current user message
  contents.push({
    role: 'user',
    parts: [{ text: message }],
  });

  // Try using @google/genai SDK
  try {
    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.6,
        maxOutputTokens: 1000,
      },
    });

    const reply = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
      throw new Error('Received an empty response from the AI model.');
    }
    return reply.trim();
  } catch (sdkError) {
    // Fallback to direct Gemini REST API
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

    const restPayload = {
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents,
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 1000,
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
    const reply = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
      throw new Error('Received an empty response from the AI model.');
    }
    return reply.trim();
  }
}

/**
 * Controller: POST /api/chat
 */
async function handleChatMessage(req, res) {
  try {
    const { message, language = 'en', history = [] } = req.body;

    // 1. Validate message existence and type
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message is required and cannot be empty.',
      });
    }

    // 2. Validate message size
    const trimmedMessage = message.trim();
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        error: `Message is too long. Maximum allowed length is ${MAX_MESSAGE_LENGTH} characters.`,
      });
    }

    // 3. Validate / normalize language
    const normalizedLanguage = SUPPORTED_LANGUAGES.includes(language.toLowerCase())
      ? language.toLowerCase()
      : 'en';

    // 4. Validate API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      return res.status(500).json({
        error: 'AI service configuration error: GEMINI_API_KEY is not configured in backend/.env.',
      });
    }

    // 5. Call LLM
    const reply = await callGeminiChat(trimmedMessage, normalizedLanguage, history, apiKey);

    // 6. Return response
    return res.status(200).json({
      reply,
      language: normalizedLanguage,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({
      error: 'Failed to generate agricultural advice. ' + (error.message || 'Please try again later.'),
    });
  }
}

module.exports = {
  handleChatMessage,
  SUPPORTED_LANGUAGES,
  MAX_MESSAGE_LENGTH,
  MAX_HISTORY_TURNS,
};
