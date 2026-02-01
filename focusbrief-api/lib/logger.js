import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  transport: isProduction ? undefined : {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  },
  base: {
    env: process.env.NODE_ENV || 'development'
  }
});

// Structured logging helpers
export const logApiCall = (endpoint, method, duration, success, error = null) => {
  const logData = {
    type: 'api_call',
    endpoint,
    method,
    duration_ms: duration,
    success
  };

  if (error) {
    logData.error = error.message || String(error);
    logger.error(logData, `API call failed: ${endpoint}`);
  } else {
    logger.info(logData, `API call: ${endpoint}`);
  }
};

export const logGeminiCall = (operation, duration, success, error = null) => {
  const logData = {
    type: 'gemini_api',
    operation,
    duration_ms: duration,
    success
  };

  if (error) {
    logData.error = error.message || String(error);
    logger.error(logData, `Gemini API error: ${operation}`);
  } else {
    logger.info(logData, `Gemini API call: ${operation}`);
  }
};

export const logExternalFetch = (service, url, success, error = null) => {
  const logData = {
    type: 'external_fetch',
    service,
    url: url.substring(0, 100), // Truncate long URLs
    success
  };

  if (error) {
    logData.error = error.message || String(error);
    logger.warn(logData, `External fetch failed: ${service}`);
  } else {
    logger.debug(logData, `External fetch: ${service}`);
  }
};

export default logger;
