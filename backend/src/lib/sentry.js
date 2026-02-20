import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export const initSentry = (app) => {
  // Only initialize Sentry in production or if DSN is provided
  if (!process.env.SENTRY_DSN) {
    console.log('⚠️  Sentry DSN not configured - error monitoring disabled');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    integrations: [
      // HTTP and Express tracing (API changed in Sentry v8+)
      ...(Sentry.httpIntegration ? [Sentry.httpIntegration()] : []),
      ...(Sentry.expressIntegration ? [Sentry.expressIntegration({ app })] : []),
      nodeProfilingIntegration(),
    ],

    // Filter out sensitive data
    beforeSend(event, hint) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers.cookie;
        delete event.request.headers.authorization;
      }

      // Remove password fields from request data
      if (event.request?.data) {
        const data = typeof event.request.data === 'string'
          ? JSON.parse(event.request.data)
          : event.request.data;

        if (data.password) {
          data.password = '[FILTERED]';
          event.request.data = data;
        }
      }

      return event;
    },

    // Ignore certain errors
    ignoreErrors: [
      'NavigationDuplicated',
      'Non-Error exception captured',
      'Non-Error promise rejection captured',
    ],
  });

  console.log('✅ Sentry error monitoring initialized');
};

// Express middleware - return no-op if Sentry not configured
export const sentryRequestHandler = () => {
  if (!process.env.SENTRY_DSN) return (req, res, next) => next();
  return Sentry.Handlers.requestHandler();
};

export const sentryTracingHandler = () => {
  if (!process.env.SENTRY_DSN) return (req, res, next) => next();
  return Sentry.Handlers.tracingHandler();
};

export const sentryErrorHandler = () => {
  if (!process.env.SENTRY_DSN) return (err, req, res, next) => next(err);
  return Sentry.Handlers.errorHandler();
};

// Manual error capture
export const captureException = (error, context = {}) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

export const captureMessage = (message, level = 'info') => {
  Sentry.captureMessage(message, level);
};
