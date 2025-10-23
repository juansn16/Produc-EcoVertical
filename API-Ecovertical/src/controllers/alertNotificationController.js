import db from '../config/db.js';

/**
 * Obtener notificaciones de alertas para el usuario actual
 */
export const getUserAlertNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unread_only = false } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE na.usuario_id = ?';
    let queryParams = [userId];

    if (unread_only === 'true') {
      whereClause += ' AND na.leida = FALSE';
    }

    // Obtener notificaciones con información de la alerta
    const [notifications] = await db.execute(
      `SELECT na.id, na.alerta_id, na.tipo, na.mensaje, na.leida,
              na.fecha_creacion, na.fecha_lectura,
              ar.huerto_id, ar.fecha_alerta, ar.hora_alerta,
              h.nombre as huerto_nombre
       FROM notificaciones_alertas na
       LEFT JOIN alertas_riego ar ON na.alerta_id COLLATE utf8mb4_unicode_ci = ar.id COLLATE utf8mb4_unicode_ci
       LEFT JOIN huertos h ON ar.huerto_id COLLATE utf8mb4_unicode_ci = h.id COLLATE utf8mb4_unicode_ci
       ${whereClause}
       ORDER BY na.fecha_creacion DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(limit), parseInt(offset)]
    );

    // Contar total de notificaciones
    const [countResult] = await db.execute(
      `SELECT COUNT(*) as total 
       FROM notificaciones_alertas na
       ${whereClause}`,
      queryParams
    );

    const total = countResult[0].total;

    // Contar notificaciones no leídas
    const [unreadCountResult] = await db.execute(
      `SELECT COUNT(*) as unread_count 
       FROM notificaciones_alertas 
       WHERE usuario_id = ? AND leida = FALSE`,
      [userId]
    );

    const unreadCount = unreadCountResult[0].unread_count;

    res.json({
      success: true,
      data: {
        notifications,
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
    const [notifications] = await db.execute(
      'SELECT id FROM notificaciones_alertas WHERE id = ? AND usuario_id = ?',
      [id, userId]
    );

    if (notifications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    // Marcar como leída
    await db.execute(
      'UPDATE notificaciones_alertas SET leida = TRUE, fecha_lectura = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

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

    await db.execute(
      'UPDATE notificaciones_alertas SET leida = TRUE, fecha_lectura = CURRENT_TIMESTAMP WHERE usuario_id = ? AND leida = FALSE',
      [userId]
    );

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
    const [notifications] = await db.execute(
      'SELECT id FROM notificaciones_alertas WHERE id = ? AND usuario_id = ?',
      [id, userId]
    );

    if (notifications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    // Eliminar la notificación
    await db.execute(
      'DELETE FROM notificaciones_alertas WHERE id = ?',
      [id]
    );

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

    const [result] = await db.execute(
      'SELECT COUNT(*) as unread_count FROM notificaciones_alertas WHERE usuario_id = ? AND leida = FALSE',
      [userId]
    );

    res.json({
      success: true,
      data: {
        unreadCount: result[0].unread_count
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

    const [notifications] = await db.execute(
      `SELECT na.id, na.tipo, na.mensaje, na.leida, na.fecha_creacion,
              ar.huerto_id, h.nombre as huerto_nombre
       FROM notificaciones_alertas na
       LEFT JOIN alertas_riego ar ON na.alerta_id COLLATE utf8mb4_unicode_ci = ar.id COLLATE utf8mb4_unicode_ci
       LEFT JOIN huertos h ON ar.huerto_id COLLATE utf8mb4_unicode_ci = h.id COLLATE utf8mb4_unicode_ci
       WHERE na.usuario_id = ?
       ORDER BY na.fecha_creacion DESC
       LIMIT 5`,
      [userId]
    );

    res.json({
      success: true,
      data: notifications
    });

  } catch (error) {
    console.error('Error obteniendo notificaciones recientes:', error);
    next(error);
  }
};
