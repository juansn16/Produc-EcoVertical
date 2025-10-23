// invitationQueries.js
// Consultas específicas para códigos de invitación migradas a PostgreSQL

export const InvitationQueries = {
  // Obtener código de invitación por código
  getByCode: `
    SELECT ci.id, ci.codigo, ci.administrador_id, ci.ubicacion_id, ci.fecha_expiracion,
           u.nombre as admin_nombre, u.email as admin_email,
           ub.nombre as ubicacion_nombre, ub.ciudad, ub.estado
    FROM codigos_invitacion ci
    JOIN usuarios u ON ci.administrador_id = u.id
    JOIN ubicaciones ub ON ci.ubicacion_id = ub.id
    WHERE ci.codigo = $1 AND ci.esta_activo = true AND ci.is_deleted = false
  `,

  // Obtener código de invitación por ID
  getById: `
    SELECT * FROM codigos_invitacion 
    WHERE id = $1 AND is_deleted = false
  `,

  // Crear nuevo código de invitación
  create: `
    INSERT INTO codigos_invitacion (id, codigo, administrador_id, ubicacion_id, fecha_expiracion)
    VALUES ($1, $2, $3, $4, $5)
  `,

  // Actualizar código de invitación
  update: `
    UPDATE codigos_invitacion 
    SET codigo = $1, administrador_id = $2, ubicacion_id = $3, fecha_expiracion = $4, esta_activo = $5
    WHERE id = $6 AND is_deleted = false
  `,

  // Marcar código como usado
  markAsUsed: `
    UPDATE codigos_invitacion 
    SET usado_por = $1, fecha_uso = CURRENT_TIMESTAMP
    WHERE id = $2 AND is_deleted = false
  `,

  // Desactivar código
  deactivate: `
    UPDATE codigos_invitacion 
    SET esta_activo = false
    WHERE id = $1 AND is_deleted = false
  `,

  // Soft delete código
  softDelete: `
    UPDATE codigos_invitacion 
    SET is_deleted = true
    WHERE id = $1
  `,

  // Obtener códigos por administrador
  getByAdministrator: `
    SELECT ci.*, ub.nombre as ubicacion_nombre, ub.ciudad, ub.estado
    FROM codigos_invitacion ci
    LEFT JOIN ubicaciones ub ON ci.ubicacion_id = ub.id
    WHERE ci.administrador_id = $1 AND ci.is_deleted = false
    ORDER BY ci.created_at DESC
  `,

  // Obtener códigos por ubicación
  getByLocation: `
    SELECT ci.*, u.nombre as admin_nombre, u.email as admin_email
    FROM codigos_invitacion ci
    LEFT JOIN usuarios u ON ci.administrador_id = u.id
    WHERE ci.ubicacion_id = $1 AND ci.is_deleted = false
    ORDER BY ci.created_at DESC
  `,

  // Obtener códigos activos
  getActive: `
    SELECT ci.*, u.nombre as admin_nombre, ub.nombre as ubicacion_nombre
    FROM codigos_invitacion ci
    LEFT JOIN usuarios u ON ci.administrador_id = u.id
    LEFT JOIN ubicaciones ub ON ci.ubicacion_id = ub.id
    WHERE ci.esta_activo = true AND ci.is_deleted = false
    ORDER BY ci.created_at DESC
  `,

  // Obtener códigos expirados
  getExpired: `
    SELECT ci.*, u.nombre as admin_nombre, ub.nombre as ubicacion_nombre
    FROM codigos_invitacion ci
    LEFT JOIN usuarios u ON ci.administrador_id = u.id
    LEFT JOIN ubicaciones ub ON ci.ubicacion_id = ub.id
    WHERE ci.fecha_expiracion < CURRENT_TIMESTAMP AND ci.is_deleted = false
    ORDER BY ci.fecha_expiracion DESC
  `,

  // Contar códigos por administrador
  countByAdministrator: `
    SELECT COUNT(*) as total
    FROM codigos_invitacion 
    WHERE administrador_id = $1 AND is_deleted = false
  `,

  // Contar códigos activos por administrador
  countActiveByAdministrator: `
    SELECT COUNT(*) as total
    FROM codigos_invitacion 
    WHERE administrador_id = $1 AND esta_activo = true AND is_deleted = false
  `,

  // Verificar si código existe
  codeExists: `
    SELECT COUNT(*) as exists
    FROM codigos_invitacion 
    WHERE codigo = $1 AND is_deleted = false
  `,

  // Obtener estadísticas de códigos
  getStats: `
    SELECT 
      COUNT(*) as total_codes,
      COUNT(CASE WHEN esta_activo = true THEN 1 END) as active_codes,
      COUNT(CASE WHEN fecha_expiracion < CURRENT_TIMESTAMP THEN 1 END) as expired_codes,
      COUNT(CASE WHEN usado_por IS NOT NULL THEN 1 END) as used_codes
    FROM codigos_invitacion 
    WHERE is_deleted = false
  `
};
