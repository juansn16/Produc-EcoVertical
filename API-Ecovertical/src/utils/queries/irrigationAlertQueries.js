// ==================== ALERTAS DE RIEGO ====================

export const IrrigationAlertQueries = {
  // ==================== VERIFICACIÓN DE HUERTOS ====================

  // Verificar que el huerto existe
  checkGardenExists: `
    SELECT id, nombre, usuario_creador FROM huertos WHERE id = $1
  `,

  // ==================== CRUD DE ALERTAS ====================

  // Crear nueva alerta de riego
  createIrrigationAlert: `
    INSERT INTO alertas_riego (huerto_id, descripcion, fecha_alerta, hora_alerta, creado_por) 
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `,

  // Obtener todas las alertas con información del huerto y creador
  getAllIrrigationAlerts: `
    SELECT ar.id, ar.huerto_id, ar.descripcion, ar.fecha_alerta, ar.hora_alerta,
           ar.estado, ar.fecha_creacion, ar.fecha_actualizacion,
           h.nombre as huerto_nombre, h.usuario_creador as propietario_id,
           u.nombre as creado_por_nombre, u.email as creado_por_email
    FROM alertas_riego ar
    JOIN huertos h ON ar.huerto_id = h.id
    JOIN usuarios u ON ar.creado_por = u.id
    WHERE ar.estado = $1
    ORDER BY ar.fecha_creacion DESC, ar.fecha_alerta DESC, ar.hora_alerta DESC
    LIMIT $2 OFFSET $3
  `,

  // Contar total de alertas por estado
  countIrrigationAlerts: `
    SELECT COUNT(*) as total FROM alertas_riego WHERE estado = $1
  `,

  // Obtener alertas de huertos del usuario
  getUserIrrigationAlerts: `
    SELECT ar.id, ar.huerto_id, ar.descripcion, ar.fecha_alerta, ar.hora_alerta,
           ar.estado, ar.fecha_creacion,
           h.nombre as huerto_nombre
    FROM alertas_riego ar
    JOIN huertos h ON ar.huerto_id = h.id
    WHERE h.usuario_creador = $1
    ORDER BY ar.fecha_alerta ASC, ar.hora_alerta ASC
    LIMIT $2 OFFSET $3
  `,

  // Contar alertas del usuario
  countUserIrrigationAlerts: `
    SELECT COUNT(*) as total 
    FROM alertas_riego ar
    JOIN huertos h ON ar.huerto_id = h.id
    WHERE h.usuario_creador = $1
  `,

  // Obtener alerta específica por ID con información completa
  getIrrigationAlertById: `
    SELECT ar.id, ar.huerto_id, ar.descripcion, ar.fecha_alerta, ar.hora_alerta,
           ar.estado, ar.fecha_creacion, ar.fecha_actualizacion,
           h.nombre as huerto_nombre, h.usuario_creador as propietario_id,
           u.nombre as creado_por_nombre, u.email as creado_por_email
    FROM alertas_riego ar
    JOIN huertos h ON ar.huerto_id = h.id
    JOIN usuarios u ON ar.creado_por = u.id
    WHERE ar.id = $1
  `,

  // Obtener alerta con información del propietario para verificación de permisos
  getIrrigationAlertWithOwner: `
    SELECT ar.*, h.usuario_creador as propietario_id 
    FROM alertas_riego ar
    JOIN huertos h ON ar.huerto_id = h.id
    WHERE ar.id = $1
  `,

  // Actualizar estado de alerta
  updateIrrigationAlertStatus: `
    UPDATE alertas_riego 
    SET estado = $1, fecha_actualizacion = CURRENT_TIMESTAMP 
    WHERE id = $2
  `,

  // Eliminar alerta de riego
  deleteIrrigationAlert: `
    DELETE FROM alertas_riego WHERE id = $1
  `,

  // ==================== INFORMACIÓN DE HUERTOS ====================

  // Obtener información básica del huerto
  getGardenInfo: `
    SELECT id, nombre FROM huertos WHERE id = $1
  `,

  // ==================== ESTADÍSTICAS ====================

  // Obtener ubicación del usuario
  getUserLocation: `
    SELECT ubicacion_id FROM usuarios WHERE id = $1 AND is_deleted = false
  `,

  // Estadísticas de alertas filtradas por condominio
  getAlertStatsByLocation: `
    SELECT 
      ar.estado,
      COUNT(*) as cantidad
    FROM alertas_riego ar
    JOIN huertos h ON ar.huerto_id = h.id
    WHERE h.ubicacion_id = $1
    GROUP BY ar.estado
  `,

  // Estadísticas de notificaciones filtradas por condominio
  getNotificationStatsByLocation: `
    SELECT 
      na.tipo,
      COUNT(*) as cantidad
    FROM notificaciones_alertas na
    JOIN usuarios u ON na.usuario_id = u.id
    WHERE u.ubicacion_id = $1
    GROUP BY na.tipo
  `,

  // Estadísticas de alertas vencidas filtradas por condominio
  getExpiredAlertStatsByLocation: `
    SELECT COUNT(*) as cantidad
    FROM notificaciones_alertas na
    JOIN usuarios u ON na.usuario_id = u.id
    WHERE na.tipo = 'vencida' AND u.ubicacion_id = $1
  `,

  // Usuarios conectados filtrados por condominio
  getOnlineUsersByLocation: `
    SELECT COUNT(DISTINCT uc.usuario_id) as cantidad 
    FROM usuarios_conectados uc
    JOIN usuarios u ON uc.usuario_id = u.id
    WHERE u.ubicacion_id = $1
  `
};
