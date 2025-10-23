import db from "../config/db.js";
import { InventoryQueries } from "../utils/queries/index.js";
import { v4 as uuidv4 } from 'uuid';

// Obtener todos los ítems de inventario con filtros
export const getInventoryItems = async (req, res) => {
  try {
    const { category, lowStock, gardenId, providerId } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT i.*, c.nombre as categoria_nombre, p.nombre_empresa as proveedor_nombre, h.nombre as huerto_nombre, u.nombre as usuario_creador_nombre
      FROM inventario i
      LEFT JOIN categorias_productos c ON i.categoria_id = c.id
      LEFT JOIN proveedores p ON i.proveedor_id = p.id
      LEFT JOIN huertos h ON i.huerto_id = h.id
      LEFT JOIN usuarios u ON i.usuario_creador = u.id
      WHERE i.is_deleted = false
    `;

    const params = [];

    // Filtrar por condominio para administradores, técnicos y residentes
    if (['administrador', 'tecnico', 'residente'].includes(userRole)) {
      // Obtener la ubicación del usuario (condominio)
      const userLocationResult = await db.query(InventoryQueries.checkUserExists, [userId]);

      if (userLocationResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      const userLocationId = userLocationResult.rows[0].ubicacion_id;

      if (!userLocationId) {
        return res.status(400).json({
          success: false,
          message: 'El usuario no tiene una ubicación asignada. Contacta al administrador del sistema.'
        });
      }

      // Usar la query centralizada con filtros
      const itemsResult = await db.query(InventoryQueries.listWithFilters, [
        category || null,
        gardenId || null,
        providerId || null,
        lowStock === "true" ? true : null,
        userLocationId
      ]);

      res.json({
        success: true,
        data: itemsResult.rows,
        total: itemsResult.rows.length,
      });
    } else {
      // Para otros roles, usar query sin filtro de ubicación
      const itemsResult = await db.query(InventoryQueries.listWithFilters, [
        category || null,
        gardenId || null,
        providerId || null,
        lowStock === "true" ? true : null,
        null
      ]);

      res.json({
        success: true,
        data: itemsResult.rows,
        total: itemsResult.rows.length,
      });
    }
  } catch (error) {
    console.error("Error al obtener inventario:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

// Obtener detalles de un ítem específico
export const getItemDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const itemsResult = await db.query(InventoryQueries.getById, [id]);

    if (itemsResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ítem de inventario no encontrado",
      });
    }

    res.json({
      success: true,
      data: itemsResult.rows[0],
    });
  } catch (error) {
    console.error("Error al obtener detalles del ítem:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

// Agregar nuevo ítem al inventario
export const addInventoryItem = async (req, res) => {
  try {
    console.log('🔍 Datos recibidos para crear inventario:', req.body);
    const {
      nombre,
      descripcion,
      categoria_id,
      cantidad_stock,
      cantidad_minima,
      precio_estimado,
      ubicacion_almacen,
      huerto_id,
      proveedor_id,
      imagen_url,
    } = req.body;

    // Verificar que la categoría existe
    const categoryResult = await db.query(InventoryQueries.checkCategoryExists, [categoria_id]);

    if (categoryResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "La categoría especificada no existe",
      });
    }

    // Verificar que el huerto existe (solo si se proporciona)
    if (huerto_id) {
      const gardenResult = await db.query(InventoryQueries.checkGardenExists, [huerto_id]);

      if (gardenResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "El huerto especificado no existe",
        });
      }
    }

    // Verificar que el proveedor existe (si se proporciona)
    if (proveedor_id) {
      const providerResult = await db.query(InventoryQueries.checkProviderExists, [proveedor_id]);

      if (providerResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "El proveedor especificado no existe",
        });
      }
    }

    // Generar UUID para el nuevo ítem
    const newItemId = uuidv4();

    // Crear el ítem de inventario
    await db.query(InventoryQueries.create, [
      newItemId,
      nombre,
      descripcion || "",
      categoria_id,
      cantidad_stock || 0,
      cantidad_minima || 5,
      precio_estimado || null,
      ubicacion_almacen || "",
      huerto_id || null,
      proveedor_id || null,
      imagen_url || null,
      req.user.id, // usuario_creador
    ]);

    // Obtener el ítem recién creado
    const newItemResult = await db.query(InventoryQueries.getById, [newItemId]);

    res.status(201).json({
      success: true,
      message: "Ítem de inventario creado exitosamente",
      data: newItemResult.rows[0],
    });
  } catch (error) {
    console.error("Error al crear ítem de inventario:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

// Actualizar ítem de inventario
export const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      categoria_id,
      cantidad_stock,
      cantidad_minima,
      precio_estimado,
      ubicacion_almacen,
      huerto_id,
      proveedor_id,
      imagen_url,
    } = req.body;

    // Verificar que el ítem existe
    const itemResult = await db.query(InventoryQueries.getById, [id]);
    if (itemResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ítem de inventario no encontrado",
      });
    }

    // Verificar permisos de edición
    const userId = req.user.id;
    const userRole = req.user.rol || req.user.role;
    const isOwner = itemResult.rows[0].usuario_creador === userId;
    
    // Solo el propietario, admin o técnico pueden editar
    if (!isOwner && !['administrador', 'tecnico'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para editar este ítem'
      });
    }

    // Verificar que la categoría existe (si se proporciona)
    if (categoria_id) {
      const categoryResult = await db.query(InventoryQueries.checkCategoryExists, [categoria_id]);

      if (categoryResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "La categoría especificada no existe",
        });
      }
    }

    // Verificar que el huerto existe (si se proporciona)
    if (huerto_id) {
      const gardenResult = await db.query(InventoryQueries.checkGardenExists, [huerto_id]);

      if (gardenResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "El huerto especificado no existe",
        });
      }
    }

    // Verificar que el proveedor existe (si se proporciona)
    if (proveedor_id) {
      const providerResult = await db.query(InventoryQueries.checkProviderExists, [proveedor_id]);

      if (providerResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "El proveedor especificado no existe",
        });
      }
    }

    // Actualizar el ítem
    await db.query(InventoryQueries.update, [
      nombre || itemResult.rows[0].nombre,
      descripcion !== undefined ? descripcion : itemResult.rows[0].descripcion,
      categoria_id || itemResult.rows[0].categoria_id,
      cantidad_stock !== undefined
        ? cantidad_stock
        : itemResult.rows[0].cantidad_stock,
      cantidad_minima !== undefined
        ? cantidad_minima
        : itemResult.rows[0].cantidad_minima,
      precio_estimado !== undefined
        ? precio_estimado
        : itemResult.rows[0].precio_estimado,
      ubicacion_almacen || itemResult.rows[0].ubicacion_almacen,
      huerto_id !== undefined ? huerto_id : itemResult.rows[0].huerto_id,
      proveedor_id !== undefined ? proveedor_id : itemResult.rows[0].proveedor_id,
      imagen_url !== undefined ? imagen_url : itemResult.rows[0].imagen_url,
      id,
    ]);

    // Obtener el ítem actualizado
    const updatedItemResult = await db.query(InventoryQueries.getById, [id]);

    res.json({
      success: true,
      message: "Ítem de inventario actualizado exitosamente",
      data: updatedItemResult.rows[0],
    });
  } catch (error) {
    console.error("Error al actualizar ítem de inventario:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

// Eliminar ítem de inventario (soft delete)
export const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el ítem existe
    const itemResult = await db.query(InventoryQueries.getById, [id]);
    if (itemResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ítem de inventario no encontrado",
      });
    }

    // Verificar permisos de eliminación
    const userId = req.user.id;
    const userRole = req.user.rol || req.user.role;
    const isOwner = itemResult.rows[0].usuario_creador === userId;
    
    // Solo el propietario, admin o técnico pueden eliminar
    if (!isOwner && !['administrador', 'tecnico'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar este ítem'
      });
    }

    // Realizar soft delete
    await db.query(InventoryQueries.softDelete, [id]);

    res.json({
      success: true,
      message: "Ítem de inventario eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar ítem de inventario:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

// Registrar uso de un ítem
export const recordItemUsage = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad_usada, huerto_id, notas } = req.body;

    // Verificar que el ítem existe
    const itemResult = await db.query(InventoryQueries.getById, [id]);
    if (itemResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ítem de inventario no encontrado",
      });
    }

    const item = itemResult.rows[0];

    // Verificar que hay suficiente stock
    if (item.cantidad_stock < cantidad_usada) {
      return res.status(400).json({
        success: false,
        message: "Stock insuficiente para el uso solicitado",
      });
    }

    // Actualizar el stock
    const nuevoStock = item.cantidad_stock - cantidad_usada;
    await db.query(InventoryQueries.updateStock, [nuevoStock, id]);

    // Crear comentario automático de uso
    const commentId = uuidv4();
    let contenido = `**Uso registrado:** Se utilizaron ${cantidad_usada} unidades de ${item.nombre}${huerto_id ? ` en el huerto` : ''}.`;
    
    // Agregar notas en una línea separada si existen
    if (notas) {
      contenido += `\n\n**Notas:** ${notas}`;
    }
    
    await db.query(InventoryQueries.createComment, [
      commentId,
      id, // inventario_id
      req.user.id, // usuario_id
      contenido, // contenido
      'uso', // tipo_comentario
      cantidad_usada, // cantidad_usada
      'unidades' // unidad_medida
    ]);

    console.log(`✅ Comentario de uso creado para inventario ${id}: ${cantidad_usada} unidades`);

    res.json({
      success: true,
      message: "Uso de ítem registrado exitosamente",
      data: {
        item_id: id,
        cantidad_usada,
        stock_restante: nuevoStock,
        huerto_id,
        notas,
      },
    });
  } catch (error) {
    console.error("Error al registrar uso de ítem:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

// Obtener historial de uso de un ítem
export const getItemHistory = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el ítem existe
    const itemResult = await db.query(InventoryQueries.getById, [id]);
    if (itemResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ítem de inventario no encontrado",
      });
    }

    // Por ahora, retornamos un mensaje indicando que esta funcionalidad
    // requeriría una tabla de historial adicional
    res.json({
      success: true,
      message: "Funcionalidad de historial en desarrollo",
      data: {
        item_id: id,
        note: "Se requiere crear una tabla de historial de uso para implementar esta funcionalidad",
      },
    });
  } catch (error) {
    console.error("Error al obtener historial del ítem:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

// Obtener ítems con bajo stock
export const getLowStockItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT i.*, c.nombre as categoria_nombre, p.nombre_empresa as proveedor_nombre, h.nombre as huerto_nombre, u.nombre as usuario_creador_nombre
      FROM inventario i
      LEFT JOIN categorias_productos c ON i.categoria_id = c.id
      LEFT JOIN proveedores p ON i.proveedor_id = p.id
      LEFT JOIN huertos h ON i.huerto_id = h.id
      LEFT JOIN usuarios u ON i.usuario_creador = u.id
      WHERE i.is_deleted = false AND i.cantidad_stock <= i.cantidad_minima
    `;

    const params = [];

    // Filtrar por condominio para administradores, técnicos y residentes
    if (['administrador', 'tecnico', 'residente'].includes(userRole)) {
      // Obtener la ubicación del usuario (condominio)
      const userLocationResult = await db.query(InventoryQueries.checkUserExists, [userId]);

      if (userLocationResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      const userLocationId = userLocationResult.rows[0].ubicacion_id;

      if (!userLocationId) {
        return res.status(400).json({
          success: false,
          message: 'El usuario no tiene una ubicación asignada. Contacta al administrador del sistema.'
        });
      }

      // Usar la query centralizada para ítems con bajo stock
      const itemsResult = await db.query(InventoryQueries.getLowStockItems, [userLocationId]);

      res.json({
        success: true,
        data: itemsResult.rows,
        total: itemsResult.rows.length,
        message: `Se encontraron ${itemsResult.rows.length} ítems con bajo stock`,
      });
    } else {
      // Para otros roles, usar query sin filtro de ubicación
      const itemsResult = await db.query(InventoryQueries.getLowStockItems, [null]);

      res.json({
        success: true,
        data: itemsResult.rows,
        total: itemsResult.rows.length,
        message: `Se encontraron ${itemsResult.rows.length} ítems con bajo stock`,
      });
    }
  } catch (error) {
    console.error("Error al obtener ítems con bajo stock:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

// Actualizar stock de un ítem
export const updateItemStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad_stock } = req.body;

    // Verificar que el ítem existe
    const itemResult = await db.query(InventoryQueries.getById, [id]);
    if (itemResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ítem de inventario no encontrado",
      });
    }

    // Actualizar el stock
    await db.query(InventoryQueries.updateStock, [cantidad_stock, id]);

    // Obtener el ítem actualizado
    const updatedItemResult = await db.query(InventoryQueries.getById, [id]);

    res.json({
      success: true,
      message: "Stock actualizado exitosamente",
      data: updatedItemResult.rows[0],
    });
  } catch (error) {
    console.error("Error al actualizar stock:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

// Verificar si un usuario tiene permisos para un item de inventario
export const checkInventoryPermission = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const { permissionType } = req.query; // 'editar', 'usar', 'ver_historial'
    const userId = req.user.id;
    const userRole = req.user.rol || req.user.role;

    console.log('🔍 Verificando permiso:', { inventoryId, userId, permissionType, userRole });

    // Verificar si el usuario es el dueño del item
    const inventoryResult = await db.query(InventoryQueries.checkInventoryPermission, [inventoryId]);

    if (inventoryResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item de inventario no encontrado'
      });
    }

    const isOwner = inventoryResult.rows[0].usuario_creador === userId;
    
    // El dueño siempre tiene todos los permisos
    if (isOwner) {
      console.log('✅ Usuario es dueño del item');
      res.json({
        success: true,
        hasPermission: true
      });
      return;
    }
    
    // Admin y técnicos tienen todos los permisos
    if (['administrador', 'tecnico'].includes(userRole)) {
      console.log('✅ Usuario es admin/técnico');
      res.json({
        success: true,
        hasPermission: true
      });
      return;
    }
    
    // Otros usuarios no tienen permisos
    console.log('❌ Usuario no tiene permisos');
    res.json({
      success: true,
      hasPermission: false
    });

  } catch (error) {
    console.error('❌ Error al verificar permiso de inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener permisos de un item de inventario
export const getInventoryPermissions = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const userId = req.user.id;

    console.log('🔍 Obteniendo permisos para inventario:', inventoryId);

    // Verificar que el usuario es el dueño del item
    const inventoryResult = await db.query(InventoryQueries.checkInventoryPermission, [inventoryId]);

    if (inventoryResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item de inventario no encontrado'
      });
    }

    const userRole = req.user.rol || req.user.role;
    const isOwner = inventoryResult.rows[0].usuario_creador === userId;
    
    // Verificar si el usuario tiene permisos para ver los permisos de este item
    if (!isOwner && !['administrador', 'tecnico'].includes(userRole)) {
      // Si es residente, verificar si tiene permisos asignados para este item
      const userPermissionsResult = await db.query(InventoryQueries.getUserInventoryPermissions, [inventoryId, userId]);
      
      console.log(`🔍 Verificando permisos para usuario ${userId} en ítem ${inventoryId}:`, {
        userPermissions: userPermissionsResult.rows.length,
        isOwner,
        userRole
      });
      
      if (userPermissionsResult.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos asignados para este ítem'
        });
      }
    } else if (isOwner) {
      console.log(`✅ Usuario ${userId} es propietario del ítem ${inventoryId} - acceso completo`);
    }

    // Obtener permisos de la tabla
    let permissions;
    if (isOwner || ['administrador', 'tecnico'].includes(userRole)) {
      // Propietario, admin o técnico pueden ver todos los permisos
      permissions = await db.query(InventoryQueries.getInventoryPermissions, [inventoryId]);
    } else {
      // Colaboradores solo pueden ver sus propios permisos
      permissions = await db.query(InventoryQueries.getUserInventoryPermissions, [inventoryId, userId]);
    }
        
    res.json({
      success: true,
      data: permissions.rows
    });

  } catch (error) {
    console.error('❌ Error al obtener permisos de inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Asignar permiso a un usuario para un item de inventario
export const assignInventoryPermission = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const { userId, permissionType } = req.body;
    const ownerId = req.user.id;

    console.log('🔍 Asignando permiso:', { inventoryId, userId, permissionType, ownerId });

    // Verificar que el usuario es el dueño del item
    const inventoryResult = await db.query(InventoryQueries.checkInventoryPermission, [inventoryId]);

    if (inventoryResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item de inventario no encontrado'
      });
    }

    const userRole = req.user.rol || req.user.role;
    const isOwner = inventoryResult.rows[0].usuario_creador === ownerId;
    
    // Solo el dueño o admin/técnico pueden gestionar permisos
    if (!isOwner && !['administrador', 'tecnico'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para gestionar este item'
      });
    }

    // Verificar si ya existe un permiso (incluyendo los eliminados)
    const existingPermissionResult = await db.query(InventoryQueries.checkExistingPermission, [inventoryId, userId, permissionType]);

    if (existingPermissionResult.rows.length > 0) {
      // Si existe, reactivarlo (marcar como no eliminado)
      await db.query(InventoryQueries.reactivatePermission, [ownerId, existingPermissionResult.rows[0].id]);
    } else {
      // Si no existe, crear uno nuevo
      const permissionId = uuidv4();
      
      await db.query(InventoryQueries.createPermission, [permissionId, inventoryId, userId, permissionType, ownerId]);
    }

    // No cambiar el rol principal del usuario
    // El estado de "colaborador" se maneja solo en el contexto de inventario
    console.log(`✅ Permiso asignado a usuario ${userId} - mantiene rol principal como residente`);
    
    console.log('✅ Permiso asignado exitosamente');
    res.json({
      success: true,
      message: 'Permiso asignado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al asignar permiso de inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Revocar permiso de un usuario para un item de inventario
export const revokeInventoryPermission = async (req, res) => {
  try {
    const { inventoryId, userId, permissionType } = req.params;
    const ownerId = req.user.id;

    console.log('🔍 Revocando permiso:', { inventoryId, userId, permissionType, ownerId });

    // Verificar que el usuario es el dueño del item
    const inventoryResult = await db.query(InventoryQueries.checkInventoryPermission, [inventoryId]);

    if (inventoryResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item de inventario no encontrado'
      });
    }

    const userRole = req.user.rol || req.user.role;
    const isOwner = inventoryResult.rows[0].usuario_creador === ownerId;
    
    // Solo el dueño o admin/técnico pueden gestionar permisos
    if (!isOwner && !['administrador', 'tecnico'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para gestionar este item'
      });
    }

    // Revocar permiso de la tabla
    await db.query(InventoryQueries.revokePermission, [inventoryId, userId, permissionType]);
    
    console.log('✅ Permiso revocado exitosamente');
    res.json({
      success: true,
      message: 'Permiso revocado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al revocar permiso de inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// ==================== PERMISOS DE COMENTARIOS DE INVENTARIO ====================

// Obtener comentarios de un item específico de inventario
export const getInventoryComments = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const userId = req.user.id;

    console.log('🔍 Obteniendo comentarios de inventario del item:', { inventoryId, userId });

    // Obtener comentarios específicos de inventario (tabla comentarios_inventario)
    const commentsResult = await db.query(InventoryQueries.getInventoryComments, [inventoryId]);

    console.log('✅ Comentarios de inventario del item obtenidos:', commentsResult.rows.length);

    res.json({
      success: true,
      data: commentsResult.rows
    });

  } catch (error) {
    console.error('❌ Error al obtener comentarios de inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener TODOS los comentarios de inventario (para administradores)
export const getAllInventoryComments = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.rol || req.user.role;

    console.log('🔍 Obteniendo TODOS los comentarios de inventario:', { userId, userRole });

    // Administradores, técnicos y residentes pueden ver todos los comentarios
    if (!['administrador', 'tecnico', 'residente'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver todos los comentarios'
      });
    }

    // Obtener la ubicación del usuario (condominio)
    const userLocationResult = await db.query(InventoryQueries.checkUserExists, [userId]);

    if (userLocationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const userLocationId = userLocationResult.rows[0].ubicacion_id;

    if (!userLocationId) {
      return res.status(400).json({
        success: false,
        message: 'El usuario no tiene una ubicación asignada. Contacta al administrador del sistema.'
      });
    }

    // Obtener comentarios de inventario del mismo condominio (no automáticos)
    const commentsResult = await db.query(InventoryQueries.getAllInventoryComments, [userLocationId]);

    console.log('✅ Todos los comentarios de inventario obtenidos:', commentsResult.rows.length);

    res.json({
      success: true,
      data: commentsResult.rows
    });

  } catch (error) {
    console.error('❌ Error al obtener todos los comentarios de inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener todos los comentarios de inventario del usuario (NO automáticos de historial)
export const getUserInventoryComments = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('🔍 Obteniendo comentarios de inventario del usuario:', { userId });
    console.log('🔍 Usuario del token:', req.user);

    // Obtener comentarios específicos de inventario (tabla comentarios_inventario)
    // EXCLUIR comentarios automáticos de historial de uso (tipo_comentario = 'uso')
    // Solo mostrar comentarios que el usuario escribió manualmente
    const commentsResult = await db.query(InventoryQueries.getUserInventoryComments, [userId]);

    console.log('✅ Comentarios de inventario del usuario (no automáticos) obtenidos:', commentsResult.rows.length);
    console.log('📝 Comentarios encontrados:', commentsResult.rows.map(c => ({
      id: c.id,
      contenido: c.contenido.substring(0, 50) + '...',
      tipo: c.tipo_comentario,
      inventario: c.inventario_nombre
    })));

    res.json({
      success: true,
      data: commentsResult.rows
    });

  } catch (error) {
    console.error('❌ Error al obtener comentarios de inventario del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Crear comentario de inventario
export const createInventoryComment = async (req, res) => {
  try {
    const { itemId, content, commentType } = req.body;
    const userId = req.user.id;

    console.log('🔍 Creando comentario de inventario:', { itemId, userId, commentType });

    // Verificar que el item existe
    const itemResult = await db.query(InventoryQueries.checkInventoryPermission, [itemId]);

    if (itemResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item de inventario no encontrado'
      });
    }

    // Crear el comentario
    const commentId = uuidv4();
    
    await db.query(InventoryQueries.createComment, [
      commentId,
      itemId,
      userId,
      content,
      commentType || 'general',
      null, // cantidad_usada
      null  // unidad_medida
    ]);

    console.log('✅ Comentario de inventario creado exitosamente');

    res.json({
      success: true,
      message: 'Comentario creado exitosamente',
      data: {
        id: commentId,
        inventario_id: itemId,
        usuario_id: userId,
        contenido: content,
        tipo_comentario: commentType || 'general'
      }
    });

  } catch (error) {
    console.error('❌ Error al crear comentario de inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Verificar si un usuario tiene permisos para un comentario específico
export const checkCommentPermission = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { permissionType } = req.query; // 'editar', 'eliminar'
    const userId = req.user.id;
    const userRole = req.user.rol || req.user.role;

    console.log('🔍 Verificando permiso de comentario:', { commentId, userId, permissionType, userRole });

    // Verificar si el usuario es el autor del comentario
    const commentResult = await db.query(InventoryQueries.checkCommentPermission, [commentId]);

    if (commentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }

    const isAuthor = commentResult.rows[0].usuario_id === userId;
    
    // El autor siempre tiene todos los permisos
    if (isAuthor) {
      console.log('✅ Usuario es autor del comentario');
      res.json({
        success: true,
        hasPermission: true
      });
      return;
    }
    
    // Admin y técnicos tienen todos los permisos
    if (['administrador', 'tecnico'].includes(userRole)) {
      console.log('✅ Usuario es admin/técnico');
      res.json({
        success: true,
        hasPermission: true
      });
      return;
    }
    
    // Verificar si tiene permisos específicos asignados
    try {
      const permissionResult = await db.query(InventoryQueries.checkSpecificCommentPermission, [commentId, userId, permissionType]);
      
      const hasPermission = permissionResult.rows[0]?.has_permission > 0;
      console.log('✅ Usuario no es autor, verificando permisos específicos:', hasPermission);
      
      res.json({
        success: true,
        hasPermission: hasPermission
      });
      return;
    } catch (error) {
      // Si la tabla no existe, solo el autor y admin/técnicos pueden
      console.log('⚠️ Tabla de permisos de comentarios no existe');
      res.json({
        success: true,
        hasPermission: false
      });
      return;
    }

  } catch (error) {
    console.error('❌ Error al verificar permiso de comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener permisos de un comentario específico
export const getCommentPermissions = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    console.log('🔍 Obteniendo permisos para comentario:', commentId);

    // Verificar que el usuario es el autor del comentario
    const commentResult = await db.query(InventoryQueries.checkCommentPermission, [commentId]);

    if (commentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }

    if (commentResult.rows[0].usuario_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para gestionar este comentario'
      });
    }

    // Obtener permisos de la tabla (si existe)
    try {
      const permissionsResult = await db.query(InventoryQueries.getCommentPermissions, [commentId]);
      
      res.json({
        success: true,
        data: permissionsResult.rows
      });
    } catch (error) {
      // Si la tabla no existe, devolver array vacío
      console.log('⚠️ Tabla de permisos de comentarios no existe, devolviendo array vacío');
      res.json({
        success: true,
        data: []
      });
    }

  } catch (error) {
    console.error('❌ Error al obtener permisos de comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Asignar permiso a un comentario
export const assignCommentPermission = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId, permissionType } = req.body;
    const authorId = req.user.id;

    console.log('🔍 Asignando permiso de comentario:', { commentId, userId, permissionType, authorId });

    // Verificar que el usuario es el autor del comentario
    const commentResult = await db.query(InventoryQueries.checkCommentPermission, [commentId]);

    if (commentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }

    if (commentResult.rows[0].usuario_id !== authorId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para gestionar este comentario'
      });
    }

    // Asignar permiso en la tabla (si existe)
    try {
      const permissionId = uuidv4();
      
      await db.query(InventoryQueries.createCommentPermission, [permissionId, commentId, userId, permissionType, authorId]);
      
      console.log('✅ Permiso de comentario asignado exitosamente');
      res.json({
        success: true,
        message: 'Permiso asignado exitosamente'
      });
    } catch (error) {
      // Si la tabla no existe, devolver éxito pero sin persistir
      console.log('⚠️ Tabla de permisos de comentarios no existe, permiso no persistido');
      res.json({
        success: true,
        message: 'Permiso asignado exitosamente (sin persistencia)'
      });
    }

  } catch (error) {
    console.error('❌ Error al asignar permiso de comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Revocar permiso de un comentario
export const revokeCommentPermission = async (req, res) => {
  try {
    const { commentId, userId, permissionType } = req.params;
    const authorId = req.user.id;

    console.log('🔍 Revocando permiso de comentario:', { commentId, userId, permissionType, authorId });

    // Verificar que el usuario es el autor del comentario
    const commentResult = await db.query(InventoryQueries.checkCommentPermission, [commentId]);

    if (commentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }

    if (commentResult.rows[0].usuario_id !== authorId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para gestionar este comentario'
      });
    }

    // Revocar permiso de la tabla (si existe)
    try {
      await db.query(InventoryQueries.revokeCommentPermission, [commentId, userId, permissionType]);
      
      console.log('✅ Permiso de comentario revocado exitosamente');
      res.json({
        success: true,
        message: 'Permiso revocado exitosamente'
      });
    } catch (error) {
      // Si la tabla no existe, devolver éxito pero sin persistir
      console.log('⚠️ Tabla de permisos de comentarios no existe, revocación no persistida');
      res.json({
        success: true,
        message: 'Permiso revocado exitosamente (sin persistencia)'
      });
    }

  } catch (error) {
    console.error('❌ Error al revocar permiso de comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// ==================== NUEVO SISTEMA DE PERMISOS ====================

// Obtener todos los usuarios para asignar permisos
export const getAllUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT u.id, u.nombre, u.email, u.rol 
      FROM usuarios u
      WHERE u.is_deleted = false
    `;

    const params = [];

    // Filtrar por condominio para administradores, técnicos y residentes
    if (['administrador', 'tecnico', 'residente'].includes(userRole)) {
      // Obtener la ubicación del usuario (condominio)
      const userLocationResult = await db.query(
        "SELECT ubicacion_id FROM usuarios WHERE id = $1 AND is_deleted = false",
        [userId]
      );

      if (userLocationResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      const userLocationId = userLocationResult.rows[0].ubicacion_id;

      if (!userLocationId) {
        return res.status(400).json({
          success: false,
          message: 'El usuario no tiene una ubicación asignada. Contacta al administrador del sistema.'
        });
      }

      // Filtrar usuarios del mismo condominio
      query += " AND u.ubicacion_id = $1";
      params.push(userLocationId);
    }

    query += " ORDER BY u.nombre ASC";

    const usersResult = await db.query(query, params);

    res.json({
      success: true,
      data: usersResult.rows
    });
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Asignar permiso a un usuario específico para un comentario específico
export const assignCommentPermissionToUser = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId, permissionType } = req.body;
    const authorId = req.user.id;

    console.log('🔍 Asignando permiso específico:', { commentId, userId, permissionType, authorId });

    // Verificar que el comentario existe y el usuario es el autor
    const commentResult = await db.query(InventoryQueries.checkCommentPermission, [commentId]);

    if (commentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }

    if (commentResult.rows[0].usuario_id !== authorId) {
      return res.status(403).json({
        success: false,
        message: 'Solo el autor del comentario puede asignar permisos'
      });
    }

    // Verificar que el usuario al que se le asigna el permiso existe
    const userResult = await db.query(InventoryQueries.checkUserExists, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Asignar el permiso
    const permissionId = uuidv4();
    
    await db.query(InventoryQueries.createCommentPermission, [permissionId, commentId, userId, permissionType, authorId]);

    console.log('✅ Permiso asignado exitosamente');
    res.json({
      success: true,
      message: `Permiso de ${permissionType} asignado a ${userResult.rows[0].nombre} exitosamente`,
      data: {
        permissionId,
        commentId,
        userId,
        userName: userResult.rows[0].nombre,
        permissionType
      }
    });

  } catch (error) {
    console.error('❌ Error al asignar permiso:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};


// Revocar permiso específico
export const revokeCommentPermissionFromUser = async (req, res) => {
  try {
    const { commentId, userId, permissionType } = req.params;
    const authorId = req.user.id;

    console.log('🔍 Revocando permiso específico:', { commentId, userId, permissionType, authorId });

    // Verificar que el comentario existe y el usuario es el autor
    const commentResult = await db.query(InventoryQueries.checkCommentPermission, [commentId]);

    if (commentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }

    if (commentResult.rows[0].usuario_id !== authorId) {
      return res.status(403).json({
        success: false,
        message: 'Solo el autor del comentario puede revocar permisos'
      });
    }

    // Revocar el permiso
    await db.query(InventoryQueries.revokeCommentPermission, [commentId, userId, permissionType]);

    console.log('✅ Permiso revocado exitosamente');
    res.json({
      success: true,
      message: 'Permiso revocado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al revocar permiso:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Verificar si un usuario puede editar/eliminar un comentario específico
export const checkCommentEditPermission = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { action } = req.query; // 'editar' o 'eliminar'
    const userId = req.user.id;
    const userRole = req.user.rol || req.user.role;

    console.log('🔍 Verificando permiso de edición:', { commentId, userId, action, userRole });

    // Verificar si el comentario existe
    const commentResult = await db.query(InventoryQueries.checkCommentPermission, [commentId]);

    if (commentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }

    const isAuthor = commentResult.rows[0].usuario_id === userId;
    
    // El autor siempre puede editar/eliminar sus comentarios
    if (isAuthor) {
      return res.json({
        success: true,
        canEdit: true,
        reason: 'Es el autor del comentario'
      });
    }
    
    // Admin y técnicos pueden editar/eliminar cualquier comentario
    if (['administrador', 'tecnico'].includes(userRole)) {
      return res.json({
        success: true,
        canEdit: true,
        reason: 'Tiene permisos de administrador/técnico'
      });
    }
    
    // Verificar si tiene permisos específicos asignados
    const permissionResult = await db.query(InventoryQueries.checkCommentEditPermission, [commentId, userId, action]);
    
    const hasPermission = permissionResult.rows[0]?.has_permission > 0;
    
    res.json({
      success: true,
      canEdit: hasPermission,
      reason: hasPermission ? 'Tiene permiso específico asignado' : 'No tiene permisos'
    });

  } catch (error) {
    console.error('❌ Error al verificar permiso de edición:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};
