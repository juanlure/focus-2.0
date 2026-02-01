import TranscriptClient from 'youtube-transcript-api';
import { logger, logExternalFetch } from '../logger.js';

const youtubeClient = new TranscriptClient();

// Primary: youtube-transcript-api
async function fetchWithTranscriptApi(videoId) {
  await youtubeClient.ready;
  const data = await youtubeClient.getTranscript(videoId);
  const fullText = data.transcript.map(t => t.text).join(' ');

  return {
    title: data.title || 'Video de YouTube',
    transcript: fullText,
    source: 'youtube-transcript-api'
  };
}

// Fallback 1: YouTube's timedtext API (for auto-generated captions)
async function fetchFromTimedText(videoId) {
  // First get the video page to extract caption track URL
  const pageUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const pageResponse = await fetch(pageUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
    },
    signal: AbortSignal.timeout(15000)
  });

  if (!pageResponse.ok) {
    throw new Error(`YouTube page fetch failed: ${pageResponse.status}`);
  }

  const html = await pageResponse.text();

  // Extract video title
  const titleMatch = html.match(/<title>(.+?) - YouTube<\/title>/);
  const title = titleMatch ? titleMatch[1] : 'Video de YouTube';

  // Extract caption track from ytInitialPlayerResponse
  const captionMatch = html.match(/"captionTracks":\s*\[(.*?)\]/);
  if (!captionMatch) {
    throw new Error('No captions available for this video');
  }

  // Parse caption URL (prefer Spanish, fallback to any)
  const captionData = captionMatch[1];
  let captionUrl;

  // Try Spanish first
  const esMatch = captionData.match(/"baseUrl":\s*"([^"]+)"[^}]*"languageCode":\s*"es"/);
  if (esMatch) {
    captionUrl = esMatch[1].replace(/\\u0026/g, '&');
  } else {
    // Fallback to first available
    const anyMatch = captionData.match(/"baseUrl":\s*"([^"]+)"/);
    if (anyMatch) {
      captionUrl = anyMatch[1].replace(/\\u0026/g, '&');
    }
  }

  if (!captionUrl) {
    throw new Error('Could not extract caption URL');
  }

  // Fetch caption XML
  const captionResponse = await fetch(captionUrl, {
    signal: AbortSignal.timeout(10000)
  });

  if (!captionResponse.ok) {
    throw new Error(`Caption fetch failed: ${captionResponse.status}`);
  }

  const captionXml = await captionResponse.text();

  // Parse XML to extract text
  const textMatches = captionXml.matchAll(/<text[^>]*>([^<]*)<\/text>/g);
  const texts = [];
  for (const match of textMatches) {
    const decoded = match[1]
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n/g, ' ');
    texts.push(decoded);
  }

  if (texts.length === 0) {
    throw new Error('No transcript text found');
  }

  return {
    title,
    transcript: texts.join(' '),
    source: 'timedtext-api'
  };
}

// Main function with fallback chain
export async function fetchYouTubeTranscript(videoId) {
  const methods = [
    { name: 'youtube-transcript-api', fn: () => fetchWithTranscriptApi(videoId) },
    { name: 'timedtext-api', fn: () => fetchFromTimedText(videoId) }
  ];

  const errors = [];

  for (const method of methods) {
    try {
      logger.debug({ method: method.name, videoId }, 'Attempting YouTube transcript fetch');
      const result = await method.fn();
      logExternalFetch('youtube', `${method.name}/${videoId}`, true);
      return result;
    } catch (error) {
      logExternalFetch('youtube', `${method.name}/${videoId}`, false, error);
      errors.push({ method: method.name, error: error.message });
    }
  }

  // All methods failed - return null to signal Gemini should analyze video directly
  const errorSummary = errors.map(e => `${e.method}: ${e.error}`).join('; ');
  logger.warn({ videoId, errors }, 'All transcript methods failed');

  return {
    title: null,
    transcript: null,
    error: errorSummary,
    source: 'none'
  };
}

export function getYoutubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function formatYouTubeContent(data, videoId) {
  if (data.transcript) {
    return `TIPO: VIDEO DE YOUTUBE
ID: ${videoId}
TITULO: ${data.title}
CONTENIDO (TRANSCRIPCIÓN):

${data.transcript}`;
  }

  // No transcript available - signal for multimodal processing
  return null;
}
