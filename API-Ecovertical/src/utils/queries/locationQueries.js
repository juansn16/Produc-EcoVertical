// ==================== UBICACIONES ====================

export const LocationQueries = {
  // ==================== CRUD BÁSICO ====================

  // Obtener todas las ubicaciones
  getAll: `
    SELECT * FROM ubicaciones WHERE is_deleted = false ORDER BY nombre ASC
  `,

  // Obtener ubicación por ID
  getById: `
    SELECT * FROM ubicaciones WHERE id = $1 AND is_deleted = false
  `,

  // Crear nueva ubicación
  create: `
    INSERT INTO ubicaciones (id, nombre, calle, ciudad, estado, pais, latitud, longitud, descripcion)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `,

  // Soft delete de ubicación
  softDelete: `
    UPDATE ubicaciones SET is_deleted = true WHERE id = $1
  `,

  // ==================== BÚSQUEDAS ====================

  // Buscar ubicación por dirección
  getByAddress: `
    SELECT * FROM ubicaciones 
    WHERE calle = $1 AND ciudad = $2 AND estado = $3 AND pais = $4 AND is_deleted = false
  `,

  // Buscar ubicaciones por ciudad
  getByCiudad: `
    SELECT * FROM ubicaciones 
    WHERE ciudad ILIKE $1 AND is_deleted = false 
    ORDER BY nombre ASC
  `,

  // ==================== VERIFICACIONES ====================

  // Verificar si hay huertos usando esta ubicación
  checkGardenUsage: `
    SELECT COUNT(*) as count FROM huertos 
    WHERE ubicacion_id = $1 AND is_deleted = false
  `,

  // ==================== ACTUALIZACIÓN DINÁMICA ====================

  // Construir query de actualización dinámicamente
  buildUpdateQuery: (fields) => {
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    return `
      UPDATE ubicaciones 
      SET ${setClause}
      WHERE id = $${fields.length + 1} AND is_deleted = false
    `;
  }
};
