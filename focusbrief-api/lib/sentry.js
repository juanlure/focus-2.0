import * as Sentry from '@sentry/node';
import { logger } from './logger.js';

let sentryInitialized = false;

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    logger.warn('SENTRY_DSN not set. Error tracking disabled.');
    return false;
  }

  try {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      beforeSend(event, hint) {
        // Filter out non-critical errors in development
        if (process.env.NODE_ENV !== 'production') {
          const error = hint.originalException;
          if (error?.message?.includes('ECONNREFUSED')) {
            return null; // Don't send connection errors in dev
          }
        }
        return event;
      }
    });

    sentryInitialized = true;
    logger.info('Sentry initialized successfully');
    return true;
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to initialize Sentry');
    return false;
  }
}

export function captureError(error, context = {}) {
  logger.error({
    error: error.message,
    stack: error.stack,
    ...context
  }, 'Captured error');

  if (sentryInitialized) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      Sentry.captureException(error);
    });
  }
}

export function captureMessage(message, level = 'info', context = {}) {
  if (sentryInitialized) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      Sentry.captureMessage(message, level);
    });
  }
}

// Express error handler middleware
export function sentryErrorHandler() {
  if (sentryInitialized) {
    return Sentry.expressErrorHandler();
  }
  return (err, req, res, next) => next(err);
}

// Express request handler middleware
export function sentryRequestHandler() {
  if (sentryInitialized) {
    return Sentry.expressIntegration();
  }
  return (req, res, next) => next();
}

export { Sentry };
