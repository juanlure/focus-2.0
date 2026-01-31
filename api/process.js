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
    const { content, sourceType = 'text', source = 'Manual' } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, error: 'API key not configured' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `${SYSTEM_PROMPT}

Contenido a analizar (tipo: ${sourceType}, fuente: ${source}):

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
      source,
      sourceType,
      createdAt: new Date().toISOString()
    };

    res.status(200).json({ success: true, capsule });
  } catch (error) {
    console.error('Process error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
