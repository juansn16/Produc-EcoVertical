// categoryQueries.js
// Consultas específicas para categorías migradas a PostgreSQL

export const CategoryQueries = {
  // ==================== CATEGORÍAS DE PRODUCTOS ====================
  
  // Obtener todas las categorías de productos
  getAllProductCategories: `
    SELECT * FROM categorias_productos 
    WHERE is_deleted = false 
    ORDER BY nombre ASC
  `,

  // Obtener categoría de productos por ID
  getProductCategoryById: `
    SELECT * FROM categorias_productos 
    WHERE id = $1 AND is_deleted = false
  `,

  // Crear nueva categoría de productos
  createProductCategory: `
    INSERT INTO categorias_productos (id, nombre, descripcion)
    VALUES ($1, $2, $3)
  `,

  // Actualizar categoría de productos
  updateProductCategory: `
    UPDATE categorias_productos 
    SET nombre = $1, descripcion = $2
    WHERE id = $3 AND is_deleted = false
  `,

  // Eliminar categoría de productos (soft delete)
  deleteProductCategory: `
    UPDATE categorias_productos 
    SET is_deleted = true
    WHERE id = $1
  `,

  // Buscar categorías de productos por nombre
  searchProductCategoriesByName: `
    SELECT * FROM categorias_productos 
    WHERE nombre ILIKE $1 AND is_deleted = false
    ORDER BY nombre ASC
  `,

  // Contar categorías de productos
  countProductCategories: `
    SELECT COUNT(*) as total
    FROM categorias_productos 
    WHERE is_deleted = false
  `,

  // ==================== CATEGORÍAS DE ALERTAS ====================
  
  // Obtener todas las categorías de alertas
  getAllAlertCategories: `
    SELECT * FROM categorias_alertas 
    WHERE is_deleted = false 
    ORDER BY nombre ASC
  `,

  // Obtener categoría de alertas por ID
  getAlertCategoryById: `
    SELECT * FROM categorias_alertas 
    WHERE id = $1 AND is_deleted = false
  `,

  // Crear nueva categoría de alertas
  createAlertCategory: `
    INSERT INTO categorias_alertas (id, nombre, descripcion, color)
    VALUES ($1, $2, $3, $4)
  `,

  // Actualizar categoría de alertas
  updateAlertCategory: `
    UPDATE categorias_alertas 
    SET nombre = $1, descripcion = $2, color = $3
    WHERE id = $4 AND is_deleted = false
  `,

  // Eliminar categoría de alertas (soft delete)
  deleteAlertCategory: `
    UPDATE categorias_alertas 
    SET is_deleted = true
    WHERE id = $1
  `,

  // Buscar categorías de alertas por nombre
  searchAlertCategoriesByName: `
    SELECT * FROM categorias_alertas 
    WHERE nombre ILIKE $1 AND is_deleted = false
    ORDER BY nombre ASC
  `,

  // Contar categorías de alertas
  countAlertCategories: `
    SELECT COUNT(*) as total
    FROM categorias_alertas 
    WHERE is_deleted = false
  `,

  // ==================== QUERIES GENERALES ====================
  
  // Obtener todas las categorías (productos y alertas)
  getAllCategories: `
    SELECT 
      'producto' as tipo,
      id,
      nombre,
      descripcion,
      NULL as color,
      created_at
    FROM categorias_productos 
    WHERE is_deleted = false
    
    UNION ALL
    
    SELECT 
      'alerta' as tipo,
      id,
      nombre,
      descripcion,
      color,
      created_at
    FROM categorias_alertas 
    WHERE is_deleted = false
    
    ORDER BY tipo, nombre ASC
  `,

  // Obtener estadísticas de categorías
  getCategoryStats: `
    SELECT 
      (SELECT COUNT(*) FROM categorias_productos WHERE is_deleted = false) as total_product_categories,
      (SELECT COUNT(*) FROM categorias_alertas WHERE is_deleted = false) as total_alert_categories,
      (SELECT COUNT(*) FROM categorias_productos WHERE is_deleted = false) + 
      (SELECT COUNT(*) FROM categorias_alertas WHERE is_deleted = false) as total_categories
  `,

  // Verificar si una categoría de productos está en uso
  checkProductCategoryInUse: `
    SELECT COUNT(*) as in_use
    FROM inventario 
    WHERE categoria_id = $1 AND is_deleted = false
  `,

  // Verificar si una categoría de alertas está en uso
  checkAlertCategoryInUse: `
    SELECT COUNT(*) as in_use
    FROM alertas 
    WHERE tipo = (
      SELECT nombre FROM categorias_alertas WHERE id = $1
    ) AND is_deleted = false
  `,

  // Obtener categorías más utilizadas (productos)
  getMostUsedProductCategories: `
    SELECT 
      cp.id,
      cp.nombre,
      cp.descripcion,
      COUNT(i.id) as usage_count
    FROM categorias_productos cp
    LEFT JOIN inventario i ON cp.id = i.categoria_id AND i.is_deleted = false
    WHERE cp.is_deleted = false
    GROUP BY cp.id, cp.nombre, cp.descripcion
    ORDER BY usage_count DESC, cp.nombre ASC
    LIMIT $1
  `,

  // Obtener categorías más utilizadas (alertas)
  getMostUsedAlertCategories: `
    SELECT 
      ca.id,
      ca.nombre,
      ca.descripcion,
      ca.color,
      COUNT(a.id) as usage_count
    FROM categorias_alertas ca
    LEFT JOIN alertas a ON ca.nombre = a.tipo AND a.is_deleted = false
    WHERE ca.is_deleted = false
    GROUP BY ca.id, ca.nombre, ca.descripcion, ca.color
    ORDER BY usage_count DESC, ca.nombre ASC
    LIMIT $1
  `
};

