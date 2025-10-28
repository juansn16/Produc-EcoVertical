// commentQueries.js
// Consultas específicas para comentarios migradas a PostgreSQL

export const CommentQueries = {
  // ==================== COMENTARIOS DE HUERTOS ====================
  
  // Crear nuevo comentario
  create: `
    INSERT INTO comentarios (id, huerto_id, usuario_id, contenido, tipo_comentario, cambio_tierra, nombre_siembra)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `,

  // Obtener comentario por ID con datos del usuario y estadísticas
  // Usamos una subquery simple para obtener el último registro de huerto_data
  getByIdWithData: `
    SELECT 
      c.id,
      c.huerto_id,
      c.usuario_id,
      c.contenido,
      c.tipo_comentario,
      c.fecha_creacion,
      c.fecha_actualizacion,
      c.cambio_tierra,
      c.nombre_siembra,
      u.nombre as usuario_nombre, 
      u.rol as usuario_rol,
      COALESCE(hd_latest.cantidad_agua, NULL) as cantidad_agua,
      COALESCE(hd_latest.unidad_agua, NULL) as unidad_agua,
      COALESCE(hd_latest.cantidad_siembra, NULL) as cantidad_siembra,
      COALESCE(hd_latest.cantidad_cosecha, NULL) as cantidad_cosecha,
      COALESCE(hd_latest.cantidad_abono, NULL) as cantidad_abono,
      COALESCE(hd_latest.unidad_abono, NULL) as unidad_abono,
      COALESCE(hd_latest.cantidad_plagas, NULL) as cantidad_plagas,
      COALESCE(hd_latest.cantidad_mantenimiento, NULL) as cantidad_mantenimiento,
      COALESCE(hd_latest.unidad_mantenimiento, NULL) as unidad_mantenimiento,
      COALESCE(hd_latest.plaga_especie, NULL) as plaga_especie,
      COALESCE(hd_latest.plaga_nivel, NULL) as plaga_nivel,
      COALESCE(hd_latest.siembra_relacionada, NULL) as siembra_relacionada,
      COALESCE(hd_latest.huerto_siembra_id, NULL) as huerto_siembra_id,
      COALESCE(hd_latest.fecha, NULL) as fecha_actividad
    FROM comentarios c
    LEFT JOIN usuarios u ON c.usuario_id = u.id
    LEFT JOIN (
      SELECT DISTINCT ON (comentario_id) *
      FROM huerto_data
      WHERE is_deleted = false
      ORDER BY comentario_id, fecha DESC NULLS LAST
    ) hd_latest ON hd_latest.comentario_id = c.id
    WHERE c.id = $1 AND c.is_deleted = false
  `,

  // Obtener comentarios por huerto con paginación
  getByGarden: `
    SELECT 
      c.id,
      c.huerto_id,
      c.usuario_id,
      c.contenido,
      c.tipo_comentario,
      c.fecha_creacion,
      c.fecha_actualizacion,
      c.cambio_tierra,
      c.nombre_siembra,
      u.nombre as usuario_nombre, 
      u.rol as usuario_rol,
      hd.cantidad_agua,
      hd.unidad_agua,
      hd.cantidad_siembra,
      hd.cantidad_cosecha,
      hd.cantidad_abono,
      hd.cantidad_plagas,
      hd.cantidad_mantenimiento,
      hd.unidad_mantenimiento,
      hd.plaga_especie,
      hd.plaga_nivel,
      hd.siembra_relacionada,
      hd.huerto_siembra_id
    FROM comentarios c
    LEFT JOIN usuarios u ON c.usuario_id = u.id
    LEFT JOIN LATERAL (
      SELECT *
      FROM huerto_data
      WHERE comentario_id = c.id AND is_deleted = false
      ORDER BY fecha DESC NULLS LAST
      LIMIT 1
    ) hd ON true
    WHERE c.huerto_id = $1 AND c.is_deleted = false
    ORDER BY c.fecha_creacion DESC
    LIMIT $2 OFFSET $3
  `,

  // Contar comentarios por huerto
  countByGarden: `
    SELECT COUNT(*) as total 
    FROM comentarios 
    WHERE huerto_id = $1 AND is_deleted = false
  `,

  // Actualizar comentario
  update: `
    UPDATE comentarios 
    SET contenido = $1, tipo_comentario = $2, fecha_actualizacion = CURRENT_TIMESTAMP, cambio_tierra = $3, nombre_siembra = $4 
    WHERE id = $5
  `,

  // Eliminar comentario (soft delete)
  delete: `
    UPDATE comentarios 
    SET is_deleted = true 
    WHERE id = $1
  `,

  // Obtener comentario básico por ID
  getById: `
    SELECT * FROM comentarios 
    WHERE id = $1 AND is_deleted = false
  `,

  // Obtener información del huerto para notificaciones
  getGardenInfoForNotification: `
    SELECT h.nombre as huerto_nombre, h.usuario_creador as huerto_creador, h.ubicacion_id
    FROM comentarios c
    JOIN huertos h ON c.huerto_id = h.id
    WHERE c.id = $1
  `,

  // Obtener usuarios del huerto para notificaciones
  getGardenUsersForNotification: `
    SELECT DISTINCT uh.usuario_id, u.nombre as usuario_nombre
    FROM usuario_huerto uh
    LEFT JOIN usuarios u ON uh.usuario_id = u.id
    WHERE uh.huerto_id = $1 AND uh.usuario_id != $2 AND uh.is_deleted = false AND u.is_deleted = false
  `,

  // Obtener estadísticas de comentarios por huerto
  getStatsByGarden: `
    SELECT 
      COUNT(*) as total_comentarios,
      COUNT(DISTINCT usuario_id) as usuarios_activos,
      tipo_comentario,
      DATE(fecha_creacion) as fecha
    FROM comentarios 
    WHERE huerto_id = $1 AND is_deleted = false
    GROUP BY tipo_comentario, DATE(fecha_creacion)
    ORDER BY fecha DESC
  `,

  // ==================== DATOS DE HUERTO ====================
  
  // Crear datos estadísticos del huerto
  createGardenData: `
    INSERT INTO huerto_data (id, comentario_id, huerto_id, fecha, cantidad_agua, unidad_agua, cantidad_siembra, 
     cantidad_cosecha, cantidad_abono, unidad_abono, cantidad_plagas, cantidad_mantenimiento, unidad_mantenimiento, 
     plaga_especie, plaga_nivel, siembra_relacionada, huerto_siembra_id, usuario_registro)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
  `,

  // Actualizar datos estadísticos del huerto
  updateGardenData: `
    UPDATE huerto_data SET 
     cantidad_agua = $1, unidad_agua = $2, cantidad_siembra = $3, cantidad_cosecha = $4, cantidad_abono = $5, unidad_abono = $6,
     cantidad_plagas = $7, cantidad_mantenimiento = $8, unidad_mantenimiento = $9, plaga_especie = $10, plaga_nivel = $11, 
     siembra_relacionada = $12, huerto_siembra_id = $13, fecha = $14
    WHERE comentario_id = $15 AND is_deleted = false
  `,

  // Verificar si existen datos para un comentario
  checkExistingGardenData: `
    SELECT id FROM huerto_data 
    WHERE comentario_id = $1 AND is_deleted = false
  `,

  // ==================== ALERTAS DE RIEGO ====================
  
  // Obtener alertas de riego activas para cancelación
  getActiveWateringAlerts: `
    SELECT ar.id, ar.titulo, ar.huerto_id, h.nombre as huerto_nombre
    FROM alertas_riego ar
    LEFT JOIN huertos h ON ar.huerto_id = h.id
    WHERE ar.huerto_id = $1 AND ar.esta_activa = true AND ar.is_deleted = false
  `,

  // Actualizar última fecha de riego en alertas
  updateWateringAlertDates: `
    UPDATE alertas_riego 
    SET ultimo_riego = CURRENT_TIMESTAMP, proximo_riego = CURRENT_TIMESTAMP + INTERVAL '1 day'
    WHERE id = ANY($1)
  `,

  // Obtener usuarios técnicos y administradores del huerto
  getGardenTechUsers: `
    SELECT DISTINCT uh.usuario_id, u.nombre as usuario_nombre
    FROM usuario_huerto uh
    LEFT JOIN usuarios u ON uh.usuario_id = u.id
    WHERE uh.huerto_id = $1 AND uh.is_deleted = false AND u.is_deleted = false 
    AND u.rol IN ('administrador', 'tecnico') AND uh.usuario_id != $2
  `,

  // ==================== COMENTARIOS DE INVENTARIO ====================
  
  // Obtener comentarios de inventario con información del usuario
  getInventoryCommentsWithUser: `
    SELECT 
      ci.*,
      u.nombre as usuario_nombre,
      u.rol as usuario_rol
    FROM comentarios_inventario ci
    LEFT JOIN usuarios u ON ci.usuario_id = u.id
    WHERE ci.inventario_id = $1 AND ci.is_deleted = false
    ORDER BY ci.fecha_creacion DESC
  `,

  // Verificar que existe un item de inventario
  checkInventoryExists: `
    SELECT * FROM inventario 
    WHERE id = $1 AND is_deleted = false
  `,

  // ==================== VERIFICACIONES ====================
  
  // Verificar que existe un huerto
  checkGardenExists: `
    SELECT * FROM huertos 
    WHERE id = $1 AND is_deleted = false
  `,

  // Obtener información del usuario para notificaciones
  getUserInfoForNotification: `
    SELECT nombre as usuario_nombre, rol as usuario_rol
    FROM usuarios
    WHERE id = $1
  `,

  // ==================== BÚSQUEDAS Y FILTROS ====================
  
  // Buscar comentarios por contenido
  searchByContent: `
    SELECT 
      c.*, 
      u.nombre as usuario_nombre, 
      u.rol as usuario_rol,
      h.nombre as huerto_nombre
    FROM comentarios c
    LEFT JOIN usuarios u ON c.usuario_id = u.id
    LEFT JOIN huertos h ON c.huerto_id = h.id
    WHERE c.contenido ILIKE $1 AND c.is_deleted = false
    ORDER BY c.fecha_creacion DESC
    LIMIT $2 OFFSET $3
  `,

  // Buscar comentarios por tipo
  getByType: `
    SELECT 
      c.*, 
      u.nombre as usuario_nombre, 
      u.rol as usuario_rol,
      h.nombre as huerto_nombre
    FROM comentarios c
    LEFT JOIN usuarios u ON c.usuario_id = u.id
    LEFT JOIN huertos h ON c.huerto_id = h.id
    WHERE c.tipo_comentario = $1 AND c.is_deleted = false
    ORDER BY c.fecha_creacion DESC
    LIMIT $2 OFFSET $3
  `,

  // Obtener comentarios por usuario
  getByUser: `
    SELECT 
      c.*, 
      u.nombre as usuario_nombre, 
      u.rol as usuario_rol,
      h.nombre as huerto_nombre
    FROM comentarios c
    LEFT JOIN usuarios u ON c.usuario_id = u.id
    LEFT JOIN huertos h ON c.huerto_id = h.id
    WHERE c.usuario_id = $1 AND c.is_deleted = false
    ORDER BY c.fecha_creacion DESC
    LIMIT $2 OFFSET $3
  `,

  // ==================== ESTADÍSTICAS AVANZADAS ====================
  
  // Obtener estadísticas generales de comentarios
  getGeneralStats: `
    SELECT 
      COUNT(*) as total_comentarios,
      COUNT(DISTINCT usuario_id) as usuarios_activos,
      COUNT(DISTINCT huerto_id) as huertos_activos,
      tipo_comentario,
      COUNT(*) as cantidad_por_tipo
    FROM comentarios 
    WHERE is_deleted = false
    GROUP BY tipo_comentario
    ORDER BY cantidad_por_tipo DESC
  `,

  // Obtener comentarios más recientes
  getRecentComments: `
    SELECT 
      c.*, 
      u.nombre as usuario_nombre, 
      u.rol as usuario_rol,
      h.nombre as huerto_nombre
    FROM comentarios c
    LEFT JOIN usuarios u ON c.usuario_id = u.id
    LEFT JOIN huertos h ON c.huerto_id = h.id
    WHERE c.is_deleted = false
    ORDER BY c.fecha_creacion DESC
    LIMIT $1
  `,

  // Obtener actividad por fecha
  getActivityByDate: `
    SELECT 
      DATE(fecha_creacion) as fecha,
      COUNT(*) as cantidad_comentarios,
      COUNT(DISTINCT usuario_id) as usuarios_activos
    FROM comentarios 
    WHERE huerto_id = $1 AND is_deleted = false
    AND fecha_creacion >= $2
    GROUP BY DATE(fecha_creacion)
    ORDER BY fecha DESC
  `
};

