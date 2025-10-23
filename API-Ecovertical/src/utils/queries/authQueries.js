// authQueries.js
// Consultas específicas para autenticación migradas a PostgreSQL

export const AuthQueries = {
  // Obtener usuario por email
  getByEmail: `
    SELECT * FROM usuarios 
    WHERE email = $1 AND is_deleted = false
  `,

  // Obtener usuario por cédula
  getByCedula: `
    SELECT * FROM usuarios 
    WHERE cedula = $1 AND is_deleted = false
  `,

  // Obtener usuario por ID
  getById: `
    SELECT * FROM usuarios 
    WHERE id = $1 AND is_deleted = false
  `,

  // Crear nuevo usuario
  create: `
    INSERT INTO usuarios (id, nombre, cedula, telefono, preferencias_cultivo, rol, ubicacion_id, email, password, es_administrador_original, codigo_invitacion_usado)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  `,

  // Actualizar contraseña
  updatePassword: `
    UPDATE usuarios 
    SET password = $1 
    WHERE id = $2 AND is_deleted = false
  `,

  // Actualizar usuario
  update: `
    UPDATE usuarios 
    SET nombre = $1, cedula = $2, telefono = $3, preferencias_cultivo = $4, rol = $5, ubicacion_id = $6, email = $7
    WHERE id = $8 AND is_deleted = false
  `,

  // Soft delete usuario
  softDelete: `
    UPDATE usuarios 
    SET is_deleted = true 
    WHERE id = $1
  `,

  // Obtener usuarios por rol
  getByRole: `
    SELECT * FROM usuarios 
    WHERE rol = $1 AND is_deleted = false
  `,

  // Obtener usuarios por ubicación
  getByLocation: `
    SELECT * FROM usuarios 
    WHERE ubicacion_id = $1 AND is_deleted = false
  `
};
