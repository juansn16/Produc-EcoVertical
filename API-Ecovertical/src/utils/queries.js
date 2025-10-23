// queries.js
// Consultas para la API de Gestión de Huertos Verticales

// queries.js
// Consultas para la API de Gestión de Huertos Verticales - MIGRADAS A POSTGRESQL

/* --- UBICACIONES -------------------------------------------------------- */
export const UbicacionQueries = {
  getAll: `SELECT * FROM ubicaciones WHERE is_deleted = false`,
  getById: `SELECT * FROM ubicaciones WHERE id = $1 AND is_deleted = false`,
  getByAddress: `
    SELECT * FROM ubicaciones 
    WHERE calle = $1 AND ciudad = $2 AND COALESCE(estado,'') = COALESCE($3, '') AND COALESCE(pais,'') = COALESCE($4, '') 
      AND is_deleted = false
    LIMIT 1
  `,
  create: `
    INSERT INTO ubicaciones (id, nombre, calle, ciudad, estado, pais, latitud, longitud, descripcion)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `,
  update: `
    UPDATE ubicaciones 
    SET nombre = $1, calle = $2, ciudad = $3, estado = $4, pais = $5, latitud = $6, longitud = $7, descripcion = $8
    WHERE id = $9 AND is_deleted = false
  `,
  softDelete: `UPDATE ubicaciones SET is_deleted = true WHERE id = $1`,
  getByCiudad: `SELECT * FROM ubicaciones WHERE ciudad = $1 AND is_deleted = false`
};

/* --- USUARIOS ----------------------------------------------------------- */
export const UsuarioQueries = {
  getAll: `SELECT * FROM usuarios WHERE is_deleted = false`,
  getById: `SELECT * FROM usuarios WHERE id = $1 AND is_deleted = false`,
  getByEmail: `SELECT * FROM usuarios WHERE email = $1 AND is_deleted = false`,
  getByCedula: `SELECT * FROM usuarios WHERE cedula = $1 AND is_deleted = false`,
  create: `
    INSERT INTO usuarios (id, nombre, cedula, telefono, preferencias_cultivo, rol, ubicacion_id, email, password)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `,
  update: `
    UPDATE usuarios 
    SET nombre = $1, cedula = $2, telefono = $3, preferencias_cultivo = $4, rol = $5, ubicacion_id = $6, email = $7
    WHERE id = $8 AND is_deleted = false
  `,
  updatePassword: `UPDATE usuarios SET password = $1 WHERE id = $2 AND is_deleted = false`,
  softDelete: `UPDATE usuarios SET is_deleted = true WHERE id = $1`,
  getByRol: `SELECT * FROM usuarios WHERE rol = $1 AND is_deleted = false`,
  getByUbicacion: `SELECT * FROM usuarios WHERE ubicacion_id = $1 AND is_deleted = false`
};

/* --- HUERTOS ------------------------------------------------------------ */
export const HuertoQueries = {
  getAll: `SELECT * FROM huertos WHERE is_deleted = false`,
  getById: `SELECT * FROM huertos WHERE id = $1 AND is_deleted = false`,
  create: `
    INSERT INTO huertos (id, nombre, descripcion, tipo, superficie, capacidad, ubicacion_id, usuario_creador, imagen_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `,
  update: `
    UPDATE huertos 
    SET nombre = $1, descripcion = $2, tipo = $3, superficie = $4, capacidad = $5, ubicacion_id = $6, imagen_url = $7
    WHERE id = $8 AND is_deleted = false
  `,
  softDelete: `UPDATE huertos SET is_deleted = true WHERE id = $1`,
  getByUbicacion: `SELECT * FROM huertos WHERE ubicacion_id = $1 AND is_deleted = false`,
  getByTipo: `SELECT * FROM huertos WHERE tipo = $1 AND is_deleted = false`,
  getByUsuarioCreador: `SELECT * FROM huertos WHERE usuario_creador = $1 AND is_deleted = false`
};

