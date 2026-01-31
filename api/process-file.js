import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';

// Token verification
function verifyToken(token) {
  try {
    if (!token) return false;
    const validPassword = process.env.AUTH_PASSWORD;
    if (!validPassword) return false;

    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const lastColonIndex = decoded.lastIndexOf(':');
    if (lastColonIndex === -1) return false;

    const tokenData = decoded.substring(0, lastColonIndex);
    const signature = decoded.substring(lastColonIndex + 1);

    const expectedSignature = crypto
      .createHmac('sha256', validPassword)
      .update(tokenData)
      .digest('hex');

    if (signature !== expectedSignature) return false;

    const { expiry } = JSON.parse(tokenData);
    if (Date.now() > expiry) return false;

    return true;
  } catch (error) {
    return false;
  }
}

const SYSTEM_INSTRUCTION = `Eres un asistente experto en curación cognitiva. Analizas contenido multimedia (imágenes, audio, video, PDFs) y lo transformas en información accionable.

Para IMÁGENES: Describe qué ves, identifica texto (OCR), diagramas, datos visuales.
Para AUDIO: Transcribe y resume el contenido hablado, identifica speakers si es posible.
Para VIDEO: Analiza el contenido visual y de audio, identifica temas clave.
Para PDF: Extrae el contenido principal, tablas, datos importantes.

Genera una "Cápsula de Acción" en JSON:

{
  "title": "Título descriptivo (max 80 caracteres)",
  "summary": "Resumen de 2-4 oraciones del contenido analizado",
  "actions": ["Acción específica 1", "Acción específica 2", "Acción específica 3"],
  "priority": "high|medium|low",
  "sentiment": "positive|neutral|negative|urgent",
  "tags": ["tag1", "tag2", "tag3"],
  "readTime": 30,
  "keyInsights": ["Insight 1", "Insight 2"],
  "deadline": null,
  "extractedText": "Texto extraído relevante (si aplica)",
  "mediaAnalysis": "Descripción del contenido multimedia"
}

IMPORTANTE: Analiza el contenido REAL. NO inventes información. Responde SOLO con JSON válido.`;

function generateId() {
  return `cap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Supported MIME types by Gemini 3 Flash
const SUPPORTED_TYPES = {
  image: ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'],
  audio: ['audio/aac', 'audio/flac', 'audio/mp3', 'audio/m4a', 'audio/mpeg', 'audio/mpga', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/webm'],
  video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/mpeg', 'video/x-flv', 'video/wmv', 'video/3gpp'],
  document: ['application/pdf', 'text/plain']
};

function getMediaType(mimeType) {
  for (const [type, mimes] of Object.entries(SUPPORTED_TYPES)) {
    if (mimes.some(m => mimeType.startsWith(m.split('/')[0]) || mimeType === m)) {
      return type;
    }
  }
  return null;
}

function getPromptForMediaType(mediaType, fileName) {
  const prompts = {
    image: `Analiza esta imagen "${fileName}":
1. Describe qué ves en detalle
2. Extrae cualquier texto visible (OCR)
3. Identifica datos, gráficos o diagramas
4. Genera acciones basadas en el contenido`,

    audio: `Analiza este audio "${fileName}":
1. Transcribe el contenido hablado
2. Identifica los temas principales
3. Resume los puntos clave
4. Genera acciones basadas en lo discutido`,

    video: `Analiza este video "${fileName}":
1. Describe el contenido visual
2. Transcribe/resume el audio
3. Identifica los temas principales
4. Genera acciones basadas en el contenido`,

    document: `Analiza este documento "${fileName}":
1. Extrae el contenido principal
2. Identifica tablas y datos importantes
3. Resume los puntos clave
4. Genera acciones basadas en el contenido`
  };

  return prompts[mediaType] || prompts.document;
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb'
    }
  }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!verifyToken(token)) return res.status(401).json({ success: false, error: 'Unauthorized' });

  try {
    const { fileData, mimeType, fileName, source = 'Upload' } = req.body;

    if (!fileData || !mimeType) {
      return res.status(400).json({ success: false, error: 'File data and mimeType are required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, error: 'API key not configured' });
    }

    const mediaType = getMediaType(mimeType);
    if (!mediaType) {
      return res.status(400).json({
        success: false,
        error: `Unsupported file type: ${mimeType}. Supported: images, audio, video, PDF`
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview',
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 16384,
        responseMimeType: 'application/json'
      }
    });

    const prompt = getPromptForMediaType(mediaType, fileName || 'archivo');

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: fileData // base64 encoded
            }
          },
          { text: prompt + '\n\nResponde con la Cápsula de Acción en JSON:' }
        ]
      }]
    });

    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let capsuleData;
    try {
      capsuleData = JSON.parse(text);
    } catch (parseError) {
      console.error('Parse error:', text);
      return res.status(500).json({ success: false, error: 'Invalid AI response', rawResponse: text });
    }

    const capsule = {
      id: generateId(),
      title: capsuleData.title || fileName || 'Archivo procesado',
      summary: capsuleData.summary || '',
      actions: capsuleData.actions || [],
      priority: capsuleData.priority || 'medium',
      sentiment: capsuleData.sentiment || 'neutral',
      tags: capsuleData.tags || [],
      readTime: capsuleData.readTime || 30,
      keyInsights: capsuleData.keyInsights || [],
      deadline: capsuleData.deadline || null,
      extractedText: capsuleData.extractedText || null,
      mediaAnalysis: capsuleData.mediaAnalysis || null,
      source: source || fileName,
      sourceType: mediaType,
      createdAt: new Date().toISOString(),
      processedWith: 'gemini-3-flash-preview'
    };

    res.status(200).json({ success: true, capsule });
  } catch (error) {
    console.error('Process file error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
