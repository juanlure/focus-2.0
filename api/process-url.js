import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `Eres un asistente especializado en curación cognitiva. Tu tarea es analizar contenido y extraer información accionable.

Para cada contenido que recibas, debes generar una "Cápsula de Acción" con la siguiente estructura JSON:

{
  "title": "Título conciso y descriptivo del contenido (max 100 caracteres)",
  "summary": "Resumen ejecutivo de 2-3 oraciones que capture la esencia del contenido",
  "actions": ["Acción 1 específica y ejecutable", "Acción 2", "Acción 3"],
  "priority": "high|medium|low",
  "sentiment": "positive|neutral|negative|urgent",
  "tags": ["tag1", "tag2", "tag3"],
  "readTime": <número estimado de segundos para leer el resumen>
}

Criterios para prioridad:
- high: Requiere acción inmediata, deadline cercano, impacto alto
- medium: Importante pero no urgente
- low: Informativo, para referencia futura

Criterios para sentiment:
- positive: Oportunidades, buenas noticias, logros
- neutral: Información objetiva, datos
- negative: Problemas, riesgos, alertas
- urgent: Requiere atención inmediata

IMPORTANTE: Responde SOLO con el JSON válido, sin texto adicional ni markdown.`;

function generateId() {
  return `cap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

async function fetchUrlContent(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; FocusBrief/1.0)'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const html = await response.text();

  // Basic HTML to text conversion
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Limit content length
  if (text.length > 10000) {
    text = text.substring(0, 10000) + '...';
  }

  return text;
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;

    if (!url || !url.trim()) {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, error: 'API key not configured' });
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

    if (!content || content.length < 50) {
      return res.status(400).json({
        success: false,
        error: 'Could not extract enough content from URL'
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `${SYSTEM_PROMPT}

Contenido a analizar (tipo: ${sourceType}, fuente: ${url}):

${content}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up response
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let capsuleData;
    try {
      capsuleData = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text);
      return res.status(500).json({ success: false, error: 'Invalid response from AI' });
    }

    const capsule = {
      id: generateId(),
      ...capsuleData,
      source: url,
      sourceType,
      createdAt: new Date().toISOString()
    };

    res.status(200).json({ success: true, capsule });
  } catch (error) {
    console.error('Process URL error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
