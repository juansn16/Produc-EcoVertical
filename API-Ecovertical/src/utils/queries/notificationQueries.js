// ==================== NOTIFICACIONES ====================

export const NotificationQueries = {
  // ==================== CRUD BÁSICO ====================

  // Crear notificación
  createNotification: `
    INSERT INTO notificaciones (id, usuario_id, titulo, mensaje, tipo, huerto_id, huerto_nombre, datos_adicionales)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `,

  // Obtener notificaciones de un usuario con información adicional
  getUserNotifications: `
    SELECT n.*, h.nombre as huerto_nombre, h.tipo as huerto_tipo, h.usuario_creador as huerto_creador,
           u.nombre as usuario_nombre, u.rol as usuario_rol
    FROM notificaciones n
    LEFT JOIN huertos h ON n.huerto_id = h.id
    LEFT JOIN usuarios u ON n.usuario_id = u.id
    WHERE n.usuario_id = $1 AND n.is_deleted = false
      AND ($2::boolean IS NULL OR n.leida = $2)
    ORDER BY n.created_at DESC
    LIMIT $3 OFFSET $4
  `,

  // Contar notificaciones de un usuario
  countUserNotifications: `
    SELECT COUNT(*) as total 
    FROM notificaciones n 
    WHERE n.usuario_id = $1 AND n.is_deleted = false
      AND ($2::boolean IS NULL OR n.leida = $2)
  `,

  // ==================== VERIFICACIÓN Y ACTUALIZACIÓN ====================

  // Verificar que la notificación existe y pertenece al usuario
  checkNotificationOwnership: `
    SELECT * FROM notificaciones 
    WHERE id = $1 AND usuario_id = $2 AND is_deleted = false
  `,

  // Marcar notificación como leída
  markNotificationAsRead: `
    UPDATE notificaciones 
    SET leida = true, fecha_leida = CURRENT_TIMESTAMP 
    WHERE id = $1
  `,

  // Marcar todas las notificaciones como leídas
  markAllNotificationsAsRead: `
    UPDATE notificaciones 
    SET leida = true, fecha_leida = CURRENT_TIMESTAMP 
    WHERE usuario_id = $1 AND leida = false AND is_deleted = false
  `,

  // ==================== CONTADORES ====================

  // Obtener contador de notificaciones no leídas
  getUnreadCount: `
    SELECT COUNT(*) as count 
    FROM notificaciones 
    WHERE usuario_id = $1 AND leida = false AND is_deleted = false
  `,

  // ==================== ELIMINACIÓN ====================

  // Eliminar notificación (soft delete)
  deleteNotification: `
    UPDATE notificaciones 
    SET is_deleted = true 
    WHERE id = $1
  `
};
