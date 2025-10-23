// Sistema de logging optimizado para toda la aplicación
// Solo muestra logs en desarrollo para mejorar el rendimiento en producción

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  // Log general
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  // Log de información
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  // Log de advertencias
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  // Log de errores (siempre se muestran)
  error: (...args) => {
    console.error(...args);
  },

  // Log de debugging específico
  debug: (...args) => {
    if (isDevelopment && process.env.VITE_DEBUG === 'true') {
      console.log('🐛 DEBUG:', ...args);
    }
  },

  // Log de rendimiento
  perf: (label, fn) => {
    if (isDevelopment) {
      console.time(label);
      const result = fn();
      console.timeEnd(label);
      return result;
    }
    return fn();
  },

  // Log de API calls
  api: (method, url, data) => {
    if (isDevelopment) {
      console.log(`🌐 API ${method.toUpperCase()}:`, url, data ? { data } : '');
    }
  }
};

export default logger;
