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

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', validPassword)
      .update(tokenData)
      .digest('hex');

    if (signature !== expectedSignature) return false;

    // Check expiry
    const { expiry } = JSON.parse(tokenData);
    if (Date.now() > expiry) return false;

    return true;
  } catch (error) {
    return false;
  }
}

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
    const { content, sourceType = 'text', source = 'Manual' } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, error: 'API key not configured' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Use Gemini 3 Flash with advanced configuration
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 4096,
      }
    });

    const prompt = `${SYSTEM_PROMPT}

=== CONTENIDO A ANALIZAR ===
Tipo: ${sourceType}
Fuente: ${source}
Fecha de análisis: ${new Date().toISOString()}

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
      title: capsuleData.title,
      summary: capsuleData.summary,
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
      processedWith: 'gemini-2.0-flash'
    };

    res.status(200).json({ success: true, capsule });
  } catch (error) {
    console.error('Process error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