/* --- USUARIO_HUERTO (Relación) ------------------------------------------ */
export const UsuarioHuertoQueries = {
  getAll: `SELECT * FROM usuario_huerto WHERE is_deleted = false`,
  getById: `SELECT * FROM usuario_huerto WHERE id = $1 AND is_deleted = false`,
  create: `
    INSERT INTO usuario_huerto (id, usuario_id, huerto_id, rol)
    VALUES ($1, $2, $3, $4)
  `,
  update: `UPDATE usuario_huerto SET rol = $1 WHERE id = $2 AND is_deleted = false`,
  softDelete: `UPDATE usuario_huerto SET is_deleted = true WHERE id = $1`,
  getByUsuario: `SELECT * FROM usuario_huerto WHERE usuario_id = $1 AND is_deleted = false`,
  getByHuerto: `SELECT * FROM usuario_huerto WHERE huerto_id = $1 AND is_deleted = false`,
  getUsuarioHuerto: `SELECT * FROM usuario_huerto WHERE usuario_id = $1 AND huerto_id = $2 AND is_deleted = false`
};

/* --- HUERTO_DATA (Datos de huerto) -------------------------------------- */
export const HuertoDataQueries = {
  getAll: `SELECT * FROM huerto_data WHERE is_deleted = false`,
  getById: `SELECT * FROM huerto_data WHERE id = $1 AND is_deleted = false`,
  create: `
    INSERT INTO huerto_data (id, huerto_id, fecha, cantidad_agua, cantidad_siembra, cantidad_cosecha, 
                            fecha_inicio, fecha_final, total_dias, cantidad_abono, cantidad_plagas, usuario_registro)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  `,
  update: `
    UPDATE huerto_data 
    SET fecha = $1, cantidad_agua = $2, cantidad_siembra = $3, cantidad_cosecha = $4, 
        fecha_inicio = $5, fecha_final = $6, total_dias = $7, cantidad_abono = $8, cantidad_plagas = $9
    WHERE id = $10 AND is_deleted = false
  `,
  softDelete: `UPDATE huerto_data SET is_deleted = true WHERE id = $1`,
  getByHuerto: `SELECT * FROM huerto_data WHERE huerto_id = $1 AND is_deleted = false`,
  getByUsuario: `SELECT * FROM huerto_data WHERE usuario_registro = $1 AND is_deleted = false`,
  getByFecha: `SELECT * FROM huerto_data WHERE fecha = $1 AND is_deleted = false`
};

/* --- PROVEEDORES -------------------------------------------------------- */
export const ProveedorQueries = {
  getAll: `
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
    GROUP BY p.id
  `,
  getById: `
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
    WHERE p.id = $1 AND p.is_deleted = false
    GROUP BY p.id
  `,
  create: `
    INSERT INTO proveedores (id, nombre_empresa, contacto_principal, telefono, email, ubicacion_id, descripcion)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `,
  update: `
    UPDATE proveedores 
    SET nombre_empresa = $1, contacto_principal = $2, telefono = $3, email = $4, ubicacion_id = $5, descripcion = $6
    WHERE id = $7 AND is_deleted = false
  `,
  softDelete: `UPDATE proveedores SET is_deleted = true WHERE id = $1`,
  
  // Nuevas consultas para categorías
  createCategoria: `
    INSERT INTO proveedor_categorias (id, proveedor_id, categoria_id)
    VALUES ($1, $2, $3)
  `,
  deleteCategorias: `
    UPDATE proveedor_categorias 
    SET is_deleted = true 
    WHERE proveedor_id = $1
  `,
  getCategoriasByProveedor: `
    SELECT c.id, c.nombre, c.descripcion
    FROM categorias c
    JOIN proveedor_categorias pc ON c.id = pc.categoria_id
    WHERE pc.proveedor_id = $1 AND pc.is_deleted = false AND c.is_deleted = false
  `,
  
  // Consultas para categorías
  getAllCategorias: `
    SELECT * FROM categorias_productos WHERE is_deleted = false ORDER BY nombre ASC
  `,
  getCategoriaById: `
    SELECT * FROM categorias_productos WHERE id = $1 AND is_deleted = false
  `,
  createEspecialidad: `
    INSERT INTO proveedor_especialidades (id, proveedor_id, especialidad)
    VALUES ($1, $2, $3)
  `,
  deleteEspecialidades: `
    UPDATE proveedor_especialidades 
    SET is_deleted = true 
    WHERE proveedor_id = $1
  `,
  getEspecialidadesByProveedor: `
    SELECT especialidad 
    FROM proveedor_especialidades 
    WHERE proveedor_id = $1 AND is_deleted = false
  `
};

