// userQueries.js
// Queries específicas para gestión de usuarios

export const UserQueries = {
  // ==================== PERFIL DE USUARIO ====================

  // Obtener perfil del usuario actual
  getMyProfile: `
    SELECT id, nombre, email, rol, telefono, ubicacion_id, imagen_url 
    FROM usuarios 
    WHERE id = $1 AND is_deleted = false
  `,

  // Verificar si el email ya existe para otro usuario
  checkEmailExists: `
    SELECT id FROM usuarios 
    WHERE email = $1 AND id <> $2 AND is_deleted = false
  `,

  // Actualizar perfil del usuario
  updateMyProfile: `
    UPDATE usuarios 
    SET nombre = COALESCE($1, nombre), 
        email = COALESCE($2, email), 
        telefono = COALESCE($3, telefono), 
        imagen_url = COALESCE($4, imagen_url) 
    WHERE id = $5 AND is_deleted = false
  `,

  // Obtener usuario actualizado después de actualizar perfil
  getUpdatedProfile: `
    SELECT id, nombre, email, rol, telefono, ubicacion_id, imagen_url 
    FROM usuarios 
    WHERE id = $1 AND is_deleted = false
  `,

  // Obtener contraseña del usuario para verificación
  getUserPassword: `
    SELECT password FROM usuarios 
    WHERE id = $1 AND is_deleted = false
  `,

  // Actualizar contraseña del usuario
  updatePassword: `
    UPDATE usuarios 
    SET password = $1 
    WHERE id = $2 AND is_deleted = false
  `,

  // ==================== GESTIÓN DE USUARIOS ====================

  // Obtener todos los usuarios con búsqueda
  getUsers: `
    SELECT id, nombre, email, rol, status, imagen_url 
    FROM usuarios
    WHERE ($1 = '' OR nombre ILIKE $2 OR email ILIKE $2)
      AND is_deleted = false
    ORDER BY nombre ASC
  `,

  // Obtener usuario por ID
  getUserById: `
    SELECT id, nombre, email, rol, status, imagen_url 
    FROM usuarios 
    WHERE id = $1 AND is_deleted = false
  `,

  // Verificar si existe un usuario por ID
  checkUserExists: `
    SELECT id FROM usuarios WHERE id = $1 AND is_deleted = false
  `,

  // Verificar si el email existe para otro usuario (para actualización)
  checkEmailExistsForUpdate: `
    SELECT id FROM usuarios 
    WHERE email = $1 AND id <> $2 AND is_deleted = false
  `,

  // Actualizar usuario por ID
  updateUserById: `
    UPDATE usuarios 
    SET nombre = COALESCE($1, nombre), 
        email = COALESCE($2, email), 
        rol = COALESCE($3, rol), 
        status = COALESCE($4, status) 
    WHERE id = $5 AND is_deleted = false
  `,

  // Obtener usuario actualizado después de actualizar por ID
  getUpdatedUserById: `
    SELECT id, nombre, email, rol, status, imagen_url 
    FROM usuarios 
    WHERE id = $1 AND is_deleted = false
  `,

  // Eliminar usuario por ID (soft delete)
  deleteUserById: `
    UPDATE usuarios 
    SET is_deleted = true 
    WHERE id = $1 AND is_deleted = false
  `,

  // ==================== USUARIOS DEL CONDOMINIO ====================

  // Obtener ubicación del administrador
  getAdminLocation: `
    SELECT ubicacion_id FROM usuarios 
    WHERE id = $1 AND is_deleted = false
  `,

  // Obtener usuarios del mismo condominio con búsqueda
  getCondominiumUsers: `
    SELECT u.id, u.nombre, u.cedula, u.telefono, u.email, u.rol, u.created_at
    FROM usuarios u 
    WHERE u.ubicacion_id = $1 AND u.is_deleted = false
      AND ($2 = '' OR u.nombre ILIKE $3 OR u.email ILIKE $3 OR u.cedula ILIKE $3)
    ORDER BY u.nombre ASC
  `,

  // ==================== GESTIÓN DE ROLES ====================

  // Actualizar rol del usuario a técnico
  assignTechnicianRole: `
    UPDATE usuarios 
    SET rol = 'tecnico' 
    WHERE id = $1 AND is_deleted = false
  `,

  // Actualizar rol del usuario a residente
  removeTechnicianRole: `
    UPDATE usuarios 
    SET rol = 'residente' 
    WHERE id = $1 AND is_deleted = false
  `,

  // Obtener usuario actualizado después de cambiar rol
  getUpdatedUserRole: `
    SELECT id, nombre, email, rol 
    FROM usuarios 
    WHERE id = $1 AND is_deleted = false
  `,

  // ==================== FUNCIONES AUXILIARES ====================

  // Construir query de búsqueda dinámica
  buildSearchQuery: (searchTerm) => {
    if (!searchTerm) return '';
    const searchPattern = `%${searchTerm}%`;
    return ` AND (nombre ILIKE '${searchPattern}' OR email ILIKE '${searchPattern}')`;
  },

  // Construir query de búsqueda para condominio
  buildCondominiumSearchQuery: (searchTerm) => {
    if (!searchTerm) return '';
    const searchPattern = `%${searchTerm}%`;
    return ` AND (u.nombre ILIKE '${searchPattern}' OR u.email ILIKE '${searchPattern}' OR u.cedula ILIKE '${searchPattern}')`;
  }
};
