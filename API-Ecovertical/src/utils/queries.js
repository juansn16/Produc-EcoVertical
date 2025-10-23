// queries.js
// Consultas para la API de Gestión de Huertos Verticales

/* --- UBICACIONES -------------------------------------------------------- */
export const UbicacionQueries = {
  getAll: `SELECT * FROM ubicaciones WHERE is_deleted = 0`,
  getById: `SELECT * FROM ubicaciones WHERE id = ? AND is_deleted = 0`,
  getByAddress: `
    SELECT * FROM ubicaciones 
    WHERE calle = ? AND ciudad = ? AND COALESCE(estado,'') = COALESCE(?, '') AND COALESCE(pais,'') = COALESCE(?, '') 
      AND is_deleted = 0
    LIMIT 1
  `,
  create: `
    INSERT INTO ubicaciones (id, nombre, calle, ciudad, estado, pais, latitud, longitud, descripcion)
    VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  update: `
    UPDATE ubicaciones 
    SET nombre = ?, calle = ?, ciudad = ?, estado = ?, pais = ?, latitud = ?, longitud = ?, descripcion = ?
    WHERE id = ? AND is_deleted = 0
  `,
  softDelete: `UPDATE ubicaciones SET is_deleted = 1 WHERE id = ?`,
  getByCiudad: `SELECT * FROM ubicaciones WHERE ciudad = ? AND is_deleted = 0`
};

/* --- USUARIOS ----------------------------------------------------------- */
export const UsuarioQueries = {
  getAll: `SELECT * FROM usuarios WHERE is_deleted = 0`,
  getById: `SELECT * FROM usuarios WHERE id = ? AND is_deleted = 0`,
  getByEmail: `SELECT * FROM usuarios WHERE email = ? AND is_deleted = 0`,
  getByCedula: `SELECT * FROM usuarios WHERE cedula = ? AND is_deleted = 0`,
  create: `
    INSERT INTO usuarios (id, nombre, cedula, telefono, preferencias_cultivo, rol, ubicacion_id, email, password)
    VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  update: `
    UPDATE usuarios 
    SET nombre = ?, cedula = ?, telefono = ?, preferencias_cultivo = ?, rol = ?, ubicacion_id = ?, email = ?
    WHERE id = ? AND is_deleted = 0
  `,
  updatePassword: `UPDATE usuarios SET password = ? WHERE id = ? AND is_deleted = 0`,
  softDelete: `UPDATE usuarios SET is_deleted = 1 WHERE id = ?`,
  getByRol: `SELECT * FROM usuarios WHERE rol = ? AND is_deleted = 0`,
  getByUbicacion: `SELECT * FROM usuarios WHERE ubicacion_id = ? AND is_deleted = 0`
};

