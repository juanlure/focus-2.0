import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import multer from 'multer';

// Internal modules
import { geminiLimiter, uploadLimiter, generalLimiter } from './middleware/rateLimiter.js';
import { logger, logApiCall, logGeminiCall } from './lib/logger.js';
import { initSentry, captureError, sentryErrorHandler } from './lib/sentry.js';
import { fetchTweet, getTweetId, formatTweetContent } from './lib/fetchers/twitter.js';
import { fetchYouTubeTranscript, getYoutubeId, formatYouTubeContent } from './lib/fetchers/youtube.js';

dotenv.config();

// Initialize Sentry for error tracking
initSentry();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Multer config for temp uploads
const upload = multer({ dest: 'uploads/' });
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY || '');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(generalLimiter); // General rate limiting for all routes

// Data storage
const DATA_DIR = path.join(__dirname, 'data');
const CAPSULES_FILE = path.join(DATA_DIR, 'capsules.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize capsules file if it doesn't exist
if (!fs.existsSync(CAPSULES_FILE)) {
  fs.writeFileSync(CAPSULES_FILE, JSON.stringify({ capsules: [] }, null, 2));
}

// Helper functions
function loadCapsules() {
  try {
    const data = fs.readFileSync(CAPSULES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { capsules: [] };
  }
}

function saveCapsules(data) {
  fs.writeFileSync(CAPSULES_FILE, JSON.stringify(data, null, 2));
}

function generateId() {
  return `cap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Initialize Gemini AI
let genAI = null;
let model = null;

function initializeGemini() {
  if (!process.env.GEMINI_API_KEY) {
    logger.warn('GEMINI_API_KEY not set. AI features will not work.');
    return false;
  }

  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
    logger.info('Gemini 3 Flash initialized successfully');
    return true;
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to initialize Gemini');
    captureError(error, { operation: 'initializeGemini' });
    return false;
  }
}

// System prompt for processing content
const SYSTEM_PROMPT = `Eres un Curador Cognitivo de Élite. Tu misión es transformar la sobrecarga de información en "Cápsulas de Acción" ultra-eficientes.

Tu objetivo principal es el VALOR POR TIEMPO. No resumas por resumir; identifica insights que cambien la forma de trabajar o pensar del usuario.

REGLAS PARA DIFERENTES CONTENIDOS:
- Si es un VIDEO o YOUTUBE: Gemini lo está "viendo". Enfócate en conceptos clave, marcas de tiempo teóricas si son evidentes, y conclusiones prácticas. Ignora la paja introductoria.
- Si es un ARTÍCULO: Extrae los argumentos centrales y las estadísticas más impactantes.
- Si es un DOCUMENTO/PDF: Identifica las acciones obligatorias o cambios de política.

ESTRUCTURA DE RESPUESTA (JSON):
{
  "title": "Título con 'punch' y contexto (ej: 'Estrategias IA 2026: El Giro hacia Agentes')",
  "summary": "2-3 frases potentes. No empieces con 'Este artículo trata...'. Ve al grano.",
  "actions": ["Acción concreta (ej: 'Implementar RAG en el módulo de chat')", "Acción 2", "Acción 3"],
  "priority": "high|medium|low",
  "sentiment": "positive|neutral|negative|urgent",
  "tags": ["temática1", "temática2"],
  "readTime": <segundos para leer esta cápsula>,
  "keyInsights": ["Insight profundo 1", "Insight profundo 2"],
  "clipboardReady": ["Prompt, dirección o comando técnico para copiar/pegar"]
}

REGLAS ESPECÍFICAS:
- clipboardReady: DEBES extraer cualquier prompt, dirección física, comando técnico o código que el usuario pueda querer usar directamente. Es para copiar y pegar en otro sitio. Si no hay nada, devuelve [].

IMPORTANTE: Responde ÚNICAMENTE con el objeto JSON. Sin backticks, sin markdown labels, sin texto antes o después.
CLÁUSULA ANTIFANTASÍA: Basa tu respuesta EXCLUSIVAMENTE en el contenido enviado. Si el contenido es insuficiente o falta información clave, regístralo así. PROHIBIDO ALUCINAR O INVENTAR CONTEXTO NO EXPLÍCITO.`;

// Process content with Gemini
async function processWithGemini(content, sourceType, source) {
  if (!model) {
    throw new Error('Gemini AI not initialized. Please set GEMINI_API_KEY.');
  }

  const startTime = Date.now();
  const prompt = `${SYSTEM_PROMPT}

Contenido a analizar (tipo: ${sourceType}, fuente: ${source}):

${content}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const duration = Date.now() - startTime;
    logGeminiCall('generateContent', duration, true);

    try {
      return JSON.parse(text);
    } catch (parseError) {
      logger.error({ rawText: text.substring(0, 500) }, 'Failed to parse Gemini response');
      throw new Error('La IA devolvió un formato inválido. Por favor, inténtalo de nuevo.');
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    logGeminiCall('generateContent', duration, false, error);
    captureError(error, { sourceType, source: source.substring(0, 100) });
    throw error;
  }
}

// Fetch URL content with specialized handles for YouTube and Twitter
async function fetchUrlContent(url) {
  // Case YouTube
  const youtubeId = getYoutubeId(url);
  if (youtubeId) {
    logger.info({ youtubeId }, 'Detecting YouTube video');
    const data = await fetchYouTubeTranscript(youtubeId);
    const content = formatYouTubeContent(data, youtubeId);

    if (content) {
      return content;
    }

    // No transcript available - return null to trigger multimodal processing
    logger.info({ youtubeId }, 'No transcript, will use multimodal');
    return null;
  }

  // Case Twitter/X
  const tweetId = getTweetId(url);
  if (tweetId) {
    logger.info({ tweetId }, 'Detecting X/Twitter tweet');
    const tweet = await fetchTweet(tweetId);
    return formatTweetContent(tweet);
  }

  // Generic URL (articles, web pages)
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      throw new Error(`Error al acceder a la URL: HTTP ${response.status}`);
    }

    const html = await response.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article || (!article.textContent && !article.content)) {
      // Fallback a limpieza básica si Readability falla
      return html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    return `Título: ${article.title}\n\nContenido:\n${article.textContent.trim()}`;
  } catch (error) {
    captureError(error, { url: url.substring(0, 100), operation: 'fetchUrlContent' });
    throw new Error(`Error de extracción: ${error.message}`);
  }
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    model: model ? 'gemini-3-flash-preview' : 'not initialized',
    timestamp: new Date().toISOString()
  });
});

