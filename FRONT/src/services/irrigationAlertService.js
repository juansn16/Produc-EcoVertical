import api from './apiService';

// Servicio para alertas de riego
export const irrigationAlertService = {
  // Crear una nueva alerta de riego
  async createAlert(alertData) {
    try {
      const response = await api.post('/irrigation-alerts', alertData);
      return response.data;
    } catch (error) {
      console.error('Error creando alerta de riego:', error);
      throw error;
    }
  },

  // Obtener todas las alertas (solo admin/tecnico)
  async getAllAlerts(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams ? `/irrigation-alerts?${queryParams}` : '/irrigation-alerts';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo alertas:', error);
      throw error;
    }
  },

  // Obtener alertas del usuario actual
  async getUserAlerts(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams ? `/irrigation-alerts/user?${queryParams}` : '/irrigation-alerts/user';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo alertas del usuario:', error);
      throw error;
    }
  },

  // Obtener una alerta específica por ID
  async getAlertById(id) {
    try {
      const response = await api.get(`/irrigation-alerts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo alerta:', error);
      throw error;
    }
  },

  // Actualizar estado de una alerta
  async updateAlertStatus(id, status) {
    try {
      const response = await api.patch(`/irrigation-alerts/${id}/status`, { estado: status });
      return response.data;
    } catch (error) {
      console.error('Error actualizando estado de alerta:', error);
      throw error;
    }
  },

  // Eliminar una alerta
  async deleteAlert(id) {
    try {
      const response = await api.delete(`/irrigation-alerts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando alerta:', error);
      throw error;
    }
  },

  // Obtener estadísticas de alertas
  async getAlertStats() {
    try {
      const response = await api.get('/irrigation-alerts/stats');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  },

  // Obtener usuarios conectados en tiempo real
  async getConnectedUsers() {
    try {
      const response = await api.get('/irrigation-alerts/connected-users');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo usuarios conectados:', error);
      throw error;
    }
  },

  // Probar notificación WebSocket
  async testWebSocketNotification(userId, message) {
    try {
      const response = await api.post('/irrigation-alerts/test-websocket', {
        userId,
        message
      });
      return response.data;
    } catch (error) {
      console.error('Error probando notificación WebSocket:', error);
      throw error;
    }
  }
};

// Servicio para notificaciones de alertas
export const alertNotificationService = {
  // Obtener notificaciones del usuario
  async getUserNotifications(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams ? `/irrigation-alerts/notifications/all?${queryParams}` : '/irrigation-alerts/notifications/all';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error);
      throw error;
    }
  },

  // Obtener notificaciones recientes
  async getRecentNotifications() {
    try {
      const response = await api.get('/irrigation-alerts/notifications/recent');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo notificaciones recientes:', error);
      throw error;
    }
  },

  // Obtener contador de notificaciones no leídas
  async getUnreadCount() {
    try {
      const response = await api.get('/irrigation-alerts/notifications/unread-count');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo contador de notificaciones:', error);
      throw error;
    }
  },

  // Marcar notificación como leída
  async markAsRead(id) {
    try {
      const response = await api.patch(`/irrigation-alerts/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
      throw error;
    }
  },

  // Marcar todas las notificaciones como leídas
  async markAllAsRead() {
    try {
      const response = await api.patch('/irrigation-alerts/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('Error marcando todas las notificaciones como leídas:', error);
      throw error;
    }
  },

  // Eliminar notificación
  async deleteNotification(id) {
    try {
      const response = await api.delete(`/irrigation-alerts/notifications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando notificación:', error);
      throw error;
    }
  }
};

export default irrigationAlertService;
