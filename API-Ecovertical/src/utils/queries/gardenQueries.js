// gardenQueries.js
// Consultas específicas para huertos migradas a PostgreSQL

export const GardenQueries = {
  // ==================== HUERTOS ====================
  
  // Crear nuevo huerto
  create: `
    INSERT INTO huertos (id, nombre, descripcion, tipo, superficie, capacidad, ubicacion_id, usuario_creador, imagen_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `,

  // Obtener huerto por ID
  getById: `
    SELECT * FROM huertos 
    WHERE id = $1 AND is_deleted = false
  `,

  // Obtener huerto con información completa
  getByIdWithDetails: `
    SELECT h.*, u.nombre as ubicacion_nombre, u.calle, u.ciudad, u.estado,
           uc.nombre as creador_nombre, uc.email as creador_email,
           usr.ubicacion_id as user_location_id
    FROM huertos h
    LEFT JOIN ubicaciones u ON h.ubicacion_id = u.id
    LEFT JOIN usuarios uc ON h.usuario_creador = uc.id
    LEFT JOIN usuarios usr ON usr.id = $1
    WHERE h.id = $2 AND h.is_deleted = false
  `,

  // Obtener huerto recién creado
  getRecentlyCreated: `
    SELECT h.*, u.nombre as ubicacion_nombre, uc.nombre as creador_nombre
    FROM huertos h
    LEFT JOIN ubicaciones u ON h.ubicacion_id = u.id
    LEFT JOIN usuarios uc ON h.usuario_creador = uc.id
    WHERE h.nombre = $1 AND h.usuario_creador = $2 AND h.is_deleted = false
    ORDER BY h.created_at DESC LIMIT 1
  `,

  // Actualizar huerto
  update: `
    UPDATE huertos 
    SET nombre = $1, descripcion = $2, tipo = $3, superficie = $4, capacidad = $5, ubicacion_id = $6, imagen_url = $7
    WHERE id = $8 AND is_deleted = false
  `,

  // Eliminar huerto (soft delete)
  softDelete: `
    UPDATE huertos 
    SET is_deleted = true 
    WHERE id = $1
  `,

  // Listar huertos con filtros y acceso
  listWithAccess: `
    SELECT h.*, u.nombre as ubicacion_nombre, uc.nombre as creador_nombre,
           COALESCE(user_count.count, 0) as usuarios_asignados,
           CASE 
             WHEN uh_assigned.usuario_id IS NOT NULL THEN 'asignado'
             WHEN h.usuario_creador = $1 THEN 'propietario'
             ELSE 'admin'
           END as access_type
    FROM huertos h
    LEFT JOIN ubicaciones u ON h.ubicacion_id = u.id
    LEFT JOIN usuarios uc ON h.usuario_creador = uc.id
    LEFT JOIN usuario_huerto uh_assigned ON h.id = uh_assigned.huerto_id AND uh_assigned.usuario_id = $1 AND uh_assigned.is_deleted = false
    LEFT JOIN (
      SELECT huerto_id, COUNT(*) as count
      FROM usuario_huerto
      WHERE is_deleted = false
      GROUP BY huerto_id
    ) user_count ON h.id = user_count.huerto_id
    WHERE h.is_deleted = false
    AND (
      -- Huertos privados: 
      --   * Creados por el usuario actual
      --   * O todos los privados del condominio si es admin/técnico
      --   * O huertos donde el usuario está asignado como residente
      (h.tipo = 'privado' AND (
        h.usuario_creador = $1 
        OR (h.ubicacion_id = $2 AND $3 IN ('administrador', 'tecnico'))
        OR uh_assigned.usuario_id IS NOT NULL
      ))
      OR
      -- Huertos públicos: solo los del mismo condominio
      (h.tipo = 'publico' AND h.ubicacion_id = $2)
    )
    ORDER BY h.created_at DESC
  `,

  // Obtener huertos del usuario
  getUserGardens: `
    SELECT h.*, u.nombre as ubicacion_nombre, uc.nombre as creador_nombre,
           uh.rol as user_role, uh.fecha_union,
           CASE 
             WHEN uh.usuario_id IS NOT NULL THEN uh.rol
             WHEN h.usuario_creador = $1 THEN 'propietario'
             ELSE 'administrador'
           END as access_role
    FROM huertos h
    LEFT JOIN ubicaciones u ON h.ubicacion_id = u.id
    LEFT JOIN usuarios uc ON h.usuario_creador = uc.id
    LEFT JOIN usuario_huerto uh ON h.id = uh.huerto_id AND uh.usuario_id = $1 AND uh.is_deleted = false
    WHERE h.is_deleted = false AND h.ubicacion_id = $2
    ORDER BY h.created_at DESC
  `,

  // Obtener huertos asignados al usuario
  getUserAssignedGardens: `
    SELECT h.*, u.nombre as ubicacion_nombre, uc.nombre as creador_nombre,
           uh.rol as user_role, uh.fecha_union,
           uh.rol as access_role
    FROM huertos h
    INNER JOIN usuario_huerto uh ON h.id = uh.huerto_id AND uh.usuario_id = $1 AND uh.is_deleted = false
    LEFT JOIN ubicaciones u ON h.ubicacion_id = u.id
    LEFT JOIN usuarios uc ON h.usuario_creador = uc.id
    WHERE h.is_deleted = false
    ORDER BY uh.fecha_union DESC
  `,

  // ==================== USUARIOS DE HUERTO ====================
  
  // Crear asignación usuario-huerto
  createUserGardenAssignment: `
    INSERT INTO usuario_huerto (id, usuario_id, huerto_id, rol)
    VALUES ($1, $2, $3, $4)
  `,

  // Obtener usuarios asignados al huerto
  getGardenUsers: `
    SELECT uh.*, u.nombre, u.email, u.rol
    FROM usuario_huerto uh
    LEFT JOIN usuarios u ON uh.usuario_id = u.id
    WHERE uh.huerto_id = $1 AND uh.is_deleted = false
  `,

  // Obtener residentes del huerto (para administradores)
  getGardenResidents: `
    SELECT 
      uh.id as assignment_id,
      uh.usuario_id,
      uh.rol as assignment_role,
      uh.created_at as assigned_at,
      u.nombre,
      u.email,
      u.telefono,
      u.rol as user_role
    FROM usuario_huerto uh
    LEFT JOIN usuarios u ON uh.usuario_id = u.id
    WHERE uh.huerto_id = $1 AND uh.is_deleted = false AND u.is_deleted = false
    ORDER BY uh.created_at DESC
  `,

  // Verificar asignación usuario-huerto
  checkUserGardenAssignment: `
    SELECT * FROM usuario_huerto 
    WHERE usuario_id = $1 AND huerto_id = $2 AND is_deleted = false
  `,

  // Verificar asignación existente (incluyendo eliminadas)
  checkExistingAssignment: `
    SELECT * FROM usuario_huerto 
    WHERE usuario_id = $1 AND huerto_id = $2
  `,

  // Reactivar asignación eliminada
  reactivateAssignment: `
    UPDATE usuario_huerto 
    SET is_deleted = false, rol = $1 
    WHERE usuario_id = $2 AND huerto_id = $3
  `,

  // Eliminar todas las asignaciones de un huerto (soft delete)
  removeAllUsersFromGarden: `
    UPDATE usuario_huerto 
    SET is_deleted = true 
    WHERE huerto_id = $1
  `,

  // Contar usuarios asignados al huerto
  countGardenUsers: `
    SELECT COUNT(*) as count FROM usuario_huerto 
    WHERE huerto_id = $1 AND is_deleted = false
  `,

  // Obtener usuarios para notificaciones
  getGardenUsersForNotifications: `
    SELECT usuario_id FROM usuario_huerto 
    WHERE huerto_id = $1 AND is_deleted = false
  `,

  // ==================== DATOS DE HUERTO ====================
  
  // Crear datos del huerto
  createGardenData: `
    INSERT INTO huerto_data (id, huerto_id, fecha, cantidad_agua, cantidad_siembra, cantidad_cosecha, 
                            fecha_inicio, fecha_final, total_dias, cantidad_abono, cantidad_plagas, usuario_registro)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  `,

  // Obtener datos del huerto
  getGardenData: `
    SELECT hd.*, u.nombre as registrador_nombre
    FROM huerto_data hd
    LEFT JOIN usuarios u ON hd.usuario_registro = u.id
    WHERE hd.huerto_id = $1 AND hd.is_deleted = false
    ORDER BY hd.fecha DESC
  `,

  // Obtener estadísticas del huerto
  getGardenStats: `
    SELECT 
      COUNT(*) as total_registros,
      SUM(cantidad_agua) as total_agua,
      SUM(cantidad_siembra) as total_siembra,
      SUM(cantidad_cosecha) as total_cosecha
    FROM huerto_data 
    WHERE huerto_id = $1 AND is_deleted = false
  `,

  // Verificar acceso del usuario al huerto
  checkUserGardenAccess: `
    SELECT * FROM usuario_huerto 
    WHERE usuario_id = $1 AND huerto_id = $2 AND is_deleted = false
  `,

  // ==================== MANTENIMIENTO ====================
  
  // Crear alerta de mantenimiento
  createMaintenanceAlert: `
    INSERT INTO alertas (id, titulo, descripcion, tipo, prioridad, huerto_id, usuario_creador, 
                        fecha_programada, fecha_vencimiento, esta_activa, notas)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  `,

  // Obtener historial de mantenimiento
  getMaintenanceHistory: `
    SELECT a.*, u.nombre as creador_nombre
    FROM alertas a
    LEFT JOIN usuarios u ON a.usuario_creador = u.id
    WHERE a.huerto_id = $1 AND a.tipo = 'mantenimiento' AND a.is_deleted = false
    ORDER BY a.fecha_programada DESC
  `,

  // Obtener historial de mantenimiento con filtros de fecha
  getMaintenanceHistoryWithDates: `
    SELECT a.*, u.nombre as creador_nombre
    FROM alertas a
    LEFT JOIN usuarios u ON a.usuario_creador = u.id
    WHERE a.huerto_id = $1 AND a.tipo = 'mantenimiento' AND a.is_deleted = false
    AND ($2::date IS NULL OR a.fecha_programada >= $2)
    AND ($3::date IS NULL OR a.fecha_programada <= $3)
    ORDER BY a.fecha_programada DESC
  `,

  // Crear destinatarios para alerta
  createAlertRecipients: `
    INSERT INTO alerta_destinatarios (id, alerta_id, usuario_id)
    VALUES ($1, $2, $3)
  `,

  // ==================== VERIFICACIONES ====================
  
  // Verificar que existe un usuario
  checkUserExists: `
    SELECT ubicacion_id FROM usuarios 
    WHERE id = $1 AND is_deleted = false
  `,

  // Obtener información del usuario
  getUserInfo: `
    SELECT ubicacion_id, rol FROM usuarios 
    WHERE id = $1 AND is_deleted = false
  `,

  // Verificar que existe una ubicación
  checkLocationExists: `
    SELECT * FROM ubicaciones 
    WHERE id = $1 AND is_deleted = false
  `,

  // ==================== BÚSQUEDAS Y FILTROS ====================
  
  // Buscar huertos por nombre
  searchGardensByName: `
    SELECT h.*, u.nombre as ubicacion_nombre, uc.nombre as creador_nombre
    FROM huertos h
    LEFT JOIN ubicaciones u ON h.ubicacion_id = u.id
    LEFT JOIN usuarios uc ON h.usuario_creador = uc.id
    WHERE h.nombre ILIKE $1 AND h.is_deleted = false
    ORDER BY h.created_at DESC
    LIMIT $2 OFFSET $3
  `,

  // Buscar huertos por tipo
  getGardensByType: `
    SELECT h.*, u.nombre as ubicacion_nombre, uc.nombre as creador_nombre
    FROM huertos h
    LEFT JOIN ubicaciones u ON h.ubicacion_id = u.id
    LEFT JOIN usuarios uc ON h.usuario_creador = uc.id
    WHERE h.tipo = $1 AND h.is_deleted = false
    ORDER BY h.created_at DESC
    LIMIT $2 OFFSET $3
  `,

  // Obtener huertos por ubicación
  getGardensByLocation: `
    SELECT h.*, u.nombre as ubicacion_nombre, uc.nombre as creador_nombre
    FROM huertos h
    LEFT JOIN ubicaciones u ON h.ubicacion_id = u.id
    LEFT JOIN usuarios uc ON h.usuario_creador = uc.id
    WHERE h.ubicacion_id = $1 AND h.is_deleted = false
    ORDER BY h.created_at DESC
  `,

  // ==================== ESTADÍSTICAS AVANZADAS ====================
  
  // Obtener estadísticas generales de huertos
  getGeneralStats: `
    SELECT 
      COUNT(*) as total_huertos,
      COUNT(CASE WHEN tipo = 'privado' THEN 1 END) as huertos_privados,
      COUNT(CASE WHEN tipo = 'publico' THEN 1 END) as huertos_publicos,
      COUNT(DISTINCT ubicacion_id) as ubicaciones_con_huertos
    FROM huertos 
    WHERE is_deleted = false
  `,

  // Obtener huertos más activos
  getMostActiveGardens: `
    SELECT 
      h.id,
      h.nombre,
      h.tipo,
      COUNT(hd.id) as total_registros,
      SUM(hd.cantidad_agua) as total_agua,
      SUM(hd.cantidad_siembra) as total_siembra,
      SUM(hd.cantidad_cosecha) as total_cosecha
    FROM huertos h
    LEFT JOIN huerto_data hd ON h.id = hd.huerto_id AND hd.is_deleted = false
    WHERE h.is_deleted = false
    GROUP BY h.id, h.nombre, h.tipo
    ORDER BY total_registros DESC, h.nombre ASC
    LIMIT $1
  `,

  // Obtener actividad por fecha
  getActivityByDate: `
    SELECT 
      DATE(hd.fecha) as fecha,
      COUNT(*) as cantidad_registros,
      COUNT(DISTINCT hd.huerto_id) as huertos_activos
    FROM huerto_data hd
    WHERE hd.huerto_id = $1 AND hd.is_deleted = false
    AND hd.fecha >= $2
    GROUP BY DATE(hd.fecha)
    ORDER BY fecha DESC
  `,

  // ==================== QUERIES DE ACTUALIZACIÓN DINÁMICA ====================
  
  // Construir query de actualización dinámica
  buildUpdateQuery: (fields) => {
    const updateFields = fields.map((field, index) => `${field} = $${index + 1}`);
    return `
      UPDATE huertos 
      SET ${updateFields.join(', ')}
      WHERE id = $${fields.length + 1} AND is_deleted = false
    `;
  }
};