// Process text content
app.post('/api/process', geminiLimiter, async (req, res) => {
  const startTime = Date.now();
  try {
    const { content, sourceType = 'text', source = 'Manual' } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'El contenido es requerido.' });
    }

    if (content.length > 100000) {
      return res.status(400).json({ success: false, error: 'El contenido es demasiado largo. Máximo 100,000 caracteres.' });
    }

    const capsuleData = await processWithGemini(content, sourceType, source);

    const capsule = {
      id: generateId(),
      ...capsuleData,
      source,
      sourceType,
      createdAt: new Date().toISOString()
    };

    // Save capsule
    const data = loadCapsules();
    data.capsules.unshift(capsule);
    saveCapsules(data);

    logApiCall('/api/process', 'POST', Date.now() - startTime, true);
    res.json({ success: true, capsule });
  } catch (error) {
    logApiCall('/api/process', 'POST', Date.now() - startTime, false, error);
    captureError(error, { endpoint: '/api/process' });
    res.status(500).json({
      success: false,
      error: error.message || 'Error al procesar el contenido. Por favor, inténtalo de nuevo.'
    });
  }
});

// Process URL
app.post('/api/process-url', geminiLimiter, async (req, res) => {
  const startTime = Date.now();
  try {
    const { url } = req.body;

    if (!url || !url.trim()) {
      return res.status(400).json({ success: false, error: 'La URL es requerida.' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ success: false, error: 'URL inválida. Por favor, verifica el formato.' });
    }

    // Determine source type
    let sourceType = 'article';
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      sourceType = 'youtube';
    } else if (url.includes('twitter.com') || url.includes('x.com')) {
      sourceType = 'twitter';
    }

    // Fetch content from URL
    const content = await fetchUrlContent(url);

    // Handle YouTube multimodal (when no transcript available)
    if (content === null && sourceType === 'youtube') {
      // TODO: Implement multimodal video processing with Gemini
      return res.status(400).json({
        success: false,
        error: 'No se pudo obtener la transcripción del video. El procesamiento multimodal de videos estará disponible próximamente.'
      });
    }

    if (!content || content.length < 50) {
      return res.status(400).json({
        success: false,
        error: 'No se pudo extraer suficiente contenido de la URL. Verifica que la página sea accesible.'
      });
    }

    const capsuleData = await processWithGemini(content, sourceType, url);

    const capsule = {
      id: generateId(),
      ...capsuleData,
      source: url,
      sourceType,
      createdAt: new Date().toISOString()
    };

    // Save capsule
    const data = loadCapsules();
    data.capsules.unshift(capsule);
    saveCapsules(data);

    logApiCall('/api/process-url', 'POST', Date.now() - startTime, true);
    res.json({ success: true, capsule });
  } catch (error) {
    logApiCall('/api/process-url', 'POST', Date.now() - startTime, false, error);
    captureError(error, { endpoint: '/api/process-url' });
    res.status(500).json({
      success: false,
      error: error.message || 'Error al procesar la URL. Por favor, inténtalo de nuevo.'
    });
  }
});

