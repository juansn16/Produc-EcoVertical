// ==================== CÓDIGOS DE INVITACIÓN ====================

export const InvitationCodeQueries = {
  // ==================== VERIFICACIÓN DE CÓDIGOS ====================

  // Verificar si un código ya existe
  isCodeUnique: `
    SELECT id FROM codigos_invitacion WHERE codigo = $1 AND is_deleted = false
  `,

  // ==================== ADMINISTRACIÓN DE CÓDIGOS ====================

  // Obtener ubicación del administrador
  getAdminLocation: `
    SELECT ubicacion_id FROM usuarios WHERE id = $1 AND is_deleted = false
  `,

  // Desactivar código anterior del administrador
  deactivatePreviousCode: `
    UPDATE codigos_invitacion 
    SET esta_activo = false, updated_at = CURRENT_TIMESTAMP 
    WHERE administrador_id = $1 AND esta_activo = true
  `,

  // Crear nuevo código de invitación
  createInvitationCode: `
    INSERT INTO codigos_invitacion 
    (id, codigo, administrador_id, ubicacion_id, esta_activo, fecha_expiracion) 
    VALUES ($1, $2, $3, $4, true, $5)
    RETURNING id
  `,

  // Obtener código actual del administrador
  getCurrentInvitationCode: `
    SELECT id, codigo, fecha_creacion, fecha_expiracion, esta_activo, usado_por, fecha_uso
    FROM codigos_invitacion 
    WHERE administrador_id = $1 AND esta_activo = true AND is_deleted = false
    ORDER BY fecha_creacion DESC 
    LIMIT 1
  `,

  // Verificar que el código pertenece al administrador
  verifyCodeOwnership: `
    SELECT id FROM codigos_invitacion 
    WHERE id = $1 AND administrador_id = $2 AND is_deleted = false
  `,

  // Eliminar código (soft delete)
  deleteInvitationCode: `
    UPDATE codigos_invitacion 
    SET is_deleted = true, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $1
  `,

  // ==================== VALIDACIÓN DE CÓDIGOS ====================

  // Validar código de invitación con información completa
  validateInvitationCode: `
    SELECT ci.id, ci.codigo, ci.administrador_id, ci.ubicacion_id, ci.fecha_expiracion,
           u.nombre as admin_nombre, u.email as admin_email,
           ub.nombre as ubicacion_nombre, ub.ciudad, ub.estado
    FROM codigos_invitacion ci
    JOIN usuarios u ON ci.administrador_id = u.id
    JOIN ubicaciones ub ON ci.ubicacion_id = ub.id
    WHERE ci.codigo = $1 AND ci.esta_activo = true AND ci.is_deleted = false
  `,

  // ==================== HISTORIAL DE CÓDIGOS ====================

  // Obtener historial de códigos del administrador con paginación
  getInvitationCodeHistory: `
    SELECT ci.id, ci.codigo, ci.fecha_creacion, ci.fecha_expiracion, ci.esta_activo,
           ci.usado_por, ci.fecha_uso,
           u.nombre as usuario_nombre, u.email as usuario_email
    FROM codigos_invitacion ci
    LEFT JOIN usuarios u ON ci.usado_por = u.id
    WHERE ci.administrador_id = $1 AND ci.is_deleted = false
    ORDER BY ci.fecha_creacion DESC
    LIMIT $2 OFFSET $3
  `,

  // Contar total de códigos del administrador
  countInvitationCodes: `
    SELECT COUNT(*) as total FROM codigos_invitacion 
    WHERE administrador_id = $1 AND is_deleted = false
  `
};
