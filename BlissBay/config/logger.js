// Define log levels
const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

// Simple console-based logger
const logger = {
  error: (message, meta) => {
    console.error(`[${LOG_LEVELS.ERROR.toUpperCase()}] ${message}`, meta || '');
  },
  
  warn: (message, meta) => {
    console.warn(`[${LOG_LEVELS.WARN.toUpperCase()}] ${message}`, meta || '');
  },
  
  info: (message, meta) => {
    console.info(`[${LOG_LEVELS.INFO.toUpperCase()}] ${message}`, meta || '');
  },
  
  debug: (message, meta) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[${LOG_LEVELS.DEBUG.toUpperCase()}] ${message}`, meta || '');
    }
  }
};

// Export both the logger and log levels
export { LOG_LEVELS };
export default logger;