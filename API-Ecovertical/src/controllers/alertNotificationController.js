import db from '../config/db.js';
import { AlertNotificationQueries } from '../utils/queries/index.js';

/**
 * Obtener notificaciones de alertas para el usuario actual
 */
export const getUserAlertNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unread_only = false } = req.query;
    const offset = (page - 1) * limit;

    // Obtener notificaciones con información de la alerta
    const notifications = await db.query(AlertNotificationQueries.getUserAlertNotifications, [
      userId,
      unread_only === 'true' ? true : null,
      parseInt(limit),
      parseInt(offset)
    ]);

    // Contar total de notificaciones
    const countResult = await db.query(AlertNotificationQueries.countUserAlertNotifications, [
      userId,
      unread_only === 'true' ? true : null
    ]);

    const total = countResult.rows[0].total;

    // Contar notificaciones no leídas
    const unreadCountResult = await db.query(AlertNotificationQueries.countUnreadNotifications, [userId]);
    const unreadCount = unreadCountResult.rows[0].unread_count;

    res.json({
      success: true,
      data: {
        notifications: notifications.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        unreadCount
      }
    });

  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    next(error);
  }
};

/**
 * Marcar una notificación como leída
 */
export const markNotificationAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar que la notificación pertenece al usuario
    const notifications = await db.query(AlertNotificationQueries.verifyNotificationOwnership, [id, userId]);

    if (notifications.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    // Marcar como leída
    await db.query(AlertNotificationQueries.markNotificationAsRead, [id]);

    res.json({
      success: true,
      message: 'Notificación marcada como leída'
    });

  } catch (error) {
    console.error('Error marcando notificación como leída:', error);
    next(error);
  }
};

/**
 * Marcar todas las notificaciones como leídas
 */
export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await db.query(AlertNotificationQueries.markAllNotificationsAsRead, [userId]);

    res.json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas'
    });

  } catch (error) {
    console.error('Error marcando todas las notificaciones como leídas:', error);
    next(error);
  }
};

/**
 * Eliminar una notificación
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar que la notificación pertenece al usuario
    const notifications = await db.query(AlertNotificationQueries.verifyNotificationOwnership, [id, userId]);

    if (notifications.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    // Eliminar la notificación
    await db.query(AlertNotificationQueries.deleteNotification, [id]);

    res.json({
      success: true,
      message: 'Notificación eliminada'
    });

  } catch (error) {
    console.error('Error eliminando notificación:', error);
    next(error);
  }
};

/**
 * Obtener contador de notificaciones no leídas
 */
export const getUnreadNotificationCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await db.query(AlertNotificationQueries.getUnreadNotificationCount, [userId]);

    res.json({
      success: true,
      data: {
        unreadCount: result.rows[0].unread_count
      }
    });

  } catch (error) {
    console.error('Error obteniendo contador de notificaciones:', error);
    next(error);
  }
};

/**
 * Obtener notificaciones recientes (últimas 5)
 */
export const getRecentNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const notifications = await db.query(AlertNotificationQueries.getRecentNotifications, [userId]);

    res.json({
      success: true,
      data: notifications.rows
    });

  } catch (error) {
    console.error('Error obteniendo notificaciones recientes:', error);
    next(error);
  }
};
