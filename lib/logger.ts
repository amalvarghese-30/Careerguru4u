/**
 * Logger utility - wraps console methods to only log in development
 * In production, all logging is disabled to prevent information leakage
 */

const isDev = process.env.NODE_ENV === "development";

export const logger = {
  error: (...args: unknown[]) => {
    if (isDev) {
      console.error(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  info: (...args: unknown[]) => {
    if (isDev) {
      console.info(...args);
    }
  },
  debug: (...args: unknown[]) => {
    if (isDev) {
      console.debug(...args);
    }
  },
  log: (...args: unknown[]) => {
    if (isDev) {
      console.log(...args);
    }
  },
};

// For security events that should always be logged (not user-facing info)
export const securityLogger = {
  error: (...args: unknown[]) => {
    // Security events should be logged regardless of environment
    // In production, this would go to a proper logging service
    console.error(...args);
  },
  warn: (...args: unknown[]) => {
    console.warn(...args);
  },
};