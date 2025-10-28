// authTokenQueries.js
// Queries específicas para tokens de autenticación migradas a PostgreSQL

export const AuthTokenQueries = {
  // Crear nuevo token de autenticación
  create: `
    INSERT INTO auth_tokens (id, usuario_id, refresh_token, expiracion)
    VALUES ($1, $2, $3, $4)
  `,

  // Obtener token por refresh_token
  getByToken: `
    SELECT * FROM auth_tokens 
    WHERE refresh_token = $1 AND is_deleted = false
  `,

  // Obtener tokens por usuario
  getByUsuario: `
    SELECT * FROM auth_tokens 
    WHERE usuario_id = $1 AND is_deleted = false
  `,

  // Eliminar token específico
  deleteToken: `
    UPDATE auth_tokens 
    SET is_deleted = true 
    WHERE refresh_token = $1
  `,

  // Eliminar todos los tokens de un usuario
  deleteAllForUser: `
    UPDATE auth_tokens 
    SET is_deleted = true 
    WHERE usuario_id = $1
  `,

  // Eliminar tokens expirados
  deleteExpired: `
    UPDATE auth_tokens 
    SET is_deleted = true 
    WHERE expiracion < CURRENT_TIMESTAMP
  `,

  // Eliminar tokens por ID de usuario
  deleteByUserId: `
    UPDATE auth_tokens 
    SET is_deleted = true 
    WHERE usuario_id = $1
  `,

  // Verificar si un token existe y no está expirado
  validateToken: `
    SELECT * FROM auth_tokens 
    WHERE refresh_token = $1 
      AND is_deleted = false 
      AND expiracion > CURRENT_TIMESTAMP
  `,

  // Obtener tokens activos de un usuario
  getActiveTokensByUser: `
    SELECT * FROM auth_tokens 
    WHERE usuario_id = $1 
      AND is_deleted = false 
      AND expiracion > CURRENT_TIMESTAMP
    ORDER BY created_at DESC
  `
};

