// alertQueries.js
// Consultas específicas para alertas migradas a PostgreSQL

export const AlertQueries = {
  // Crear nueva alerta
  create: `
    INSERT INTO alertas (id, titulo, descripcion, tipo, prioridad, huerto_id, usuario_creador, fecha_programada, hora_programada, fecha_vencimiento, esta_activa, notas)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  `,

  // Obtener próximas alertas para un usuario
  getUpcomingAlerts: `
    SELECT a.*, h.nombre as huerto_nombre, u.nombre as ubicacion_nombre
    FROM alertas a
    LEFT JOIN huertos h ON a.huerto_id = h.id
    LEFT JOIN ubicaciones u ON h.ubicacion_id = u.id
    WHERE a.esta_activa = true 
      AND a.is_deleted = false
      AND a.tipo != 'riego'
      AND (a.fecha_programada IS NULL OR a.fecha_programada >= CURRENT_DATE)
      AND h.id IN (
        SELECT uh.huerto_id 
        FROM usuario_huerto uh 
        WHERE uh.usuario_id = $1 AND uh.is_deleted = false
      )
    ORDER BY a.fecha_programada ASC, a.created_at DESC
    LIMIT $2 OFFSET $3
  `,

  // Obtener alertas por jardín
  getGardenAlerts: `
    SELECT a.*, h.nombre as huerto_nombre, u.nombre as ubicacion_nombre
    FROM alertas a
    LEFT JOIN huertos h ON a.huerto_id = h.id
    LEFT JOIN ubicaciones u ON h.ubicacion_id = u.id
    WHERE a.huerto_id = $1 
      AND a.is_deleted = false
      AND a.tipo != 'riego'
      AND ($2::boolean IS NULL OR a.esta_activa = $2)
    ORDER BY a.created_at DESC 
    LIMIT $3 OFFSET $4
  `,

  // Actualizar estado de alerta
  updateStatus: `
    UPDATE alertas 
    SET esta_activa = $1
    WHERE id = $2 AND is_deleted = false AND tipo != 'riego'
  `,

  // Actualizar alerta completa
  update: `
    UPDATE alertas 
    SET titulo = $1, descripcion = $2, prioridad = $3, fecha_programada = $4, 
        hora_programada = $5, fecha_vencimiento = $6, notas = $7
    WHERE id = $8 AND is_deleted = false AND tipo != 'riego'
  `,

  // Eliminar alerta (soft delete)
  softDelete: `
    UPDATE alertas 
    SET is_deleted = true
    WHERE id = $1 AND is_deleted = false AND tipo != 'riego'
  `,

  // Obtener alerta por ID con información del huerto
  getByIdWithGarden: `
    SELECT a.*, h.nombre as huerto_nombre, h.tipo as huerto_tipo
    FROM alertas a
    LEFT JOIN huertos h ON a.huerto_id = h.id
    WHERE a.id = $1 AND a.is_deleted = false AND a.tipo != 'riego'
  `,

  // Obtener alerta por ID básica
  getById: `
    SELECT * FROM alertas 
    WHERE id = $1 AND is_deleted = false AND tipo != 'riego'
  `,

  // Verificar que el huerto existe y obtener información
  getGardenInfo: `
    SELECT h.*, u.nombre as ubicacion_nombre
    FROM huertos h
    LEFT JOIN ubicaciones u ON h.ubicacion_id = u.id
    WHERE h.id = $1 AND h.is_deleted = false
  `,

  // Verificar rol del usuario en huerto privado
  getUserRoleInGarden: `
    SELECT rol FROM usuario_huerto 
    WHERE usuario_id = $1 AND huerto_id = $2 AND is_deleted = false
  `,

  // Obtener usuarios a notificar para huertos públicos
  getUsersInPublicGarden: `
    SELECT uh.usuario_id 
    FROM usuario_huerto uh
    WHERE uh.huerto_id = $1 AND uh.is_deleted = false
  `,

  // Obtener propietario de huerto privado
  getOwnerOfPrivateGarden: `
    SELECT uh.usuario_id 
    FROM usuario_huerto uh
    WHERE uh.huerto_id = $1 AND uh.rol = 'propietario' AND uh.is_deleted = false
  `,

  // Obtener usuarios del huerto para notificaciones
  getGardenUsers: `
    SELECT uh.usuario_id 
    FROM usuario_huerto uh
    WHERE uh.huerto_id = $1 AND uh.is_deleted = false
  `,

  // Obtener alerta con información del huerto para notificaciones
  getAlertForNotification: `
    SELECT a.*, h.nombre as huerto_nombre
    FROM alertas a
    LEFT JOIN huertos h ON a.huerto_id = h.id
    WHERE a.id = $1 AND a.is_deleted = false AND a.tipo != 'riego'
  `,

  // Obtener todas las alertas (para administradores)
  getAll: `
    SELECT a.*, h.nombre as huerto_nombre, u.nombre as ubicacion_nombre
    FROM alertas a
    LEFT JOIN huertos h ON a.huerto_id = h.id
    LEFT JOIN ubicaciones u ON h.ubicacion_id = u.id
    WHERE a.is_deleted = false AND a.tipo != 'riego'
    ORDER BY a.created_at DESC
  `,

  // Obtener alertas por tipo
  getByType: `
    SELECT a.*, h.nombre as huerto_nombre, u.nombre as ubicacion_nombre
    FROM alertas a
    LEFT JOIN huertos h ON a.huerto_id = h.id
    LEFT JOIN ubicaciones u ON h.ubicacion_id = u.id
    WHERE a.tipo = $1 AND a.is_deleted = false AND a.tipo != 'riego'
    ORDER BY a.created_at DESC
  `,

  // Obtener alertas por prioridad
  getByPriority: `
    SELECT a.*, h.nombre as huerto_nombre, u.nombre as ubicacion_nombre
    FROM alertas a
    LEFT JOIN huertos h ON a.huerto_id = h.id
    LEFT JOIN ubicaciones u ON h.ubicacion_id = u.id
    WHERE a.prioridad = $1 AND a.is_deleted = false AND a.tipo != 'riego'
    ORDER BY a.created_at DESC
  `,

  // Obtener alertas activas
  getActive: `
    SELECT a.*, h.nombre as huerto_nombre, u.nombre as ubicacion_nombre
    FROM alertas a
    LEFT JOIN huertos h ON a.huerto_id = h.id
    LEFT JOIN ubicaciones u ON h.ubicacion_id = u.id
    WHERE a.esta_activa = true AND a.is_deleted = false AND a.tipo != 'riego'
    ORDER BY a.created_at DESC
  `,

  // Obtener alertas por usuario creador
  getByCreator: `
    SELECT a.*, h.nombre as huerto_nombre, u.nombre as ubicacion_nombre
    FROM alertas a
    LEFT JOIN huertos h ON a.huerto_id = h.id
    LEFT JOIN ubicaciones u ON h.ubicacion_id = u.id
    WHERE a.usuario_creador = $1 AND a.is_deleted = false AND a.tipo != 'riego'
    ORDER BY a.created_at DESC
  `,

  // Obtener alertas por rango de fechas
  getByDateRange: `
    SELECT a.*, h.nombre as huerto_nombre, u.nombre as ubicacion_nombre
    FROM alertas a
    LEFT JOIN huertos h ON a.huerto_id = h.id
    LEFT JOIN ubicaciones u ON h.ubicacion_id = u.id
    WHERE a.fecha_programada BETWEEN $1 AND $2 
      AND a.is_deleted = false AND a.tipo != 'riego'
    ORDER BY a.fecha_programada ASC
  `,

  // Contar alertas por usuario
  countByUser: `
    SELECT COUNT(*) as total
    FROM alertas a
    JOIN usuario_huerto uh ON a.huerto_id = uh.huerto_id
    WHERE uh.usuario_id = $1 AND a.is_deleted = false AND a.tipo != 'riego'
  `,

  // Contar alertas activas por usuario
  countActiveByUser: `
    SELECT COUNT(*) as total
    FROM alertas a
    JOIN usuario_huerto uh ON a.huerto_id = uh.huerto_id
    WHERE uh.usuario_id = $1 AND a.esta_activa = true AND a.is_deleted = false AND a.tipo != 'riego'
  `
};