// Process File (Multimodal via Google File API)
app.post('/api/process-file', uploadLimiter, upload.single('file'), async (req, res) => {
  const startTime = Date.now();
  let tempPath = null;
  try {
    const { sourceType, source } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No se ha subido ningún archivo.' });
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      return res.status(400).json({ success: false, error: 'El archivo es demasiado grande. Máximo 50MB.' });
    }

    tempPath = file.path;

    if (!model) {
      throw new Error('Gemini AI no inicializado. Contacta al administrador.');
    }

    logger.info({ filename: file.originalname, mimetype: file.mimetype, size: file.size }, 'Uploading file to Google AI');

    // Upload to Google File API
    const uploadResult = await fileManager.uploadFile(tempPath, {
      mimeType: file.mimetype,
      displayName: file.originalname,
    });

    logger.info({ uri: uploadResult.file.uri }, 'File uploaded to Google AI');

    const prompt = `${SYSTEM_PROMPT}

Analiza este archivo (${file.originalname}). Extrae los insights más relevantes y genera la Cápsula de Acción.`;

    const geminiStart = Date.now();
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResult.file.mimeType,
          fileUri: uploadResult.file.uri
        }
      },
      { text: prompt },
    ]);
    logGeminiCall('generateContent-multimodal', Date.now() - geminiStart, true);

    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let capsuleData;
    try {
      capsuleData = JSON.parse(text);
    } catch (parseError) {
      logger.error({ rawText: text.substring(0, 500) }, 'Failed to parse Gemini response for file');
      throw new Error('La IA devolvió un formato inválido. Por favor, inténtalo de nuevo.');
    }

    const capsule = {
      id: generateId(),
      ...capsuleData,
      source: source || file.originalname,
      sourceType: file.mimetype.split('/')[0],
      createdAt: new Date().toISOString()
    };

    // Save capsule
    const data = loadCapsules();
    data.capsules.unshift(capsule);
    saveCapsules(data);

    logApiCall('/api/process-file', 'POST', Date.now() - startTime, true);
    res.json({ success: true, capsule });
  } catch (error) {
    logApiCall('/api/process-file', 'POST', Date.now() - startTime, false, error);
    captureError(error, { endpoint: '/api/process-file' });
    res.status(500).json({
      success: false,
      error: error.message || 'Error al procesar el archivo. Por favor, inténtalo de nuevo.'
    });
  } finally {
    // Clean up temp file
    if (tempPath && fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
      } catch (err) {
        logger.error({ error: err.message, path: tempPath }, 'Error cleaning up temp file');
      }
    }
  }
});

// Get all capsules
app.get('/api/capsules', (req, res) => {
  const data = loadCapsules();
  res.json(data);
});

// Get single capsule
app.get('/api/capsules/:id', (req, res) => {
  const { id } = req.params;
  const data = loadCapsules();
  const capsule = data.capsules.find(c => c.id === id);

  if (!capsule) {
    return res.status(404).json({ error: 'Capsule not found' });
  }

  res.json({ capsule });
});

// Delete capsule
app.delete('/api/capsules/:id', (req, res) => {
  const { id } = req.params;
  const data = loadCapsules();
  const index = data.capsules.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Capsule not found' });
  }

  data.capsules.splice(index, 1);
  saveCapsules(data);

  res.json({ success: true });
});

// Add error handler at the end
app.use(sentryErrorHandler());

// Global error handler
app.use((err, req, res, next) => {
  logger.error({ error: err.message, stack: err.stack }, 'Unhandled error');
  captureError(err, { path: req.path, method: req.method });
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor. Por favor, inténtalo de nuevo.'
  });
});

// Start server
app.listen(PORT, () => {
  logger.info({ port: PORT }, 'FocusBrief API started');
  console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🧠 FocusBrief API                               ║
║   Server running on http://localhost:${PORT}        ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
  `);

  initializeGemini();
});