/* --- HUERTOS ------------------------------------------------------------ */
export const HuertoQueries = {
  getAll: `SELECT * FROM huertos WHERE is_deleted = 0`,
  getById: `SELECT * FROM huertos WHERE id = ? AND is_deleted = 0`,
  create: `
    INSERT INTO huertos (id, nombre, descripcion, tipo, superficie, capacidad, ubicacion_id, usuario_creador, imagen_url)
    VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  update: `
    UPDATE huertos 
    SET nombre = ?, descripcion = ?, tipo = ?, superficie = ?, capacidad = ?, ubicacion_id = ?, imagen_url = ?
    WHERE id = ? AND is_deleted = 0
  `,
  softDelete: `UPDATE huertos SET is_deleted = 1 WHERE id = ?`,
  getByUbicacion: `SELECT * FROM huertos WHERE ubicacion_id = ? AND is_deleted = 0`,
  getByTipo: `SELECT * FROM huertos WHERE tipo = ? AND is_deleted = 0`,
  getByUsuarioCreador: `SELECT * FROM huertos WHERE usuario_creador = ? AND is_deleted = 0`
};

/* --- USUARIO_HUERTO (Relación) ------------------------------------------ */
export const UsuarioHuertoQueries = {
  getAll: `SELECT * FROM usuario_huerto WHERE is_deleted = 0`,
  getById: `SELECT * FROM usuario_huerto WHERE id = ? AND is_deleted = 0`,
  create: `
    INSERT INTO usuario_huerto (id, usuario_id, huerto_id, rol)
    VALUES (UUID(), ?, ?, ?)
  `,
  update: `UPDATE usuario_huerto SET rol = ? WHERE id = ? AND is_deleted = 0`,
  softDelete: `UPDATE usuario_huerto SET is_deleted = 1 WHERE id = ?`,
  getByUsuario: `SELECT * FROM usuario_huerto WHERE usuario_id = ? AND is_deleted = 0`,
  getByHuerto: `SELECT * FROM usuario_huerto WHERE huerto_id = ? AND is_deleted = 0`,
  getUsuarioHuerto: `SELECT * FROM usuario_huerto WHERE usuario_id = ? AND huerto_id = ? AND is_deleted = 0`
};

/* --- HUERTO_DATA (Datos de huerto) -------------------------------------- */
export const HuertoDataQueries = {
  getAll: `SELECT * FROM huerto_data WHERE is_deleted = 0`,
  getById: `SELECT * FROM huerto_data WHERE id = ? AND is_deleted = 0`,
  create: `
    INSERT INTO huerto_data (id, huerto_id, fecha, cantidad_agua, cantidad_siembra, cantidad_cosecha, 
                            fecha_inicio, fecha_final, total_dias, cantidad_abono, cantidad_plagas, usuario_registro)
    VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  update: `
    UPDATE huerto_data 
    SET fecha = ?, cantidad_agua = ?, cantidad_siembra = ?, cantidad_cosecha = ?, 
        fecha_inicio = ?, fecha_final = ?, total_dias = ?, cantidad_abono = ?, cantidad_plagas = ?
    WHERE id = ? AND is_deleted = 0
  `,
  softDelete: `UPDATE huerto_data SET is_deleted = 1 WHERE id = ?`,
  getByHuerto: `SELECT * FROM huerto_data WHERE huerto_id = ? AND is_deleted = 0`,
  getByUsuario: `SELECT * FROM huerto_data WHERE usuario_registro = ? AND is_deleted = 0`,
  getByFecha: `SELECT * FROM huerto_data WHERE fecha = ? AND is_deleted = 0`
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
      GROUP_CONCAT(c.nombre SEPARATOR ',') as categorias
    FROM proveedores p 
    LEFT JOIN ubicaciones u ON p.ubicacion_id = u.id 
    LEFT JOIN proveedor_categorias pc ON p.id = pc.proveedor_id AND pc.is_deleted = 0
    LEFT JOIN categorias c ON pc.categoria_id = c.id AND c.is_deleted = 0
    WHERE p.is_deleted = 0
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
      GROUP_CONCAT(c.nombre SEPARATOR ',') as categorias
    FROM proveedores p 
    LEFT JOIN ubicaciones u ON p.ubicacion_id = u.id 
    LEFT JOIN proveedor_categorias pc ON p.id = pc.proveedor_id AND pc.is_deleted = 0
    LEFT JOIN categorias c ON pc.categoria_id = c.id AND c.is_deleted = 0
    WHERE p.id = ? AND p.is_deleted = 0
    GROUP BY p.id
  `,
  create: `
    INSERT INTO proveedores (id, nombre_empresa, contacto_principal, telefono, email, ubicacion_id, descripcion)
    VALUES (UUID(), ?, ?, ?, ?, ?, ?)
  `,
  update: `
    UPDATE proveedores 
    SET nombre_empresa = ?, contacto_principal = ?, telefono = ?, email = ?, ubicacion_id = ?, descripcion = ?
    WHERE id = ? AND is_deleted = 0
  `,
  softDelete: `UPDATE proveedores SET is_deleted = 1 WHERE id = ?`,
  
  // Nuevas consultas para categorías
  createCategoria: `
    INSERT INTO proveedor_categorias (id, proveedor_id, categoria_id)
    VALUES (UUID(), ?, ?)
  `,
  deleteCategorias: `
    UPDATE proveedor_categorias 
    SET is_deleted = 1 
    WHERE proveedor_id = ?
  `,
  getCategoriasByProveedor: `
    SELECT c.id, c.nombre, c.descripcion
    FROM categorias c
    JOIN proveedor_categorias pc ON c.id = pc.categoria_id
    WHERE pc.proveedor_id = ? AND pc.is_deleted = 0 AND c.is_deleted = 0
  `,
  
  // Consultas para categorías
  getAllCategorias: `
    SELECT * FROM categorias_productos WHERE is_deleted = 0 ORDER BY nombre ASC
  `,
  getCategoriaById: `
    SELECT * FROM categorias_productos WHERE id = ? AND is_deleted = 0
  `,
  createEspecialidad: `
    INSERT INTO proveedor_especialidades (id, proveedor_id, especialidad)
    VALUES (UUID(), ?, ?)
  `,
  deleteEspecialidades: `
    UPDATE proveedor_especialidades 
    SET is_deleted = 1 
    WHERE proveedor_id = ?
  `,
  getEspecialidadesByProveedor: `
    SELECT especialidad 
    FROM proveedor_especialidades 
    WHERE proveedor_id = ? AND is_deleted = 0
  `
};

/* --- CATEGORIAS_PRODUCTOS ----------------------------------------------- */
export const CategoriaProductoQueries = {
  getAll: `SELECT * FROM categorias_productos WHERE is_deleted = 0`,
  getById: `SELECT * FROM categorias_productos WHERE id = ? AND is_deleted = 0`,
  create: `
    INSERT INTO categorias_productos (id, nombre, descripcion)
    VALUES (UUID(), ?, ?)
  `,
  update: `UPDATE categorias_productos SET nombre = ?, descripcion = ? WHERE id = ? AND is_deleted = 0`,
  softDelete: `UPDATE categorias_productos SET is_deleted = 1 WHERE id = ?`
};

/* --- PRODUCTOS_PROVEEDORES ---------------------------------------------- */
export const ProductoProveedorQueries = {
  getAll: `SELECT * FROM productos_proveedores WHERE is_deleted = 0`,
  getById: `SELECT * FROM productos_proveedores WHERE id = ? AND is_deleted = 0`,
  create: `
    INSERT INTO productos_proveedores (id, nombre, descripcion, categoria_id, proveedor_id, precio, unidad_medida, etiquetas)
    VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)
  `,
  update: `
    UPDATE productos_proveedores 
    SET nombre = ?, descripcion = ?, categoria_id = ?, proveedor_id = ?, precio = ?, unidad_medida = ?, etiquetas = ?
    WHERE id = ? AND is_deleted = 0
  `,
  softDelete: `UPDATE productos_proveedores SET is_deleted = 1 WHERE id = ?`,
  getByCategoria: `SELECT * FROM productos_proveedores WHERE categoria_id = ? AND is_deleted = 0`,
  getByProveedor: `SELECT * FROM productos_proveedores WHERE proveedor_id = ? AND is_deleted = 0`,
  getByPrecioRange: `SELECT * FROM productos_proveedores WHERE precio BETWEEN ? AND ? AND is_deleted = 0`
};

/* --- INVENTARIO --------------------------------------------------------- */
export const InventarioQueries = {
  getAll: `SELECT * FROM inventario WHERE is_deleted = 0`,
  getById: `SELECT * FROM inventario WHERE id = ? AND is_deleted = 0`,
  create: `
    INSERT INTO inventario (id, nombre, descripcion, categoria_id, cantidad_stock, cantidad_minima, precio_estimado, ubicacion_almacen, huerto_id, proveedor_id, imagen_url, usuario_creador)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  update: `
    UPDATE inventario 
    SET nombre = ?, descripcion = ?, categoria_id = ?, cantidad_stock = ?, cantidad_minima = ?, 
        precio_estimado = ?, ubicacion_almacen = ?, huerto_id = ?, proveedor_id = ?, imagen_url = ?
    WHERE id = ? AND is_deleted = 0
  `,
  softDelete: `UPDATE inventario SET is_deleted = 1 WHERE id = ?`,
  getByHuerto: `SELECT * FROM inventario WHERE huerto_id = ? AND is_deleted = 0`,
  getByCategoria: `SELECT * FROM inventario WHERE categoria_id = ? AND is_deleted = 0`,
  getStockBajo: `SELECT * FROM inventario WHERE cantidad_stock <= cantidad_minima AND is_deleted = 0`,
  updateStock: `UPDATE inventario SET cantidad_stock = ? WHERE id = ? AND is_deleted = 0`
};


