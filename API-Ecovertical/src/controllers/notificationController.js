import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { NotificationQueries } from '../utils/queries/index.js';

// Crear notificación
export const createNotification = async (usuario_id, titulo, mensaje, tipo = 'comentario', datos_adicionales = null) => {
  try {
    const notificationId = uuidv4();
    
    // Extraer información del huerto de los datos adicionales si existe
    const huerto_id = datos_adicionales?.huerto_id || null;
    const huerto_nombre = datos_adicionales?.huerto_nombre || null;
    
    await db.query(NotificationQueries.createNotification, [
      notificationId, 
      usuario_id, 
      titulo, 
      mensaje, 
      tipo, 
      huerto_id, 
      huerto_nombre, 
      JSON.stringify(datos_adicionales)
    ]);
    
    return notificationId;
  } catch (error) {
    console.error('Error al crear notificación:', error);
    throw error;
  }
};

// Obtener notificaciones de un usuario
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, solo_no_leidas = false } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Determinar si filtrar por no leídas
    const filterUnread = solo_no_leidas === 'true' ? false : null; // null = no filtrar, false = solo no leídas
    
    // Obtener notificaciones con información del huerto y usuario que generó la notificación
    const notificationsResult = await db.query(NotificationQueries.getUserNotifications, [
      userId, 
      filterUnread, 
      parseInt(limit), 
      offset
    ]);
    
    // Obtener total de notificaciones
    const totalResult = await db.query(NotificationQueries.countUserNotifications, [userId, filterUnread]);
    
    const total = totalResult.rows.length > 0 ? totalResult.rows[0].total : 0;
    
    // Parsear datos adicionales si existen y formatear respuesta
    const notificationsWithData = notificationsResult.rows.map(notification => {
      const datosAdicionales = notification.datos_adicionales ? 
        JSON.parse(notification.datos_adicionales) : null;
      
      return {
        id: notification.id,
        titulo: notification.titulo,
        mensaje: notification.mensaje,
        tipo: notification.tipo,
        huerto_id: notification.huerto_id,
        huerto_nombre: notification.huerto_nombre || datosAdicionales?.huerto_nombre,
        huerto_tipo: notification.huerto_tipo,
        huerto_creador: notification.huerto_creador,
        usuario_nombre: notification.usuario_nombre,
        usuario_rol: notification.usuario_rol,
        autor_nombre: datosAdicionales?.autor_nombre,
        autor_rol: datosAdicionales?.autor_rol,
        leida: notification.leida,
        fecha_creacion: notification.created_at,
        fecha_leida: notification.fecha_leida,
        datos_adicionales: datosAdicionales
      };
    });
    
    res.json({
      success: true,
      data: notificationsWithData,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Marcar notificación como leída
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    // Verificar que la notificación existe y pertenece al usuario
    const notificationResult = await db.query(NotificationQueries.checkNotificationOwnership, [notificationId, userId]);
    
    if (notificationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }
    
    // Marcar como leída
    await db.query(NotificationQueries.markNotificationAsRead, [notificationId]);
    
    res.json({
      success: true,
      message: 'Notificación marcada como leída'
    });
    
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Marcar todas las notificaciones como leídas
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await db.query(NotificationQueries.markAllNotificationsAsRead, [userId]);
    
    res.json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas'
    });
    
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener contador de notificaciones no leídas
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const countResult = await db.query(NotificationQueries.getUnreadCount, [userId]);
    
    const unreadCount = countResult.rows.length > 0 ? countResult.rows[0].count : 0;
    
    res.json({
      success: true,
      data: { unreadCount }
    });
    
  } catch (error) {
    console.error('Error al obtener contador de notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar notificación
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    // Verificar que la notificación existe y pertenece al usuario
    const notificationResult = await db.query(NotificationQueries.checkNotificationOwnership, [notificationId, userId]);
    
    if (notificationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }
    
    // Soft delete
    await db.query(NotificationQueries.deleteNotification, [notificationId]);
    
    res.json({
      success: true,
      message: 'Notificación eliminada exitosamente'
    });
    
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};
