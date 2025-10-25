/**
 * Utilidad para mantener el servicio activo en Render
 * Evita que el servicio se suspenda por inactividad
 */

class KeepAliveService {
  constructor() {
    this.interval = null;
    this.isRunning = false;
  }

  /**
   * Inicia el servicio de keep-alive
   * Hace ping al endpoint cada 10 minutos para mantener el servicio activo
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️ Keep-alive ya está ejecutándose');
      return;
    }

    // Solo ejecutar en producción (Render)
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔧 Keep-alive deshabilitado en desarrollo');
      return;
    }

    this.interval = setInterval(async () => {
      try {
        const response = await fetch(`${process.env.API_URL || 'http://localhost:3000'}/api/ping`);
        if (response.ok) {
          console.log('💓 Keep-alive ping exitoso');
        } else {
          console.log('⚠️ Keep-alive ping falló:', response.status);
        }
      } catch (error) {
        console.error('❌ Error en keep-alive ping:', error.message);
      }
    }, 10 * 60 * 1000); // Cada 10 minutos

    this.isRunning = true;
    console.log('💓 Servicio keep-alive iniciado (cada 10 minutos)');
  }

  /**
   * Detiene el servicio de keep-alive
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.isRunning = false;
      console.log('🛑 Servicio keep-alive detenido');
    }
  }

  /**
   * Obtiene el estado del servicio
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      interval: !!this.interval
    };
  }
}

// Crear instancia singleton
const keepAliveService = new KeepAliveService();

export default keepAliveService;
