import { logger, logExternalFetch } from '../logger.js';

// Primary: fxtwitter API
async function fetchFromFxTwitter(tweetId) {
  const url = `https://api.fxtwitter.com/status/${tweetId}`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'FocusBrief/1.0' },
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    throw new Error(`fxtwitter HTTP ${response.status}`);
  }

  const data = await response.json();

  if (data.code !== 200 || !data.tweet) {
    throw new Error(`Tweet not found (code: ${data.code})`);
  }

  return {
    author: data.tweet.author?.name || 'Desconocido',
    handle: data.tweet.author?.screen_name || 'unknown',
    text: data.tweet.text || data.tweet.raw_text?.text || '',
    likes: data.tweet.likes || 0,
    retweets: data.tweet.retweets || 0
  };
}

// Fallback 1: vxtwitter API
async function fetchFromVxTwitter(tweetId) {
  const url = `https://api.vxtwitter.com/status/${tweetId}`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'FocusBrief/1.0' },
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    throw new Error(`vxtwitter HTTP ${response.status}`);
  }

  const data = await response.json();

  if (!data.text) {
    throw new Error('Tweet content not found');
  }

  return {
    author: data.user_name || 'Desconocido',
    handle: data.user_screen_name || 'unknown',
    text: data.text || '',
    likes: data.likes || 0,
    retweets: data.retweets || 0
  };
}

// Fallback 2: syndication API (Twitter's official embed API)
async function fetchFromSyndication(tweetId) {
  const url = `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'
    },
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    throw new Error(`syndication HTTP ${response.status}`);
  }

  const data = await response.json();

  if (!data.text) {
    throw new Error('Tweet content not found in syndication');
  }

  return {
    author: data.user?.name || 'Desconocido',
    handle: data.user?.screen_name || 'unknown',
    text: data.text || '',
    likes: data.favorite_count || 0,
    retweets: data.retweet_count || 0
  };
}

// Main function with fallback chain
export async function fetchTweet(tweetId) {
  const methods = [
    { name: 'fxtwitter', fn: fetchFromFxTwitter },
    { name: 'vxtwitter', fn: fetchFromVxTwitter },
    { name: 'syndication', fn: fetchFromSyndication }
  ];

  const errors = [];

  for (const method of methods) {
    try {
      logger.debug({ method: method.name, tweetId }, 'Attempting tweet fetch');
      const result = await method.fn(tweetId);
      logExternalFetch('twitter', `${method.name}/${tweetId}`, true);
      return result;
    } catch (error) {
      logExternalFetch('twitter', `${method.name}/${tweetId}`, false, error);
      errors.push({ method: method.name, error: error.message });
    }
  }

  // All methods failed
  const errorSummary = errors.map(e => `${e.method}: ${e.error}`).join('; ');
  throw new Error(`No se pudo obtener el tweet. Intentos fallidos: ${errorSummary}`);
}

export function getTweetId(url) {
  const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
  return match ? match[1] : null;
}

export function formatTweetContent(tweet) {
  return `TIPO: TWEET DE X/TWITTER
AUTOR: ${tweet.author} (@${tweet.handle})
CONTENIDO:

${tweet.text}

METADATOS: ${tweet.likes} Likes, ${tweet.retweets} Retweets`;
}
