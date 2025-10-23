// inventoryQueries.js
// Consultas específicas para inventario migradas a PostgreSQL

export const InventoryQueries = {
  // ==================== INVENTARIO ====================
  
  // Crear nuevo ítem de inventario
  create: `
    INSERT INTO inventario (id, nombre, descripcion, categoria_id, cantidad_stock, cantidad_minima, 
                          precio_estimado, ubicacion_almacen, huerto_id, proveedor_id, imagen_url, usuario_creador)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  `,

  // Obtener ítem por ID
  getById: `
    SELECT i.*, c.nombre as categoria_nombre, p.nombre_empresa as proveedor_nombre, 
           h.nombre as huerto_nombre, u.nombre as usuario_creador_nombre
    FROM inventario i
    LEFT JOIN categorias_productos c ON i.categoria_id = c.id
    LEFT JOIN proveedores p ON i.proveedor_id = p.id
    LEFT JOIN huertos h ON i.huerto_id = h.id
    LEFT JOIN usuarios u ON i.usuario_creador = u.id
    WHERE i.id = $1 AND i.is_deleted = false
  `,

  // Actualizar ítem de inventario
  update: `
    UPDATE inventario 
    SET nombre = $1, descripcion = $2, categoria_id = $3, cantidad_stock = $4, 
        cantidad_minima = $5, precio_estimado = $6, ubicacion_almacen = $7, 
        huerto_id = $8, proveedor_id = $9, imagen_url = $10
    WHERE id = $11 AND is_deleted = false
  `,

  // Actualizar solo el stock
  updateStock: `
    UPDATE inventario 
    SET cantidad_stock = $1 
    WHERE id = $2 AND is_deleted = false
  `,

  // Eliminar ítem (soft delete)
  softDelete: `
    UPDATE inventario 
    SET is_deleted = true 
    WHERE id = $1
  `,

  // Listar inventario con filtros
  listWithFilters: `
    SELECT i.*, c.nombre as categoria_nombre, p.nombre_empresa as proveedor_nombre, 
           h.nombre as huerto_nombre, u.nombre as usuario_creador_nombre
    FROM inventario i
    LEFT JOIN categorias_productos c ON i.categoria_id = c.id
    LEFT JOIN proveedores p ON i.proveedor_id = p.id
    LEFT JOIN huertos h ON i.huerto_id = h.id
    LEFT JOIN usuarios u ON i.usuario_creador = u.id
    WHERE i.is_deleted = false
    AND ($1::uuid IS NULL OR i.categoria_id = $1)
    AND ($2::uuid IS NULL OR i.huerto_id = $2)
    AND ($3::uuid IS NULL OR i.proveedor_id = $3)
    AND ($4::boolean IS NULL OR i.cantidad_stock <= i.cantidad_minima)
    AND ($5::uuid IS NULL OR u.ubicacion_id = $5)
    ORDER BY i.created_at DESC
  `,

  // Obtener ítems con bajo stock
  getLowStockItems: `
    SELECT i.*, c.nombre as categoria_nombre, p.nombre_empresa as proveedor_nombre, 
           h.nombre as huerto_nombre, u.nombre as usuario_creador_nombre
    FROM inventario i
    LEFT JOIN categorias_productos c ON i.categoria_id = c.id
    LEFT JOIN proveedores p ON i.proveedor_id = p.id
    LEFT JOIN huertos h ON i.huerto_id = h.id
    LEFT JOIN usuarios u ON i.usuario_creador = u.id
    WHERE i.is_deleted = false AND i.cantidad_stock <= i.cantidad_minima
    AND ($1::uuid IS NULL OR u.ubicacion_id = $1)
    ORDER BY i.created_at DESC
  `,

  // ==================== VERIFICACIONES ====================
  
  // Verificar que existe una categoría
  checkCategoryExists: `
    SELECT id FROM categorias_productos WHERE id = $1 AND is_deleted = false
  `,

  // Verificar que existe un huerto
  checkGardenExists: `
    SELECT id FROM huertos WHERE id = $1 AND is_deleted = false
  `,

  // Verificar que existe un proveedor
  checkProviderExists: `
    SELECT id FROM proveedores WHERE id = $1 AND is_deleted = false
  `,

  // Verificar que existe un usuario
  checkUserExists: `
    SELECT ubicacion_id FROM usuarios WHERE id = $1 AND is_deleted = false
  `,

  // ==================== PERMISOS DE INVENTARIO ====================
  
  // Verificar permisos de inventario
  checkInventoryPermission: `
    SELECT usuario_creador FROM inventario WHERE id = $1 AND is_deleted = false
  `,

  // Obtener permisos de inventario
  getInventoryPermissions: `
    SELECT ip.*, u.nombre as usuario_nombre, u.email as usuario_email 
    FROM inventario_permisos ip 
    LEFT JOIN usuarios u ON ip.usuario_id = u.id 
    WHERE ip.inventario_id = $1 AND ip.is_deleted = false
    ORDER BY ip.fecha_asignacion DESC
  `,

  // Obtener permisos específicos de usuario
  getUserInventoryPermissions: `
    SELECT ip.*, u.nombre as usuario_nombre, u.email as usuario_email 
    FROM inventario_permisos ip 
    LEFT JOIN usuarios u ON ip.usuario_id = u.id 
    WHERE ip.inventario_id = $1 AND ip.usuario_id = $2 AND ip.is_deleted = false
    ORDER BY ip.fecha_asignacion DESC
  `,

  // Verificar permiso existente
  checkExistingPermission: `
    SELECT id FROM inventario_permisos 
    WHERE inventario_id = $1 AND usuario_id = $2 AND permiso_tipo = $3
  `,

  // Crear permiso de inventario
  createPermission: `
    INSERT INTO inventario_permisos (id, inventario_id, usuario_id, permiso_tipo, asignado_por)
    VALUES ($1, $2, $3, $4, $5)
  `,

  // Reactivar permiso existente
  reactivatePermission: `
    UPDATE inventario_permisos 
    SET is_deleted = false, asignado_por = $1, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $2
  `,

  // Revocar permiso
  revokePermission: `
    UPDATE inventario_permisos 
    SET is_deleted = true 
    WHERE inventario_id = $1 AND usuario_id = $2 AND permiso_tipo = $3 AND is_deleted = false
  `,

  // ==================== COMENTARIOS DE INVENTARIO ====================
  
  // Crear comentario de inventario
  createComment: `
    INSERT INTO comentarios_inventario (id, inventario_id, usuario_id, contenido, tipo_comentario, 
                                      cantidad_usada, unidad_medida)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `,

  // Obtener comentarios de inventario
  getInventoryComments: `
    SELECT ci.*, u.nombre as usuario_nombre, u.rol as usuario_rol, i.nombre as inventario_nombre
    FROM comentarios_inventario ci
    LEFT JOIN usuarios u ON ci.usuario_id = u.id
    LEFT JOIN inventario i ON ci.inventario_id = i.id
    WHERE ci.inventario_id = $1 AND ci.is_deleted = false
    ORDER BY ci.fecha_creacion DESC
  `,

  // Obtener todos los comentarios de inventario (para administradores)
  getAllInventoryComments: `
    SELECT ci.*, u.nombre as usuario_nombre, u.rol as usuario_rol, u.email as usuario_email, 
           i.nombre as inventario_nombre
    FROM comentarios_inventario ci
    LEFT JOIN usuarios u ON ci.usuario_id = u.id
    LEFT JOIN inventario i ON ci.inventario_id = i.id
    LEFT JOIN huertos h ON i.huerto_id = h.id
    WHERE ci.is_deleted = false 
    AND ci.tipo_comentario != 'uso'
    AND ($1::uuid IS NULL OR h.ubicacion_id = $1)
    ORDER BY ci.fecha_creacion DESC
  `,

  // Obtener comentarios del usuario (no automáticos)
  getUserInventoryComments: `
    SELECT ci.*, u.nombre as usuario_nombre, u.rol as usuario_rol, i.nombre as inventario_nombre
    FROM comentarios_inventario ci
    LEFT JOIN usuarios u ON ci.usuario_id = u.id
    LEFT JOIN inventario i ON ci.inventario_id = i.id
    WHERE ci.usuario_id = $1 
    AND ci.is_deleted = false 
    AND ci.tipo_comentario != 'uso'
    ORDER BY ci.fecha_creacion DESC
  `,

  // ==================== PERMISOS DE COMENTARIOS ====================
  
  // Verificar permiso de comentario
  checkCommentPermission: `
    SELECT usuario_id FROM comentarios_inventario WHERE id = $1 AND is_deleted = false
  `,

  // Obtener permisos de comentario
  getCommentPermissions: `
    SELECT cp.*, u.nombre as usuario_nombre, u.email as usuario_email 
    FROM comentario_inventario_permisos cp 
    LEFT JOIN usuarios u ON cp.usuario_id = u.id 
    WHERE cp.comentario_id = $1 AND cp.is_deleted = false
    ORDER BY cp.fecha_asignacion DESC
  `,

  // Verificar permiso específico de comentario
  checkSpecificCommentPermission: `
    SELECT COUNT(*) as has_permission 
    FROM comentario_inventario_permisos 
    WHERE comentario_id = $1 AND usuario_id = $2 AND permiso_tipo = $3 AND is_deleted = false
  `,

  // Crear permiso de comentario
  createCommentPermission: `
    INSERT INTO comentario_inventario_permisos (id, comentario_id, usuario_id, permiso_tipo, asignado_por)
    VALUES ($1, $2, $3, $4, $5)
  `,

  // Revocar permiso de comentario
  revokeCommentPermission: `
    UPDATE comentario_inventario_permisos 
    SET is_deleted = true 
    WHERE comentario_id = $1 AND usuario_id = $2 AND permiso_tipo = $3 AND is_deleted = false
  `,

  // ==================== USUARIOS ====================
  
  // Obtener todos los usuarios (filtrados por ubicación)
  getAllUsers: `
    SELECT u.id, u.nombre, u.email, u.rol 
    FROM usuarios u
    WHERE u.is_deleted = false
    AND ($1::uuid IS NULL OR u.ubicacion_id = $1)
    ORDER BY u.nombre ASC
  `,

  // Verificar que existe un usuario específico
  checkSpecificUserExists: `
    SELECT id, nombre FROM usuarios WHERE id = $1 AND is_deleted = false
  `,

  // Verificar si un usuario tiene permiso específico para editar/eliminar un comentario
  checkCommentEditPermission: `
    SELECT COUNT(*) as has_permission 
    FROM comentario_inventario_permisos 
    WHERE comentario_id = $1 AND usuario_id = $2 AND permiso_tipo = $3 AND is_deleted = false
  `,

  // Obtener información básica de usuario para permisos
  getUserBasicInfo: `
    SELECT id, nombre, email 
    FROM usuarios 
    WHERE id = $1 AND is_deleted = false
  `,

  // Obtener ubicación del usuario
  getUserLocation: `
    SELECT ubicacion_id 
    FROM usuarios 
    WHERE id = $1 AND is_deleted = false
  `
};