/* --- ALERTAS ------------------------------------------------------------ */
export const AlertaQueries = {
  getAll: `SELECT * FROM alertas WHERE is_deleted = 0`,
  getById: `SELECT * FROM alertas WHERE id = ? AND is_deleted = 0`,
  create: `
    INSERT INTO alertas (id, titulo, descripcion, tipo, prioridad, huerto_id, usuario_creador, fecha_programada, fecha_vencimiento, esta_activa, notas)
    VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  update: `
    UPDATE alertas 
    SET titulo = ?, descripcion = ?, tipo = ?, prioridad = ?, huerto_id = ?, 
        fecha_programada = ?, fecha_vencimiento = ?, esta_activa = ?, notas = ?
    WHERE id = ? AND is_deleted = 0
  `,
  softDelete: `UPDATE alertas SET is_deleted = 1 WHERE id = ?`,
  getByHuerto: `SELECT * FROM alertas WHERE huerto_id = ? AND is_deleted = 0`,
  getByTipo: `SELECT * FROM alertas WHERE tipo = ? AND is_deleted = 0`,
  getByPrioridad: `SELECT * FROM alertas WHERE prioridad = ? AND is_deleted = 0`,
  getActivas: `SELECT * FROM alertas WHERE esta_activa = 1 AND is_deleted = 0`,
  updateActiva: `UPDATE alertas SET esta_activa = ? WHERE id = ? AND is_deleted = 0`
};

/* --- ALERTA_DESTINATARIOS ----------------------------------------------- */
export const AlertaDestinatarioQueries = {
  getAll: `SELECT * FROM alerta_destinatarios WHERE is_deleted = 0`,
  getById: `SELECT * FROM alerta_destinatarios WHERE id = ? AND is_deleted = 0`,
  create: `
    INSERT INTO alerta_destinatarios (id, alerta_id, usuario_id)
    VALUES (UUID(), ?, ?)
  `,
  softDelete: `UPDATE alerta_destinatarios SET is_deleted = 1 WHERE id = ?`,
  getByAlerta: `SELECT * FROM alerta_destinatarios WHERE alerta_id = ? AND is_deleted = 0`,
  getByUsuario: `SELECT * FROM alerta_destinatarios WHERE usuario_id = ? AND is_deleted = 0`,
  marcarLeida: `UPDATE alerta_destinatarios SET leida = 1, fecha_leida = NOW() WHERE id = ? AND is_deleted = 0`,
  getNoLeidasByUsuario: `SELECT * FROM alerta_destinatarios WHERE usuario_id = ? AND leida = 0 AND is_deleted = 0`
};

/* --- COMENTARIOS -------------------------------------------------------- */
export const ComentarioQueries = {
  getAll: `SELECT * FROM comentarios WHERE is_deleted = 0`,
  getById: `SELECT * FROM comentarios WHERE id = ? AND is_deleted = 0`,
  create: `
    INSERT INTO comentarios (id, titulo, contenido, tipo, usuario_id, huerto_id, etiquetas)
    VALUES (UUID(), ?, ?, ?, ?, ?, ?)
  `,
  update: `
    UPDATE comentarios 
    SET titulo = ?, contenido = ?, tipo = ?, huerto_id = ?, etiquetas = ?
    WHERE id = ? AND is_deleted = 0
  `,
  softDelete: `UPDATE comentarios SET is_deleted = 1 WHERE id = ?`,
  getByUsuario: `SELECT * FROM comentarios WHERE usuario_id = ? AND is_deleted = 0`,
  getByHuerto: `SELECT * FROM comentarios WHERE huerto_id = ? AND is_deleted = 0`,
  getByTipo: `SELECT * FROM comentarios WHERE tipo = ? AND is_deleted = 0`
};

    /* --- COMENTARIOS DE INVENTARIO ------------------------------------------ */
    export const ComentarioInventarioQueries = {
      getAll: `SELECT * FROM comentarios_inventario WHERE is_deleted = 0`,
      getById: `SELECT * FROM comentarios_inventario WHERE id = ? AND is_deleted = 0`,
      create: `
        INSERT INTO comentarios_inventario (id, inventario_id, usuario_id, contenido, tipo_comentario, cantidad_usada, unidad_medida)
        VALUES (UUID(), ?, ?, ?, ?, ?, ?)
      `,
      update: `
        UPDATE comentarios_inventario 
        SET contenido = ?, tipo_comentario = ?, cantidad_usada = ?, unidad_medida = ?
        WHERE id = ? AND is_deleted = 0
      `,
      softDelete: `UPDATE comentarios_inventario SET is_deleted = 1 WHERE id = ?`,
      getByUsuario: `SELECT * FROM comentarios_inventario WHERE usuario_id = ? AND is_deleted = 0`,
      getByInventario: `SELECT * FROM comentarios_inventario WHERE inventario_id = ? AND is_deleted = 0`,
      getByTipo: `SELECT * FROM comentarios_inventario WHERE tipo_comentario = ? AND is_deleted = 0`,
      getByInventarioWithUser: `
        SELECT ci.*, u.nombre as usuario_nombre, u.rol as usuario_rol
        FROM comentarios_inventario ci
        LEFT JOIN usuarios u ON ci.usuario_id = u.id
        WHERE ci.inventario_id = ? AND ci.is_deleted = 0
        ORDER BY ci.fecha_creacion DESC
      `
    };

    /* --- PERMISOS DE INVENTARIO --------------------------------------------- */
    export const InventarioPermisosQueries = {
      create: `
        INSERT INTO inventario_permisos (id, inventario_id, usuario_id, permiso_tipo, asignado_por)
        VALUES (UUID(), ?, ?, ?, ?)
      `,
      getByInventario: `
        SELECT ip.*, u.nombre as usuario_nombre, u.email as usuario_email
        FROM inventario_permisos ip
        LEFT JOIN usuarios u ON ip.usuario_id = u.id
        WHERE ip.inventario_id = ? AND ip.is_deleted = 0
        ORDER BY ip.fecha_asignacion DESC
      `,
      getByUsuario: `
        SELECT ip.*, i.nombre as inventario_nombre
        FROM inventario_permisos ip
        LEFT JOIN inventario i ON ip.inventario_id = i.id
        WHERE ip.usuario_id = ? AND ip.is_deleted = 0
        ORDER BY ip.fecha_asignacion DESC
      `,
      getByInventarioAndUsuario: `
        SELECT * FROM inventario_permisos 
        WHERE inventario_id = ? AND usuario_id = ? AND is_deleted = 0
      `,
      getByInventarioUsuarioAndTipo: `
        SELECT * FROM inventario_permisos 
        WHERE inventario_id = ? AND usuario_id = ? AND permiso_tipo = ? AND is_deleted = 0
      `,
      update: `
        UPDATE inventario_permisos 
        SET permiso_tipo = ?, asignado_por = ?
        WHERE id = ? AND is_deleted = 0
      `,
      softDelete: `UPDATE inventario_permisos SET is_deleted = 1 WHERE id = ?`,
      deleteByInventarioAndUsuario: `
        UPDATE inventario_permisos 
        SET is_deleted = 1 
        WHERE inventario_id = ? AND usuario_id = ? AND is_deleted = 0
      `,
      checkPermission: `
        SELECT COUNT(*) as has_permission FROM inventario_permisos 
        WHERE inventario_id = ? AND usuario_id = ? AND permiso_tipo = ? AND is_deleted = 0
      `,
      checkOwnerOrPermission: `
        SELECT 
          CASE 
            WHEN i.usuario_creador = ? THEN 1
            WHEN ip.id IS NOT NULL THEN 1
            ELSE 0
          END as has_permission
        FROM inventario i
        LEFT JOIN inventario_permisos ip ON i.id = ip.inventario_id 
          AND ip.usuario_id = ? 
          AND ip.permiso_tipo = ? 
          AND ip.is_deleted = 0
        WHERE i.id = ? AND i.is_deleted = 0
      `
    };

/* --- AUTH_TOKENS -------------------------------------------------------- */
export const AuthTokenQueries = {
  create: `
    INSERT INTO auth_tokens (id, usuario_id, refresh_token, expiracion)
    VALUES (UUID(), ?, ?, ?)
  `,
  getByToken: `SELECT * FROM auth_tokens WHERE refresh_token = ? AND is_deleted = 0`,
  getByUsuario: `SELECT * FROM auth_tokens WHERE usuario_id = ? AND is_deleted = 0`,
  deleteToken: `UPDATE auth_tokens SET is_deleted = 1 WHERE refresh_token = ?`,
  deleteAllForUser: `UPDATE auth_tokens SET is_deleted = 1 WHERE usuario_id = ?`,
  deleteExpired: `UPDATE auth_tokens SET is_deleted = 1 WHERE expiracion < NOW()`,
  deleteByUserId: `UPDATE auth_tokens SET is_deleted = 1 WHERE usuario_id = ?`
};