import apiService from './apiService.js';

const notificationService = {
  // Obtener notificaciones del usuario
  async getNotifications(page = 1, limit = 10, soloNoLeidas = false) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(soloNoLeidas && { solo_no_leidas: 'true' })
      });
      
      const response = await apiService.get(`/notifications?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      throw error;
    }
  },

  // Obtener contador de notificaciones no leídas
  async getUnreadCount() {
    try {
      const response = await apiService.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      console.error('Error al obtener contador de notificaciones:', error);
      throw error;
    }
  },

  // Marcar notificación como leída
  async markAsRead(notificationId) {
    try {
      const response = await apiService.patch(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      throw error;
    }
  },

  // Marcar todas las notificaciones como leídas
  async markAllAsRead() {
    try {
      const response = await apiService.patch('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
      throw error;
    }
  },

  // Eliminar notificación
  async deleteNotification(notificationId) {
    try {
      const response = await apiService.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      throw error;
    }
  },

  // Formatear tiempo relativo
  formatTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'Hace un momento';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `Hace ${days} día${days > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  },

  // Obtener icono según el tipo de notificación
  getNotificationIcon(tipo) {
    switch (tipo) {
      case 'comentario':
        return '💬';
      case 'alerta':
        return '⚠️';
      case 'sistema':
        return '🔔';
      case 'recordatorio':
        return '⏰';
      case 'riego':
        return '💧';
      case 'alerta_riego':
        return '💧';
      case 'plaga':
        return '🐛';
      case 'tarea':
        return '✅';
      case 'mantenimiento':
        return '🔧';
      case 'cosecha':
        return '🌾';
      case 'test_message':
        return '🧪';
      default:
        return '📢';
    }
  }
};

export default notificationService;
