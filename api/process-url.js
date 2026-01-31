import { GoogleGenerativeAI } from '@google/generative-ai';
import { verifyToken } from './verify.js';

const SYSTEM_PROMPT = `Eres un asistente experto en curación cognitiva y productividad personal. Tu tarea es analizar cualquier tipo de contenido (artículos, emails, mensajes, videos, documentos) y transformarlo en información accionable.

INSTRUCCIONES:
1. Lee y comprende profundamente el contenido
2. Identifica los puntos clave y el propósito principal
3. Detecta cualquier acción implícita o explícita requerida
4. Evalúa la urgencia y el sentimiento del contenido
5. Genera acciones específicas, medibles y ejecutables

Para cada contenido, genera una "Cápsula de Acción" con esta estructura JSON exacta:

{
  "title": "Título conciso que capture la esencia (max 80 caracteres)",
  "summary": "Resumen ejecutivo de 2-4 oraciones que explique: qué es, por qué importa, y el contexto clave",
  "actions": [
    "Acción 1: verbo + objeto + contexto específico",
    "Acción 2: verbo + objeto + contexto específico",
    "Acción 3: verbo + objeto + contexto específico"
  ],
  "priority": "high|medium|low",
  "sentiment": "positive|neutral|negative|urgent",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "readTime": <segundos estimados para procesar la cápsula>,
  "keyInsights": ["Insight 1", "Insight 2"],
  "deadline": "YYYY-MM-DD o null si no aplica"
}

CRITERIOS DE PRIORIDAD:
- HIGH: Acción requerida en 24-48h, impacto significativo, consecuencias de no actuar
- MEDIUM: Importante pero flexible en timing, mejora o oportunidad
- LOW: Informativo, referencia futura, nice-to-have

CRITERIOS DE SENTIMIENTO:
- URGENT: Deadline explícito, palabras como "urgente", "inmediato", "crítico"
- POSITIVE: Oportunidades, logros, buenas noticias, avances
- NEGATIVE: Problemas, riesgos, alertas, quejas
- NEUTRAL: Información objetiva, datos, actualizaciones rutinarias

ACCIONES EFECTIVAS:
- Empiezan con verbo de acción: Revisar, Responder, Programar, Investigar, Contactar, Implementar
- Son específicas: "Responder a Juan sobre propuesta de diseño" no "Responder email"
- Tienen contexto: incluyen nombres, fechas, lugares cuando están disponibles
- Son ejecutables: algo que puedes hacer en una sesión de trabajo

IMPORTANTE:
- Responde SOLO con JSON válido, sin markdown ni texto adicional
- Genera entre 3-5 acciones relevantes
- Los tags deben ser útiles para filtrar y buscar`;

function generateId() {
  return `cap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

async function fetchUrlContent(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; FocusBrief/1.0; Gemini 3 Flash powered)'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const html = await response.text();

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // Extract meta description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  const description = descMatch ? descMatch[1].trim() : '';

  // Basic HTML to text conversion
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Limit content length for optimal processing
  if (text.length > 15000) {
    text = text.substring(0, 15000) + '...';
  }

  return { text, title, description };
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Verify authentication
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!verifyToken(token)) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
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
    } else if (url.includes('linkedin.com')) {
      sourceType = 'linkedin';
    } else if (url.includes('github.com')) {
      sourceType = 'github';
    } else if (url.endsWith('.pdf')) {
      sourceType = 'pdf';
    }

    // Fetch content from URL
    const { text: content, title: pageTitle, description: pageDesc } = await fetchUrlContent(url);

    if (!content || content.length < 100) {
      return res.status(400).json({
        success: false,
        error: 'Could not extract enough content from URL'
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Use Gemini 3 Flash with advanced configuration
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview',
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 4096,
      }
    });

    const prompt = `${SYSTEM_PROMPT}

=== CONTENIDO WEB A ANALIZAR ===
URL: ${url}
Tipo: ${sourceType}
Título de página: ${pageTitle || 'No disponible'}
Meta descripción: ${pageDesc || 'No disponible'}
Fecha de análisis: ${new Date().toISOString()}

CONTENIDO EXTRAÍDO:
${content}

=== FIN DEL CONTENIDO ===

Genera la Cápsula de Acción en JSON:`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const response = await result.response;
    let text = response.text();

    // Clean up response
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let capsuleData;
    try {
      capsuleData = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text);
      return res.status(500).json({ success: false, error: 'Invalid response from AI', rawResponse: text });
    }

    const capsule = {
      id: generateId(),
      title: capsuleData.title || pageTitle,
      summary: capsuleData.summary,
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
