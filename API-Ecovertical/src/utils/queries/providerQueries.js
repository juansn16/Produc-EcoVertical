// ==================== PROVEEDORES ====================

export const ProviderQueries = {
  // ==================== CRUD BÁSICO ====================

  // Obtener todos los proveedores con información de ubicación y categorías
  getAllProviders: `
    SELECT 
      p.*, 
      u.ciudad, 
      u.estado, 
      u.calle, 
      u.pais,
      u.descripcion as ubicacion_descripcion,
      STRING_AGG(c.nombre, ',') as categorias
    FROM proveedores p 
    LEFT JOIN ubicaciones u ON p.ubicacion_id = u.id 
    LEFT JOIN proveedor_categorias pc ON p.id = pc.proveedor_id AND pc.is_deleted = false
    LEFT JOIN categorias c ON pc.categoria_id = c.id AND c.is_deleted = false
    WHERE p.is_deleted = false
    GROUP BY p.id, u.ciudad, u.estado, u.calle, u.pais, u.descripcion
    ORDER BY p.nombre_empresa ASC
  `,

  // Obtener proveedores filtrados por categoría específica
  getProvidersByCategory: `
    SELECT 
      p.*, 
      u.ciudad, 
      u.estado, 
      u.calle, 
      u.pais,
      u.descripcion as ubicacion_descripcion,
      STRING_AGG(c.nombre, ',') as categorias
    FROM proveedores p 
    LEFT JOIN ubicaciones u ON p.ubicacion_id = u.id 
    LEFT JOIN proveedor_categorias pc ON p.id = pc.proveedor_id AND pc.is_deleted = false
    LEFT JOIN categorias c ON pc.categoria_id = c.id AND c.is_deleted = false
    WHERE p.is_deleted = false AND c.nombre = $1
    GROUP BY p.id, u.ciudad, u.estado, u.calle, u.pais, u.descripcion
    ORDER BY p.nombre_empresa ASC
  `,

  // Obtener proveedores por categoría de producto específica
  getProvidersByProductCategory: `
    SELECT DISTINCT
      p.*, 
      u.ciudad, 
      u.estado, 
      u.calle, 
      u.pais,
      u.descripcion as ubicacion_descripcion,
      c.nombre as categoria_nombre
    FROM proveedores p 
    LEFT JOIN ubicaciones u ON p.ubicacion_id = u.id 
    INNER JOIN productos_proveedores pp ON p.id = pp.proveedor_id
    INNER JOIN categorias_productos c ON pp.categoria_id = c.id
    WHERE p.is_deleted = false 
      AND pp.is_deleted = false 
      AND c.is_deleted = false
      AND c.id = $1
    ORDER BY p.nombre_empresa ASC
  `,

  // Obtener proveedor por ID con información completa
  getProviderById: `
    SELECT 
      p.*, 
      u.ciudad, 
      u.estado, 
      u.calle, 
      u.pais,
      u.descripcion as ubicacion_descripcion,
      u.nombre as ubicacion_nombre,
      STRING_AGG(c.nombre, ',') as categorias
    FROM proveedores p 
    LEFT JOIN ubicaciones u ON p.ubicacion_id = u.id 
    LEFT JOIN proveedor_categorias pc ON p.id = pc.proveedor_id AND pc.is_deleted = false
    LEFT JOIN categorias c ON pc.categoria_id = c.id AND c.is_deleted = false
    WHERE p.id = $1 AND p.is_deleted = false
    GROUP BY p.id, u.ciudad, u.estado, u.calle, u.pais, u.descripcion, u.nombre
  `,

  // Crear proveedor
  createProvider: `
    INSERT INTO proveedores (id, nombre_empresa, contacto_principal, telefono, email, ubicacion_id, descripcion)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `,

  // Actualizar proveedor
  updateProvider: `
    UPDATE proveedores 
    SET nombre_empresa = $1, contacto_principal = $2, telefono = $3, email = $4,
        ubicacion_id = $5, descripcion = $6
    WHERE id = $7
  `,

  // Eliminar proveedor (soft delete)
  deleteProvider: `
    UPDATE proveedores 
    SET is_deleted = true 
    WHERE id = $1
  `,

  // ==================== VERIFICACIÓN Y BÚSQUEDA ====================

  // Verificar si el proveedor existe
  checkProviderExists: `
    SELECT id, ubicacion_id FROM proveedores WHERE id = $1 AND is_deleted = false
  `,

  // Buscar proveedores por término
  searchProviders: `
    SELECT 
      p.*, 
      u.ciudad, 
      u.estado, 
      u.calle, 
      u.pais,
      u.descripcion as ubicacion_descripcion
    FROM proveedores p 
    LEFT JOIN ubicaciones u ON p.ubicacion_id = u.id 
    WHERE p.is_deleted = false AND (
      p.nombre_empresa ILIKE $1 OR 
      p.contacto_principal ILIKE $1 OR 
      p.email ILIKE $1 OR 
      p.descripcion ILIKE $1 OR
      u.ciudad ILIKE $1 OR
      u.estado ILIKE $1
    )
    ORDER BY p.nombre_empresa ASC
  `,

  // ==================== CATEGORÍAS DE PROVEEDORES ====================

  // Buscar categoría por nombre
  findCategoryByName: `
    SELECT id FROM categorias WHERE nombre = $1 AND is_deleted = false
  `,

  // Crear nueva categoría
  createCategory: `
    INSERT INTO categorias (id, nombre, descripcion) VALUES ($1, $2, $3)
  `,

  // Crear relación proveedor-categoría
  createProviderCategory: `
    INSERT INTO proveedor_categorias (id, proveedor_id, categoria_id) VALUES ($1, $2, $3)
  `,

  // Eliminar categorías del proveedor (soft delete)
  deleteProviderCategories: `
    UPDATE proveedor_categorias 
    SET is_deleted = true 
    WHERE proveedor_id = $1
  `,

  // Verificar relación proveedor-categoría existente
  checkProviderCategoryRelation: `
    SELECT id, is_deleted FROM proveedor_categorias WHERE proveedor_id = $1 AND categoria_id = $2
  `,

  // Restaurar relación proveedor-categoría eliminada
  restoreProviderCategory: `
    UPDATE proveedor_categorias 
    SET is_deleted = false 
    WHERE id = $1
  `,

  // ==================== UBICACIONES ====================

  // Obtener ubicación recién creada
  getNewLocation: `
    SELECT id FROM ubicaciones WHERE nombre = $1 AND calle = $2 AND ciudad = $3 ORDER BY created_at DESC LIMIT 1
  `,

  // Actualizar ubicación existente
  updateLocation: `
    UPDATE ubicaciones 
    SET ciudad = $1, estado = $2, calle = $3, pais = $4, descripcion = $5
    WHERE id = $6
  `
};
