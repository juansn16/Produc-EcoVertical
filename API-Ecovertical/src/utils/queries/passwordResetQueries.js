// passwordResetQueries.js
// Consultas específicas para restablecimiento de contraseñas migradas a PostgreSQL

export const PasswordResetQueries = {
  // Crear código de restablecimiento
  create: `
    INSERT INTO password_reset_codes (user_id, email, code, code_hash, expires_at)
    VALUES ($1, $2, $3, $4, $5)
  `,

  // Obtener código válido por email
  getValidByEmail: `
    SELECT prc.*, u.nombre 
    FROM password_reset_codes prc
    JOIN usuarios u ON prc.user_id = u.id
    WHERE prc.email = $1 AND prc.is_used = false AND prc.expires_at > CURRENT_TIMESTAMP
    ORDER BY prc.created_at DESC
    LIMIT 1
  `,

  // Obtener código por ID
  getById: `
    SELECT * FROM password_reset_codes 
    WHERE id = $1
  `,

  // Marcar código como usado
  markAsUsed: `
    UPDATE password_reset_codes 
    SET is_used = true 
    WHERE id = $1
  `,

  // Invalidar códigos anteriores del usuario
  invalidateUserCodes: `
    UPDATE password_reset_codes 
    SET is_used = true 
    WHERE user_id = $1 AND email = $2
  `,

  // Obtener códigos recientes usados (para validación)
  getRecentUsed: `
    SELECT * FROM password_reset_codes 
    WHERE email = $1 AND is_used = true AND created_at > CURRENT_TIMESTAMP - INTERVAL '1 hour'
    ORDER BY created_at DESC
    LIMIT 1
  `,

  // Obtener códigos por usuario
  getByUser: `
    SELECT * FROM password_reset_codes 
    WHERE user_id = $1
    ORDER BY created_at DESC
  `,

  // Obtener códigos por email
  getByEmail: `
    SELECT * FROM password_reset_codes 
    WHERE email = $1
    ORDER BY created_at DESC
  `,

  // Eliminar códigos expirados
  deleteExpired: `
    DELETE FROM password_reset_codes 
    WHERE expires_at < CURRENT_TIMESTAMP
  `,

  // Eliminar códigos antiguos (más de 24 horas)
  deleteOld: `
    DELETE FROM password_reset_codes 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '24 hours'
  `,

  // Contar códigos activos por usuario
  countActiveByUser: `
    SELECT COUNT(*) as total
    FROM password_reset_codes 
    WHERE user_id = $1 AND is_used = false AND expires_at > CURRENT_TIMESTAMP
  `,

  // Contar códigos por email
  countByEmail: `
    SELECT COUNT(*) as total
    FROM password_reset_codes 
    WHERE email = $1
  `,

  // Obtener estadísticas de códigos
  getStats: `
    SELECT 
      COUNT(*) as total_codes,
      COUNT(CASE WHEN is_used = true THEN 1 END) as used_codes,
      COUNT(CASE WHEN is_used = false AND expires_at > CURRENT_TIMESTAMP THEN 1 END) as active_codes,
      COUNT(CASE WHEN expires_at < CURRENT_TIMESTAMP THEN 1 END) as expired_codes
    FROM password_reset_codes
  `,

  // Verificar límite de intentos por email (últimas 24 horas)
  checkAttemptLimit: `
    SELECT COUNT(*) as attempts
    FROM password_reset_codes 
    WHERE email = $1 AND created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
  `
};
