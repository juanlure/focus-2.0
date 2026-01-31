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

const SYSTEM_INSTRUCTION = `Eres un asistente experto en curación cognitiva y productividad personal. Tu tarea es analizar contenido (texto, emails, mensajes, notas) y transformarlo en información accionable.

Genera una "Cápsula de Acción" en formato JSON con esta estructura exacta:

{
  "title": "Título descriptivo que capture la esencia (max 80 caracteres)",
  "summary": "Resumen ejecutivo de 2-4 oraciones: qué es, por qué importa, contexto clave",
  "actions": [
    "Acción 1: verbo + objeto + contexto específico",
    "Acción 2: verbo + objeto + contexto específico",
    "Acción 3: verbo + objeto + contexto específico"
  ],
  "priority": "high|medium|low",
  "sentiment": "positive|neutral|negative|urgent",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "readTime": 30,
  "keyInsights": ["Insight clave 1", "Insight clave 2"],
  "deadline": "YYYY-MM-DD o null"
}

CRITERIOS DE PRIORIDAD:
- HIGH: Acción requerida en 24-48h, impacto significativo
- MEDIUM: Importante pero flexible en timing
- LOW: Informativo, referencia futura

CRITERIOS DE SENTIMIENTO:
- URGENT: Deadline explícito, palabras como "urgente", "inmediato"
- POSITIVE: Oportunidades, logros, buenas noticias
- NEGATIVE: Problemas, riesgos, alertas
- NEUTRAL: Información objetiva, datos

ACCIONES EFECTIVAS:
- Empiezan con verbo: Revisar, Responder, Programar, Investigar, Contactar
- Son específicas: "Responder a Juan sobre la propuesta" no "Responder email"
- Incluyen contexto: nombres, fechas, lugares cuando están disponibles

IMPORTANTE: Responde SOLO con JSON válido.`;

function generateId() {
  return `cap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
    const { content, sourceType = 'text', source = 'Manual' } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, error: 'API key not configured' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Use Gemini 3 Flash with system instruction and structured output
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

    const prompt = `Analiza el siguiente contenido y genera una Cápsula de Acción.

Tipo de contenido: ${sourceType}
Fuente: ${source}
Fecha: ${new Date().toLocaleDateString('es-ES')}

CONTENIDO:
${content}

Genera la Cápsula de Acción en JSON:`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
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
      source,
      sourceType,
      createdAt: new Date().toISOString(),
      processedWith: 'gemini-3-flash-preview'
    };

    res.status(200).json({ success: true, capsule });
  } catch (error) {
    console.error('Process error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