/* --- CATEGORIAS_PRODUCTOS ----------------------------------------------- */
export const CategoriaProductoQueries = {
  getAll: `SELECT * FROM categorias_productos WHERE is_deleted = false`,
  getById: `SELECT * FROM categorias_productos WHERE id = $1 AND is_deleted = false`,
  create: `
    INSERT INTO categorias_productos (id, nombre, descripcion)
    VALUES ($1, $2, $3)
  `,
  update: `UPDATE categorias_productos SET nombre = $1, descripcion = $2 WHERE id = $3 AND is_deleted = false`,
  softDelete: `UPDATE categorias_productos SET is_deleted = true WHERE id = $1`
};

/* --- PRODUCTOS_PROVEEDORES ---------------------------------------------- */
export const ProductoProveedorQueries = {
  getAll: `SELECT * FROM productos_proveedores WHERE is_deleted = false`,
  getById: `SELECT * FROM productos_proveedores WHERE id = $1 AND is_deleted = false`,
  create: `
    INSERT INTO productos_proveedores (id, nombre, descripcion, categoria_id, proveedor_id, precio, unidad_medida, etiquetas)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `,
  update: `
    UPDATE productos_proveedores 
    SET nombre = $1, descripcion = $2, categoria_id = $3, proveedor_id = $4, precio = $5, unidad_medida = $6, etiquetas = $7
    WHERE id = $8 AND is_deleted = false
  `,
  softDelete: `UPDATE productos_proveedores SET is_deleted = true WHERE id = $1`,
  getByCategoria: `SELECT * FROM productos_proveedores WHERE categoria_id = $1 AND is_deleted = false`,
  getByProveedor: `SELECT * FROM productos_proveedores WHERE proveedor_id = $1 AND is_deleted = false`,
  getByPrecioRange: `SELECT * FROM productos_proveedores WHERE precio BETWEEN $1 AND $2 AND is_deleted = false`
};

/* --- INVENTARIO --------------------------------------------------------- */
export const InventarioQueries = {
  getAll: `SELECT * FROM inventario WHERE is_deleted = false`,
  getById: `SELECT * FROM inventario WHERE id = $1 AND is_deleted = false`,
  create: `
    INSERT INTO inventario (id, nombre, descripcion, categoria_id, cantidad_stock, cantidad_minima, precio_estimado, ubicacion_almacen, huerto_id, proveedor_id, imagen_url, usuario_creador)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  `,
  update: `
    UPDATE inventario 
    SET nombre = $1, descripcion = $2, categoria_id = $3, cantidad_stock = $4, cantidad_minima = $5, 
        precio_estimado = $6, ubicacion_almacen = $7, huerto_id = $8, proveedor_id = $9, imagen_url = $10
    WHERE id = $11 AND is_deleted = false
  `,
  softDelete: `UPDATE inventario SET is_deleted = true WHERE id = $1`,
  getByHuerto: `SELECT * FROM inventario WHERE huerto_id = $1 AND is_deleted = false`,
  getByCategoria: `SELECT * FROM inventario WHERE categoria_id = $1 AND is_deleted = false`,
  getStockBajo: `SELECT * FROM inventario WHERE cantidad_stock <= cantidad_minima AND is_deleted = false`,
  updateStock: `UPDATE inventario SET cantidad_stock = $1 WHERE id = $2 AND is_deleted = false`
};


