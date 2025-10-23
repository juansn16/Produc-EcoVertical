// alertNotificationQueries.js
// Consultas específicas para notificaciones de alertas migradas a PostgreSQL

export const AlertNotificationQueries = {
  // Obtener notificaciones de alertas para un usuario con paginación
  getUserAlertNotifications: `
    SELECT na.id, na.alerta_id, na.tipo, na.mensaje, na.leida,
           na.fecha_creacion, na.fecha_lectura,
           ar.huerto_id, ar.fecha_alerta, ar.hora_alerta,
           h.nombre as huerto_nombre
    FROM notificaciones_alertas na
    LEFT JOIN alertas_riego ar ON na.alerta_id = ar.id
    LEFT JOIN huertos h ON ar.huerto_id = h.id
    WHERE na.usuario_id = $1
      AND ($2::boolean IS NULL OR na.leida = $2)
    ORDER BY na.fecha_creacion DESC
    LIMIT $3 OFFSET $4
  `,

  // Contar total de notificaciones para un usuario
  countUserAlertNotifications: `
    SELECT COUNT(*) as total 
    FROM notificaciones_alertas na
    WHERE na.usuario_id = $1
      AND ($2::boolean IS NULL OR na.leida = $2)
  `,

  // Contar notificaciones no leídas para un usuario
  countUnreadNotifications: `
    SELECT COUNT(*) as unread_count 
    FROM notificaciones_alertas 
    WHERE usuario_id = $1 AND leida = false
  `,

  // Verificar que una notificación pertenece al usuario
  verifyNotificationOwnership: `
    SELECT id FROM notificaciones_alertas 
    WHERE id = $1 AND usuario_id = $2
  `,

  // Marcar una notificación como leída
  markNotificationAsRead: `
    UPDATE notificaciones_alertas 
    SET leida = true, fecha_lectura = CURRENT_TIMESTAMP 
    WHERE id = $1
  `,

  // Marcar todas las notificaciones como leídas para un usuario
  markAllNotificationsAsRead: `
    UPDATE notificaciones_alertas 
    SET leida = true, fecha_lectura = CURRENT_TIMESTAMP 
    WHERE usuario_id = $1 AND leida = false
  `,

  // Eliminar una notificación
  deleteNotification: `
    DELETE FROM notificaciones_alertas 
    WHERE id = $1
  `,

  // Obtener contador de notificaciones no leídas
  getUnreadNotificationCount: `
    SELECT COUNT(*) as unread_count 
    FROM notificaciones_alertas 
    WHERE usuario_id = $1 AND leida = false
  `,

  // Obtener notificaciones recientes (últimas 5)
  getRecentNotifications: `
    SELECT na.id, na.tipo, na.mensaje, na.leida, na.fecha_creacion,
           ar.huerto_id, h.nombre as huerto_nombre
    FROM notificaciones_alertas na
    LEFT JOIN alertas_riego ar ON na.alerta_id = ar.id
    LEFT JOIN huertos h ON ar.huerto_id = h.id
    WHERE na.usuario_id = $1
    ORDER BY na.fecha_creacion DESC
    LIMIT 5
  `,

  // Obtener todas las notificaciones de alertas (para administradores)
  getAllAlertNotifications: `
    SELECT na.*, u.nombre as usuario_nombre, u.email as usuario_email,
           ar.huerto_id, ar.fecha_alerta, ar.hora_alerta,
           h.nombre as huerto_nombre
    FROM notificaciones_alertas na
    LEFT JOIN usuarios u ON na.usuario_id = u.id
    LEFT JOIN alertas_riego ar ON na.alerta_id = ar.id
    LEFT JOIN huertos h ON ar.huerto_id = h.id
    ORDER BY na.fecha_creacion DESC
  `,

  // Obtener notificaciones por tipo
  getNotificationsByType: `
    SELECT na.*, ar.huerto_id, ar.fecha_alerta, ar.hora_alerta,
           h.nombre as huerto_nombre
    FROM notificaciones_alertas na
    LEFT JOIN alertas_riego ar ON na.alerta_id = ar.id
    LEFT JOIN huertos h ON ar.huerto_id = h.id
    WHERE na.tipo = $1
    ORDER BY na.fecha_creacion DESC
  `,

  // Obtener notificaciones por alerta
  getNotificationsByAlert: `
    SELECT na.*, u.nombre as usuario_nombre, u.email as usuario_email
    FROM notificaciones_alertas na
    LEFT JOIN usuarios u ON na.usuario_id = u.id
    WHERE na.alerta_id = $1
    ORDER BY na.fecha_creacion DESC
  `,

  // Crear nueva notificación de alerta
  createAlertNotification: `
    INSERT INTO notificaciones_alertas (id, usuario_id, alerta_id, mensaje, tipo)
    VALUES ($1, $2, $3, $4, $5)
  `,

  // Obtener notificaciones por rango de fechas
  getNotificationsByDateRange: `
    SELECT na.*, ar.huerto_id, ar.fecha_alerta, ar.hora_alerta,
           h.nombre as huerto_nombre
    FROM notificaciones_alertas na
    LEFT JOIN alertas_riego ar ON na.alerta_id = ar.id
    LEFT JOIN huertos h ON ar.huerto_id = h.id
    WHERE na.fecha_creacion BETWEEN $1 AND $2
    ORDER BY na.fecha_creacion DESC
  `,

  // Obtener estadísticas de notificaciones por usuario
  getNotificationStats: `
    SELECT 
      COUNT(*) as total_notifications,
      COUNT(CASE WHEN leida = true THEN 1 END) as read_notifications,
      COUNT(CASE WHEN leida = false THEN 1 END) as unread_notifications,
      COUNT(CASE WHEN tipo = 'creacion' THEN 1 END) as creation_notifications,
      COUNT(CASE WHEN tipo = 'recordatorio' THEN 1 END) as reminder_notifications,
      COUNT(CASE WHEN tipo = 'completada' THEN 1 END) as completed_notifications,
      COUNT(CASE WHEN tipo = 'cancelada' THEN 1 END) as cancelled_notifications
    FROM notificaciones_alertas 
    WHERE usuario_id = $1
  `,

  // Eliminar notificaciones antiguas (más de X días)
  deleteOldNotifications: `
    DELETE FROM notificaciones_alertas 
    WHERE fecha_creacion < $1
  `,

  // Obtener notificaciones no leídas con información adicional
  getUnreadNotificationsWithDetails: `
    SELECT na.*, ar.huerto_id, ar.fecha_alerta, ar.hora_alerta,
           h.nombre as huerto_nombre, h.tipo as huerto_tipo
    FROM notificaciones_alertas na
    LEFT JOIN alertas_riego ar ON na.alerta_id = ar.id
    LEFT JOIN huertos h ON ar.huerto_id = h.id
    WHERE na.usuario_id = $1 AND na.leida = false
    ORDER BY na.fecha_creacion DESC
  `
};
