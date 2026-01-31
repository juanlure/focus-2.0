import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';

// Token verification (inline to avoid import issues in Vercel)
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

const SYSTEM_INSTRUCTION = `Eres un asistente experto en curación cognitiva. Tu tarea es analizar contenido multimedia (videos, artículos, páginas web) y transformarlo en información accionable.

IMPORTANTE: Analiza el contenido REAL que se te proporciona. Para videos de YouTube, analiza el contenido visual y de audio del video. NO inventes información.

Genera una "Cápsula de Acción" en JSON con esta estructura exacta:

{
  "title": "Título descriptivo del contenido (max 80 caracteres)",
  "summary": "Resumen de 2-4 oraciones sobre el contenido real del video/artículo",
  "actions": ["Acción específica 1", "Acción específica 2", "Acción específica 3"],
  "priority": "high|medium|low",
  "sentiment": "positive|neutral|negative|urgent",
  "tags": ["tag1", "tag2", "tag3"],
  "readTime": 30,
  "keyInsights": ["Insight clave 1", "Insight clave 2"],
  "deadline": null
}

REGLAS:
- HIGH priority: Requiere acción inmediata
- MEDIUM priority: Importante pero no urgente
- LOW priority: Informativo, referencia futura
- Las acciones deben ser específicas y ejecutables
- Responde SOLO con JSON válido, sin markdown`;

function generateId() {
  return `cap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function extractYouTubeVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function fetchWebContent(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
  });

  if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

  const html = await response.text();

  // Basic fallback if readability is not available or fails
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    title: titleMatch ? titleMatch[1].trim() : '',
    text: text.substring(0, 15000)
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!verifyToken(token)) return res.status(401).json({ success: false, error: 'Unauthorized' });

  try {
    const { url } = req.body;
    if (!url?.trim()) return res.status(400).json({ success: false, error: 'URL is required' });
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ success: false, error: 'API key not configured' });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    const isTwitter = url.includes('twitter.com') || url.includes('x.com');
    const videoId = isYouTube ? extractYouTubeVideoId(url) : null;

    let sourceType = 'article';
    let contentParts = [];

    if (isYouTube && videoId) {
      sourceType = 'youtube';

      // Use Gemini's native YouTube video processing
      // Gemini 3 Flash can process YouTube URLs directly
      contentParts = [
        {
          fileData: {
            mimeType: 'video/mp4',
            fileUri: `https://www.youtube.com/watch?v=${videoId}`
          }
        },
        {
          text: `Analiza este video de YouTube y genera una Cápsula de Acción.

URL del video: ${url}

INSTRUCCIONES:
1. Mira y escucha el contenido COMPLETO del video
2. Identifica los temas principales discutidos
3. Extrae las ideas y conceptos clave
4. Genera acciones concretas basadas en el contenido
5. NO inventes información - basa todo en el contenido real del video

Responde SOLO con el JSON de la Cápsula de Acción.`
        }
      ];
    } else if (isTwitter) {
      sourceType = 'twitter';
      const tweetId = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/)?.[1];

      let tweetContent = `URL: ${url}`;
      if (tweetId) {
        try {
          const response = await fetch(`https://api.fxtwitter.com/status/${tweetId}`, {
            headers: { 'User-Agent': 'FocusBrief/1.0' }
          });
          if (response.ok) {
            const data = await response.json();
            const tweet = data.tweet;
            tweetContent = `TIPO: TWEET DE X/TWITTER\nAUTOR: ${tweet.author.name} (@${tweet.author.screen_name})\nCONTENIDO:\n\n${tweet.text}\n\nMETADATOS: ${tweet.likes} Likes, ${tweet.retweets} Retweets`;
          }
        } catch (e) {
          console.warn('Fxtwitter fallback failed');
        }
      }

      contentParts = [{
        text: `Analiza este Tweet y genera una Cápsula de Acción.
        
IMPORTANTE: Si el Tweet contiene imágenes o videos, fxtwitter nos proporciona el texto y metadatos.

${tweetContent}

Responde SOLO con el JSON de la Cápsula de Acción.`
      }];
    } else {
      // For regular web pages
      const webContent = await fetchWebContent(url);

      if (url.includes('twitter.com') || url.includes('x.com')) sourceType = 'twitter';
      else if (url.includes('linkedin.com')) sourceType = 'linkedin';
      else if (url.includes('github.com')) sourceType = 'github';

      contentParts = [{
        text: `Analiza este contenido web y genera una Cápsula de Acción.

URL: ${url}
Título: ${webContent.title}
Descripción: ${webContent.description}

Contenido:
${webContent.text}

Responde SOLO con el JSON de la Cápsula de Acción.`
      }];
    }

    // Use Gemini 3 Flash with system instruction
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview',
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json'
      }
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: contentParts }]
    });

    const response = await result.response;
    let text = response.text();

    // Clean up response
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
      title: capsuleData.title || 'Sin título',
      summary: capsuleData.summary || '',
      actions: capsuleData.actions || [],
      priority: capsuleData.priority || 'medium',
      sentiment: capsuleData.sentiment || 'neutral',
      tags: capsuleData.tags || [],
      readTime: capsuleData.readTime || 30,
      keyInsights: capsuleData.keyInsights || [],
      deadline: capsuleData.deadline || null,
      source: url,
      sourceType,
      createdAt: new Date().toISOString(),
      processedWith: 'gemini-3-flash-preview'
    };

    res.status(200).json({ success: true, capsule });
  } catch (error) {
    console.error('Process URL error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