/* --- ALERTAS ------------------------------------------------------------ */
// Las queries de alertas han sido movidas a utils/queries/alertQueries.js
// para mejor organización y migración a PostgreSQL

/* --- ALERTA_DESTINATARIOS ----------------------------------------------- */
export const AlertaDestinatarioQueries = {
  getAll: `SELECT * FROM alerta_destinatarios WHERE is_deleted = false`,
  getById: `SELECT * FROM alerta_destinatarios WHERE id = $1 AND is_deleted = false`,
  create: `
    INSERT INTO alerta_destinatarios (id, alerta_id, usuario_id)
    VALUES ($1, $2, $3)
  `,
  softDelete: `UPDATE alerta_destinatarios SET is_deleted = true WHERE id = $1`,
  getByAlerta: `SELECT * FROM alerta_destinatarios WHERE alerta_id = $1 AND is_deleted = false`,
  getByUsuario: `SELECT * FROM alerta_destinatarios WHERE usuario_id = $1 AND is_deleted = false`,
  marcarLeida: `UPDATE alerta_destinatarios SET leida = true, fecha_leida = CURRENT_TIMESTAMP WHERE id = $1 AND is_deleted = false`,
  getNoLeidasByUsuario: `SELECT * FROM alerta_destinatarios WHERE usuario_id = $1 AND leida = false AND is_deleted = false`
};

/* --- COMENTARIOS -------------------------------------------------------- */
export const ComentarioQueries = {
  getAll: `SELECT * FROM comentarios WHERE is_deleted = false`,
  getById: `SELECT * FROM comentarios WHERE id = $1 AND is_deleted = false`,
  create: `
    INSERT INTO comentarios (id, titulo, contenido, tipo, usuario_id, huerto_id, etiquetas)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `,
  update: `
    UPDATE comentarios 
    SET titulo = $1, contenido = $2, tipo = $3, huerto_id = $4, etiquetas = $5
    WHERE id = $6 AND is_deleted = false
  `,
  softDelete: `UPDATE comentarios SET is_deleted = true WHERE id = $1`,
  getByUsuario: `SELECT * FROM comentarios WHERE usuario_id = $1 AND is_deleted = false`,
  getByHuerto: `SELECT * FROM comentarios WHERE huerto_id = $1 AND is_deleted = false`,
  getByTipo: `SELECT * FROM comentarios WHERE tipo = $1 AND is_deleted = false`
};

    /* --- COMENTARIOS DE INVENTARIO ------------------------------------------ */
    export const ComentarioInventarioQueries = {
      getAll: `SELECT * FROM comentarios_inventario WHERE is_deleted = false`,
      getById: `SELECT * FROM comentarios_inventario WHERE id = $1 AND is_deleted = false`,
      create: `
        INSERT INTO comentarios_inventario (id, inventario_id, usuario_id, contenido, tipo_comentario, cantidad_usada, unidad_medida)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      update: `
        UPDATE comentarios_inventario 
        SET contenido = $1, tipo_comentario = $2, cantidad_usada = $3, unidad_medida = $4
        WHERE id = $5 AND is_deleted = false
      `,
      softDelete: `UPDATE comentarios_inventario SET is_deleted = true WHERE id = $1`,
      getByUsuario: `SELECT * FROM comentarios_inventario WHERE usuario_id = $1 AND is_deleted = false`,
      getByInventario: `SELECT * FROM comentarios_inventario WHERE inventario_id = $1 AND is_deleted = false`,
      getByTipo: `SELECT * FROM comentarios_inventario WHERE tipo_comentario = $1 AND is_deleted = false`,
      getByInventarioWithUser: `
        SELECT ci.*, u.nombre as usuario_nombre, u.rol as usuario_rol
        FROM comentarios_inventario ci
        LEFT JOIN usuarios u ON ci.usuario_id = u.id
        WHERE ci.inventario_id = $1 AND ci.is_deleted = false
        ORDER BY ci.fecha_creacion DESC
      `
    };

    /* --- PERMISOS DE INVENTARIO --------------------------------------------- */
    export const InventarioPermisosQueries = {
      create: `
        INSERT INTO inventario_permisos (id, inventario_id, usuario_id, permiso_tipo, asignado_por)
        VALUES ($1, $2, $3, $4, $5)
      `,
      getByInventario: `
        SELECT ip.*, u.nombre as usuario_nombre, u.email as usuario_email
        FROM inventario_permisos ip
        LEFT JOIN usuarios u ON ip.usuario_id = u.id
        WHERE ip.inventario_id = $1 AND ip.is_deleted = false
        ORDER BY ip.fecha_asignacion DESC
      `,
      getByUsuario: `
        SELECT ip.*, i.nombre as inventario_nombre
        FROM inventario_permisos ip
        LEFT JOIN inventario i ON ip.inventario_id = i.id
        WHERE ip.usuario_id = $1 AND ip.is_deleted = false
        ORDER BY ip.fecha_asignacion DESC
      `,
      getByInventarioAndUsuario: `
        SELECT * FROM inventario_permisos 
        WHERE inventario_id = $1 AND usuario_id = $2 AND is_deleted = false
      `,
      getByInventarioUsuarioAndTipo: `
        SELECT * FROM inventario_permisos 
        WHERE inventario_id = $1 AND usuario_id = $2 AND permiso_tipo = $3 AND is_deleted = false
      `,
      update: `
        UPDATE inventario_permisos 
        SET permiso_tipo = $1, asignado_por = $2
        WHERE id = $3 AND is_deleted = false
      `,
      softDelete: `UPDATE inventario_permisos SET is_deleted = true WHERE id = $1`,
      deleteByInventarioAndUsuario: `
        UPDATE inventario_permisos 
        SET is_deleted = true 
        WHERE inventario_id = $1 AND usuario_id = $2 AND is_deleted = false
      `,
      checkPermission: `
        SELECT COUNT(*) as has_permission FROM inventario_permisos 
        WHERE inventario_id = $1 AND usuario_id = $2 AND permiso_tipo = $3 AND is_deleted = false
      `,
      checkOwnerOrPermission: `
        SELECT 
          CASE 
            WHEN i.usuario_creador = $1 THEN 1
            WHEN ip.id IS NOT NULL THEN 1
            ELSE 0
          END as has_permission
        FROM inventario i
        LEFT JOIN inventario_permisos ip ON i.id = ip.inventario_id 
          AND ip.usuario_id = $2 
          AND ip.permiso_tipo = $3 
          AND ip.is_deleted = false
        WHERE i.id = $4 AND i.is_deleted = false
      `
    };

/* --- AUTH_TOKENS -------------------------------------------------------- */
export const AuthTokenQueries = {
  create: `
    INSERT INTO auth_tokens (id, usuario_id, refresh_token, expiracion)
    VALUES ($1, $2, $3, $4)
  `,
  getByToken: `SELECT * FROM auth_tokens WHERE refresh_token = $1 AND is_deleted = false`,
  getByUsuario: `SELECT * FROM auth_tokens WHERE usuario_id = $1 AND is_deleted = false`,
  deleteToken: `UPDATE auth_tokens SET is_deleted = true WHERE refresh_token = $1`,
  deleteAllForUser: `UPDATE auth_tokens SET is_deleted = true WHERE usuario_id = $1`,
  deleteExpired: `UPDATE auth_tokens SET is_deleted = true WHERE expiracion < CURRENT_TIMESTAMP`,
  deleteByUserId: `UPDATE auth_tokens SET is_deleted = true WHERE usuario_id = $1`
};