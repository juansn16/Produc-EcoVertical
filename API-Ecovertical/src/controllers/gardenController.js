import db from '../config/db.js';
import { HuertoQueries, UsuarioHuertoQueries, HuertoDataQueries, AlertaQueries, UbicacionQueries, UsuarioQueries } from '../utils/queries.js';

// Listar huertos con filtros
export const listGardens = async (req, res) => {
  try {
    const { type, status } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    console.log('🔍 listGardens - Parámetros:', { userId, userRole, type, status });
    
    // Obtener la ubicación del usuario para filtrar huertos públicos
    const [userResult] = await db.execute(`
      SELECT ubicacion_id FROM usuarios WHERE id = ? AND is_deleted = 0
    `, [userId]);
    
    if (userResult.length === 0) {
      console.log('❌ Usuario no encontrado:', userId);
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    const userLocationId = userResult[0].ubicacion_id;
    console.log('📍 Ubicación del usuario:', userLocationId);
    
    let query = `
      SELECT h.*, u.nombre as ubicacion_nombre, uc.nombre as creador_nombre,
             COUNT(uh.usuario_id) as usuarios_asignados,
             CASE 
               WHEN uh_assigned.usuario_id IS NOT NULL THEN 'asignado'
               WHEN h.usuario_creador = ? THEN 'propietario'
               ELSE 'admin'
             END as access_type
      FROM huertos h
      LEFT JOIN ubicaciones u ON h.ubicacion_id = u.id
      LEFT JOIN usuarios uc ON h.usuario_creador = uc.id
      LEFT JOIN usuario_huerto uh ON h.id = uh.huerto_id AND uh.is_deleted = 0
      LEFT JOIN usuario_huerto uh_assigned ON h.id = uh_assigned.huerto_id AND uh_assigned.usuario_id = ? AND uh_assigned.is_deleted = 0
      WHERE h.is_deleted = 0
      AND (
        -- Huertos privados: 
        --   * Creados por el usuario actual
        --   * O todos los privados del condominio si es admin/técnico
        --   * O huertos donde el usuario está asignado como residente
        (h.tipo = 'privado' AND (
          h.usuario_creador = ? 
          OR (h.ubicacion_id = ? AND ? IN ('administrador', 'tecnico'))
          OR uh_assigned.usuario_id IS NOT NULL
        ))
        OR
        -- Huertos públicos: solo los del mismo condominio
        (h.tipo = 'publico' AND h.ubicacion_id = ?)
      )
    `;
    
    const params = [userId, userId, userId, userLocationId, userRole, userLocationId];
    
    if (type) {
      query += ' AND h.tipo = ?';
      params.push(type);
    }
    
    // Agrupar para contar usuarios asignados
    query += ' GROUP BY h.id ORDER BY h.created_at DESC';
    
    console.log('🔍 Query SQL:', query);
    console.log('🔍 Parámetros:', params);
    
    const [gardens] = await db.execute(query, params);
    
    console.log('✅ Huertos encontrados:', gardens.length);
    gardens.forEach(garden => {
      console.log(`  - ${garden.nombre} (${garden.tipo}) - Acceso: ${garden.access_type}`);
    });
    
    res.json({
      success: true,
      data: gardens,
      total: gardens.length
    });
  } catch (error) {
    console.error('Error al listar huertos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Crear nuevo huerto
export const createGarden = async (req, res) => {
  try {
    const {
      name,
      location,
      type,
      dimensions,
      wateringSchedule,
      plantCapacity,
      description
    } = req.body;
    
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Validar permisos según el tipo de huerto
    const gardenType = type || 'privado';
    
    // Verificar que el usuario tiene permisos para crear huertos
    if (!['residente', 'tecnico', 'administrador'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para crear huertos'
      });
    }
    
    // Verificar que la ubicación existe
    const [locationResult] = await db.execute(UbicacionQueries.getById, [location]);
    if (locationResult.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La ubicación especificada no existe'
      });
    }
    
    // Para huertos públicos, verificar permisos según el rol del usuario
    if (gardenType === 'publico') {
      const [userResult] = await db.execute(`
        SELECT ubicacion_id FROM usuarios WHERE id = ? AND is_deleted = 0
      `, [userId]);
      
      console.log('🔍 Debug - Creando huerto público:', {
        userId,
        userLocationId: userResult[0]?.ubicacion_id,
        requestedLocationId: location,
        userExists: userResult.length > 0,
        userRole
      });
      
      if (userResult.length === 0) {
        console.log('❌ Error - Usuario no encontrado');
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      // Los administradores pueden crear huertos públicos en cualquier ubicación
      // Los residentes y técnicos solo pueden crear en su propio condominio
      if (userRole !== 'administrador' && userResult[0].ubicacion_id !== location) {
        console.log('❌ Error - Usuario no puede crear huerto público:', {
          reason: 'Ubicación no coincide',
          userLocationId: userResult[0]?.ubicacion_id,
          requestedLocationId: location,
          userRole
        });
        
        return res.status(403).json({
          success: false,
          message: 'Solo puedes crear huertos públicos en tu propio condominio'
        });
      }
    }
    
    // Para huertos privados, verificar que el usuario tiene una ubicación asignada
    if (gardenType === 'privado') {
      const [userResult] = await db.execute(`
        SELECT ubicacion_id FROM usuarios WHERE id = ? AND is_deleted = 0
      `, [userId]);
      
      console.log('🔍 Debug - Creando huerto privado:', {
        userId,
        userLocationId: userResult[0]?.ubicacion_id,
        requestedLocationId: location,
        userExists: userResult.length > 0
      });
      
      if (userResult.length === 0) {
        console.log('❌ Error - Usuario no encontrado');
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      // Para huertos privados, el usuario puede crear en cualquier ubicación,
      // pero si no tiene ubicación asignada, usar la ubicación por defecto
      if (!userResult[0].ubicacion_id && location) {
        console.log('⚠️ Warning - Usuario sin ubicación asignada, usando ubicación proporcionada');
      }
    }
    
    // Crear el huerto
    const [result] = await db.execute(HuertoQueries.create, [
      name,
      description || '',
      gardenType,
      dimensions,
      plantCapacity,
      location,
      userId,
      null // imagen_url por defecto
    ]);
    
    // Como usamos UUID(), necesitamos obtener el huerto recién creado
    const [gardenResult] = await db.execute(`
      SELECT h.*, u.nombre as ubicacion_nombre, uc.nombre as creador_nombre
      FROM huertos h
      LEFT JOIN ubicaciones u ON h.ubicacion_id = u.id
      LEFT JOIN usuarios uc ON h.usuario_creador = uc.id
      WHERE h.nombre = ? AND h.usuario_creador = ? AND h.is_deleted = 0
      ORDER BY h.created_at DESC LIMIT 1
    `, [name, userId]);
    
    const gardenId = gardenResult[0].id;
    
    // Asignar automáticamente al creador como propietario
    await db.execute(UsuarioHuertoQueries.create, [
      userId,
      gardenId,
      'propietario'
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Huerto creado exitosamente',
      data: gardenResult[0]
    });
  } catch (error) {
    console.error('Error al crear huerto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener detalles de un huerto específico
export const getGardenDetails = async (req, res) => {
  try {
    const { gardenId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Obtener información del huerto con verificación de acceso
    const [gardenResult] = await db.execute(`
      SELECT h.*, u.nombre as ubicacion_nombre, u.calle, u.ciudad, u.estado,
             uc.nombre as creador_nombre, uc.email as creador_email,
             usr.ubicacion_id as user_location_id
      FROM huertos h
      LEFT JOIN ubicaciones u ON h.ubicacion_id = u.id
      LEFT JOIN usuarios uc ON h.usuario_creador = uc.id
      LEFT JOIN usuarios usr ON usr.id = ?
      WHERE h.id = ? AND h.is_deleted = 0
    `, [userId, gardenId]);
    
    if (gardenResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }
    
    const garden = gardenResult[0];
    
    // Verificar acceso según las nuevas reglas de seguridad
    if (garden.tipo === 'privado') {
      // El creador siempre puede acceder
      if (garden.usuario_creador === userId) {
        console.log('✅ Acceso a huerto privado permitido - Usuario es el creador');
      }
      // Admin y técnico pueden ver huertos privados de su condominio
      else if (['administrador', 'tecnico'].includes(userRole) && garden.ubicacion_id === garden.user_location_id) {
        console.log('✅ Acceso a huerto privado permitido - Admin/Técnico del mismo condominio');
      }
      // Otros casos: acceso denegado
      else {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este huerto privado'
        });
      }
    }
    
    // Si es huerto público, verificar que sea del mismo condominio
    if (garden.tipo === 'publico') {
      if (garden.ubicacion_id !== garden.user_location_id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este huerto público'
        });
      }
      console.log('✅ Acceso a huerto público permitido para:', userRole);
    }
    
    // Obtener usuarios asignados al huerto
    const [usersResult] = await db.execute(`
      SELECT uh.*, u.nombre, u.email, u.rol
      FROM usuario_huerto uh
      LEFT JOIN usuarios u ON uh.usuario_id = u.id
      WHERE uh.huerto_id = ? AND uh.is_deleted = 0
    `, [gardenId]);
    
    // Obtener estadísticas básicas
    const [statsResult] = await db.execute(`
      SELECT 
        COUNT(*) as total_registros,
        SUM(cantidad_agua) as total_agua,
        SUM(cantidad_siembra) as total_siembra,
        SUM(cantidad_cosecha) as total_cosecha
      FROM huerto_data 
      WHERE huerto_id = ? AND is_deleted = 0
    `, [gardenId]);
    
    garden.usuarios_asignados = usersResult;
    garden.estadisticas = statsResult[0];
    
    res.json({
      success: true,
      data: garden
    });
  } catch (error) {
    console.error('Error al obtener detalles del huerto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar huerto
export const updateGarden = async (req, res) => {
  try {
    const { gardenId } = req.params;
    const updateData = req.body;
    const userId = req.user.id;
    
    // Verificar que el huerto existe
    const [gardenResult] = await db.execute(HuertoQueries.getById, [gardenId]);
    if (gardenResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }
    
    // Verificar permisos (solo admin, técnico o creador del huerto pueden actualizar)
    const garden = gardenResult[0];
    const userRole = req.user.rol;
    const isCreator = garden.usuario_creador === userId;
    
    if (userRole !== 'administrador' && userRole !== 'tecnico' && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para actualizar este huerto'
      });
    }
    
    // Verificar ubicación si se está actualizando
    if (updateData.location) {
      const [locationResult] = await db.execute(UbicacionQueries.getById, [updateData.location]);
      if (locationResult.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'La ubicación especificada no existe'
        });
      }
    }
    
    // Construir query de actualización dinámicamente
    const updateFields = [];
    const updateValues = [];
    
    if (updateData.name) {
      updateFields.push('nombre = ?');
      updateValues.push(updateData.name);
    }
    if (updateData.description !== undefined) {
      updateFields.push('descripcion = ?');
      updateValues.push(updateData.description);
    }
    if (updateData.type) {
      updateFields.push('tipo = ?');
      updateValues.push(updateData.type);
    }
    if (updateData.dimensions) {
      updateFields.push('superficie = ?');
      updateValues.push(updateData.dimensions);
    }
    if (updateData.plantCapacity) {
      updateFields.push('capacidad = ?');
      updateValues.push(updateData.plantCapacity);
    }
    if (updateData.location) {
      updateFields.push('ubicacion_id = ?');
      updateValues.push(updateData.location);
    }
    if (updateData.imageUrl !== undefined) {
      updateFields.push('imagen_url = ?');
      updateValues.push(updateData.imageUrl);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron campos para actualizar'
      });
    }
    
    updateValues.push(gardenId);
    
    const updateQuery = `
      UPDATE huertos 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND is_deleted = 0
    `;
    
    await db.execute(updateQuery, updateValues);
    
    // Obtener el huerto actualizado
    const [updatedGarden] = await db.execute(`
      SELECT h.*, u.nombre as ubicacion_nombre, uc.nombre as creador_nombre
      FROM huertos h
      LEFT JOIN ubicaciones u ON h.ubicacion_id = u.id
      LEFT JOIN usuarios uc ON h.usuario_creador = uc.id
      WHERE h.id = ?
    `, [gardenId]);
    
    res.json({
      success: true,
      message: 'Huerto actualizado exitosamente',
      data: updatedGarden[0]
    });
  } catch (error) {
    console.error('Error al actualizar huerto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar huerto (soft delete)
export const deleteGarden = async (req, res) => {
  try {
    const { gardenId } = req.params;
    
    // Verificar que el huerto existe
    const [gardenResult] = await db.execute(HuertoQueries.getById, [gardenId]);
    if (gardenResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }
    
    // Realizar soft delete
    await db.execute(HuertoQueries.softDelete, [gardenId]);
    
    // También hacer soft delete de las relaciones usuario-huerto
    await db.execute(`
      UPDATE usuario_huerto SET is_deleted = 1 WHERE huerto_id = ?
    `, [gardenId]);
    
    res.json({
      success: true,
      message: 'Huerto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar huerto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Registrar mantenimiento (crear alerta de tipo mantenimiento)
export const recordMaintenance = async (req, res) => {
  try {
    const { gardenId } = req.params;
    const { type, description, date, duration, technicianNotes } = req.body;
    const userId = req.user.id;
    
    // Verificar que el huerto existe
    const [gardenResult] = await db.execute(HuertoQueries.getById, [gardenId]);
    if (gardenResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }
    
    // Crear alerta de mantenimiento
    const maintenanceDate = new Date(date);
    const expirationDate = new Date(maintenanceDate.getTime() + (duration * 60000)); // duration en minutos
    
    const [alertResult] = await db.execute(AlertaQueries.create, [
      `Mantenimiento: ${type}`,
      `${description}\n\nNotas del técnico: ${technicianNotes || 'N/A'}\nDuración: ${duration} minutos`,
      'mantenimiento',
      'media',
      gardenId,
      userId,
      maintenanceDate,
      expirationDate,
      1,
      `Tipo: ${type} | Duración: ${duration} min`
    ]);
    
    // Obtener usuarios asignados al huerto para notificarles
    const [usersResult] = await db.execute(`
      SELECT usuario_id FROM usuario_huerto 
      WHERE huerto_id = ? AND is_deleted = 0
    `, [gardenId]);
    
    // Crear destinatarios para la alerta
    const alertId = alertResult.insertId;
    for (const user of usersResult) {
      await db.execute(`
        INSERT INTO alerta_destinatarios (id, alerta_id, usuario_id)
        VALUES (UUID(), ?, ?)
      `, [alertId, user.usuario_id]);
    }
    
    res.status(201).json({
      success: true,
      message: 'Mantenimiento registrado exitosamente',
      data: {
        alertId,
        type,
        description,
        date: maintenanceDate,
        duration,
        affectedUsers: usersResult.length
      }
    });
  } catch (error) {
    console.error('Error al registrar mantenimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener historial de mantenimiento
export const getMaintenanceHistory = async (req, res) => {
  try {
    const { gardenId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Verificar que el huerto existe
    const [gardenResult] = await db.execute(HuertoQueries.getById, [gardenId]);
    if (gardenResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }
    
    let query = `
      SELECT a.*, u.nombre as creador_nombre
      FROM alertas a
      LEFT JOIN usuarios u ON a.usuario_creador = u.id
      WHERE a.huerto_id = ? AND a.tipo = 'mantenimiento' AND a.is_deleted = 0
    `;
    
    const params = [gardenId];
    
    if (startDate) {
      query += ' AND a.fecha_programada >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND a.fecha_programada <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY a.fecha_programada DESC';
    
    const [maintenanceHistory] = await db.execute(query, params);
    
    res.json({
      success: true,
      data: maintenanceHistory,
      total: maintenanceHistory.length
    });
  } catch (error) {
    console.error('Error al obtener historial de mantenimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener plantas del huerto (datos de huerto)
export const getGardenPlants = async (req, res) => {
  try {
    const { gardenId } = req.params;
    
    // Verificar que el huerto existe
    const [gardenResult] = await db.execute(HuertoQueries.getById, [gardenId]);
    if (gardenResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }
    
    // Obtener datos del huerto (siembra, cosecha, etc.)
    const [gardenData] = await db.execute(`
      SELECT hd.*, u.nombre as registrador_nombre
      FROM huerto_data hd
      LEFT JOIN usuarios u ON hd.usuario_registro = u.id
      WHERE hd.huerto_id = ? AND hd.is_deleted = 0
      ORDER BY hd.fecha DESC
    `, [gardenId]);
    
    // Calcular estadísticas
    const stats = gardenData.reduce((acc, record) => {
      acc.total_siembra += record.cantidad_siembra || 0;
      acc.total_cosecha += record.cantidad_cosecha || 0;
      acc.total_agua += record.cantidad_agua || 0;
      acc.total_abono += record.cantidad_abono || 0;
      return acc;
    }, {
      total_siembra: 0,
      total_cosecha: 0,
      total_agua: 0,
      total_abono: 0
    });
    
    res.json({
      success: true,
      data: {
        records: gardenData,
        statistics: stats,
        total_records: gardenData.length
      }
    });
  } catch (error) {
    console.error('Error al obtener plantas del huerto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Asignar residente a huerto
export const assignResident = async (req, res) => {
  try {
    const { gardenId } = req.params;
    const { userId } = req.body;
    const adminId = req.user.id;
    const adminRole = req.user.role;
    
    console.log('🔍 assignResident - Parámetros:', { gardenId, userId, adminId, adminRole });

    // Verificar permisos del administrador
    if (adminRole !== 'administrador') {
      console.log('❌ assignResident - Usuario no es administrador:', adminRole);
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden asignar residentes a huertos'
      });
    }
    console.log('✅ assignResident - Usuario es administrador');

    // Verificar que el huerto existe
    console.log('🔍 assignResident - Verificando huerto:', gardenId);
    const [gardenResult] = await db.execute(HuertoQueries.getById, [gardenId]);
    console.log('🔍 assignResident - Resultado de huerto:', gardenResult);
    if (gardenResult.length === 0) {
      console.log('❌ assignResident - Huerto no encontrado');
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }

    const garden = gardenResult[0];
    console.log('✅ assignResident - Huerto encontrado:', garden);

    // Verificar que el administrador puede gestionar este huerto
    // (debe ser del mismo condominio o ser el creador)
    const [adminLocation] = await db.execute(
      'SELECT ubicacion_id FROM usuarios WHERE id = ? AND is_deleted = 0',
      [adminId]
    );

    if (adminLocation.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Administrador no encontrado'
      });
    }

    const adminLocationId = adminLocation[0].ubicacion_id;

    // Verificar que el huerto pertenece al mismo condominio que el administrador
    if (garden.ubicacion_id !== adminLocationId && garden.usuario_creador !== adminId) {
      return res.status(403).json({
        success: false,
        message: 'No puedes gestionar huertos de otros condominios'
      });
    }
    
    // Verificar que el usuario existe
    const [userResult] = await db.execute(UsuarioQueries.getById, [userId]);
    if (userResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const user = userResult[0];

    // Verificar que el usuario es residente
    if (user.rol !== 'residente') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden asignar residentes a huertos'
      });
    }

    // Verificar que el usuario pertenece al mismo condominio que el administrador
    if (user.ubicacion_id !== adminLocationId) {
      return res.status(403).json({
        success: false,
        message: 'Solo puedes asignar residentes de tu mismo condominio'
      });
    }
    
    // Verificar que no esté ya asignado (incluyendo registros eliminados)
    console.log('🔍 assignResident - Verificando asignaciones existentes');
    const [existingAssignment] = await db.execute(`
      SELECT * FROM usuario_huerto 
      WHERE usuario_id = ? AND huerto_id = ?
    `, [userId, gardenId]);
    
    console.log('🔍 assignResident - Asignaciones existentes:', existingAssignment);
    
    if (existingAssignment.length > 0) {
      const assignment = existingAssignment[0];
      
      // Si ya existe una asignación activa
      if (assignment.is_deleted === 0) {
        console.log('❌ assignResident - Usuario ya está asignado activamente');
        return res.status(400).json({
          success: false,
          message: 'El usuario ya está asignado a este huerto'
        });
      }
      
      // Si existe una asignación eliminada (soft delete), reactivarla
      console.log('🔄 assignResident - Reactivando asignación existente');
      await db.execute(`
        UPDATE usuario_huerto 
        SET is_deleted = 0, rol = ? 
        WHERE usuario_id = ? AND huerto_id = ?
      `, ['colaborador', userId, gardenId]);
      
      console.log('✅ assignResident - Asignación reactivada exitosamente');
      
      return res.json({
        success: true,
        message: 'Usuario reasignado al huerto exitosamente',
        data: {
          userId,
          gardenId,
          role: 'colaborador',
          action: 'reactivated'
        }
      });
    }
    
    // Verificar capacidad del huerto
    const currentUsers = await db.execute(`
      SELECT COUNT(*) as count FROM usuario_huerto 
      WHERE huerto_id = ? AND is_deleted = 0
    `, [gardenId]);
    
    if (currentUsers[0][0].count >= gardenResult[0].capacidad) {
      return res.status(400).json({
        success: false,
        message: 'El huerto ha alcanzado su capacidad máxima de usuarios'
      });
    }
    
    // Asignar usuario al huerto
    console.log('🔍 assignResident - Creando asignación usuario-huerto');
    console.log('🔍 assignResident - Query:', UsuarioHuertoQueries.create);
    console.log('🔍 assignResident - Parámetros:', [userId, gardenId, 'colaborador']);
    
    await db.execute(UsuarioHuertoQueries.create, [
      userId,
      gardenId,
      'colaborador'
    ]);
    
    console.log('✅ assignResident - Asignación creada exitosamente');
    
    res.json({
      success: true,
      message: 'Usuario asignado al huerto exitosamente',
      data: {
        userId,
        gardenId,
        role: 'colaborador'
      }
    });
  } catch (error) {
    console.error('Error al asignar residente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Registrar datos del huerto (agua, siembra, cosecha, etc.)
export const recordGardenData = async (req, res) => {
  try {
    const { gardenId } = req.params;
    const {
      fecha,
      cantidad_agua,
      cantidad_siembra,
      cantidad_cosecha,
      fecha_inicio,
      fecha_final,
      cantidad_abono,
      cantidad_plagas
    } = req.body;
    
    const userId = req.user.id;
    
    // Verificar que el huerto existe
    const [gardenResult] = await db.execute(HuertoQueries.getById, [gardenId]);
    if (gardenResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }
    
    // Verificar que el usuario tiene acceso al huerto
    const [userAccessResult] = await db.execute(`
      SELECT * FROM usuario_huerto 
      WHERE usuario_id = ? AND huerto_id = ? AND is_deleted = 0
    `, [userId, gardenId]);
    
    if (userAccessResult.length === 0 && req.user.rol !== 'administrador' && req.user.rol !== 'tecnico') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para registrar datos en este huerto'
      });
    }
    
    // Calcular total de días si se proporcionan fechas de inicio y final
    let total_dias = null;
    if (fecha_inicio && fecha_final) {
      const startDate = new Date(fecha_inicio);
      const endDate = new Date(fecha_final);
      const diffTime = Math.abs(endDate - startDate);
      total_dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    // Crear registro de datos del huerto
    const [result] = await db.execute(HuertoDataQueries.create, [
      gardenId,
      fecha,
      cantidad_agua || 0,
      cantidad_siembra || 0,
      cantidad_cosecha || 0,
      fecha_inicio || null,
      fecha_final || null,
      total_dias,
      cantidad_abono || 0,
      cantidad_plagas || 0,
      userId
    ]);
    
    const dataId = result.insertId;
    
    // Obtener el registro creado
    const [dataResult] = await db.execute(`
      SELECT hd.*, u.nombre as registrador_nombre
      FROM huerto_data hd
      LEFT JOIN usuarios u ON hd.usuario_registro = u.id
      WHERE hd.id = ?
    `, [dataId]);
    
    res.status(201).json({
      success: true,
      message: 'Datos del huerto registrados exitosamente',
      data: dataResult[0]
    });
  } catch (error) {
    console.error('Error al registrar datos del huerto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener huertos del usuario actual
export const getUserGardens = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let query;
    let params;
    
    if (userRole === 'administrador') {
      // Los administradores pueden ver todos los huertos de su condominio
      // Primero obtener la ubicación del administrador
      const [adminResult] = await db.execute(`
        SELECT ubicacion_id FROM usuarios WHERE id = ? AND is_deleted = 0
      `, [userId]);
      
      if (adminResult.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Administrador no encontrado'
        });
      }
      
      const adminLocationId = adminResult[0].ubicacion_id;
      
      query = `
        SELECT h.*, u.nombre as ubicacion_nombre, uc.nombre as creador_nombre,
               uh.rol as user_role, uh.fecha_union,
               CASE 
                 WHEN uh.usuario_id IS NOT NULL THEN uh.rol
                 WHEN h.usuario_creador = ? THEN 'propietario'
                 ELSE 'administrador'
               END as access_role
        FROM huertos h
        LEFT JOIN ubicaciones u ON h.ubicacion_id = u.id
        LEFT JOIN usuarios uc ON h.usuario_creador = uc.id
        LEFT JOIN usuario_huerto uh ON h.id = uh.huerto_id AND uh.usuario_id = ? AND uh.is_deleted = 0
        WHERE h.is_deleted = 0 AND h.ubicacion_id = ?
        ORDER BY h.created_at DESC
      `;
      params = [userId, userId, adminLocationId];
    } else {
      // Otros usuarios solo ven huertos donde están asignados
      query = `
        SELECT h.*, u.nombre as ubicacion_nombre, uc.nombre as creador_nombre,
               uh.rol as user_role, uh.fecha_union,
               uh.rol as access_role
        FROM huertos h
        INNER JOIN usuario_huerto uh ON h.id = uh.huerto_id AND uh.usuario_id = ? AND uh.is_deleted = 0
        LEFT JOIN ubicaciones u ON h.ubicacion_id = u.id
        LEFT JOIN usuarios uc ON h.usuario_creador = uc.id
        WHERE h.is_deleted = 0
        ORDER BY uh.fecha_union DESC
      `;
      params = [userId];
    }
    
    const [gardens] = await db.execute(query, params);
    
    res.json({
      success: true,
      data: gardens,
      total: gardens.length
    });
  } catch (error) {
    console.error('Error al obtener huertos del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Permitir que un residente se dé de baja de un huerto
export const unsubscribeFromGarden = async (req, res) => {
  try {
    const { gardenId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verificar que el usuario es residente
    if (userRole !== 'residente') {
      return res.status(403).json({
        success: false,
        message: 'Solo los residentes pueden darse de baja de huertos'
      });
    }

    // Verificar que el huerto existe
    const [gardenResult] = await db.execute(HuertoQueries.getById, [gardenId]);
    if (gardenResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }

    // Verificar que el usuario está asignado al huerto
    const [assignmentResult] = await db.execute(
      'SELECT * FROM usuario_huerto WHERE usuario_id = ? AND huerto_id = ? AND is_deleted = 0',
      [userId, gardenId]
    );

    if (assignmentResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No estás asignado a este huerto'
      });
    }

    // Eliminar la asignación (soft delete)
    await db.execute(
      'UPDATE usuario_huerto SET is_deleted = 1 WHERE usuario_id = ? AND huerto_id = ?',
      [userId, gardenId]
    );

    res.json({
      success: true,
      message: 'Te has dado de baja del huerto exitosamente',
      data: {
        userId,
        gardenId,
        action: 'unsubscribed'
      }
    });
  } catch (error) {
    console.error('Error al darse de baja del huerto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener residentes de un huerto (solo para administradores)
export const getGardenResidents = async (req, res) => {
  try {
    const { gardenId } = req.params;
    const adminId = req.user.id;
    const adminRole = req.user.role;

    // Verificar permisos del administrador
    if (adminRole !== 'administrador') {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden ver los residentes de huertos'
      });
    }

    // Verificar que el huerto existe
    const [gardenResult] = await db.execute(HuertoQueries.getById, [gardenId]);
    if (gardenResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }

    const garden = gardenResult[0];

    // Verificar que el administrador puede gestionar este huerto
    const [adminLocation] = await db.execute(
      'SELECT ubicacion_id FROM usuarios WHERE id = ? AND is_deleted = 0',
      [adminId]
    );

    if (adminLocation.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Administrador no encontrado'
      });
    }

    const adminLocationId = adminLocation[0].ubicacion_id;

    // Verificar que el huerto pertenece al mismo condominio que el administrador
    if (garden.ubicacion_id !== adminLocationId && garden.usuario_creador !== adminId) {
      return res.status(403).json({
        success: false,
        message: 'No puedes gestionar huertos de otros condominios'
      });
    }

    // Obtener residentes del huerto
    const [residents] = await db.execute(
      `SELECT 
         uh.id as assignment_id,
         uh.usuario_id,
         uh.rol as assignment_role,
         uh.created_at as assigned_at,
         u.nombre,
         u.email,
         u.telefono,
         u.rol as user_role
       FROM usuario_huerto uh
       LEFT JOIN usuarios u ON uh.usuario_id = u.id
       WHERE uh.huerto_id = ? AND uh.is_deleted = 0 AND u.is_deleted = 0
       ORDER BY uh.created_at DESC`,
      [gardenId]
    );

    res.json({
      success: true,
      data: residents,
      total: residents.length,
      garden: {
        id: garden.id,
        nombre: garden.nombre,
        capacidad: garden.capacidad
      }
    });
  } catch (error) {
    console.error('Error al obtener residentes del huerto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar residente de un huerto (solo para administradores)
export const checkUserGardenAssignment = async (req, res) => {
  try {
    const { gardenId, userId } = req.params;
    const requestingUserId = req.user.id;
    const requestingUserRole = req.user.role;

    console.log('🔍 checkUserGardenAssignment - Parámetros:', { gardenId, userId, requestingUserId, requestingUserRole });

    // Verificar que el huerto existe
    const [gardenResult] = await db.execute(HuertoQueries.getById, [gardenId]);
    if (gardenResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }

    const garden = gardenResult[0];

    // Si el usuario que solicita es administrador o técnico, puede verificar cualquier usuario
    // Si es el propio usuario, también puede verificar su estado
    if (requestingUserRole === 'administrador' || requestingUserRole === 'tecnico' || requestingUserId === userId) {
      const [assignmentResult] = await db.execute(
        'SELECT * FROM usuario_huerto WHERE usuario_id = ? AND huerto_id = ? AND is_deleted = 0',
        [userId, gardenId]
      );

      const isAssigned = assignmentResult.length > 0;

      res.json({
        success: true,
        data: {
          userId,
          gardenId,
          isAssigned,
          assignment: isAssigned ? assignmentResult[0] : null
        }
      });
    } else {
      res.status(403).json({
        success: false,
        message: 'No tienes permisos para verificar esta asignación'
      });
    }

  } catch (error) {
    console.error('Error verificando asignación usuario-huerto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

export const removeResident = async (req, res) => {
  try {
    const { gardenId, userId } = req.params;
    const adminId = req.user.id;
    const adminRole = req.user.role;

    console.log('🔍 removeResident - Parámetros:', { gardenId, userId, adminId, adminRole });

    // Verificar permisos del administrador
    if (adminRole !== 'administrador') {
      console.log('❌ removeResident - Usuario no es administrador:', adminRole);
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden eliminar residentes de huertos'
      });
    }

    console.log('✅ removeResident - Usuario es administrador');

    // Verificar que el huerto existe
    console.log('🔍 removeResident - Verificando huerto con query:', HuertoQueries.getById);
    const [gardenResult] = await db.execute(HuertoQueries.getById, [gardenId]);
    console.log('🔍 removeResident - Resultado de huerto:', gardenResult);
    
    if (gardenResult.length === 0) {
      console.log('❌ removeResident - Huerto no encontrado');
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }

    const garden = gardenResult[0];
    console.log('✅ removeResident - Huerto encontrado:', garden);

    // Verificar que el administrador puede gestionar este huerto
    console.log('🔍 removeResident - Verificando ubicación del administrador');
    const [adminLocation] = await db.execute(
      'SELECT ubicacion_id FROM usuarios WHERE id = ? AND is_deleted = 0',
      [adminId]
    );
    console.log('🔍 removeResident - Ubicación del administrador:', adminLocation);

    if (adminLocation.length === 0) {
      console.log('❌ removeResident - Administrador no encontrado');
      return res.status(404).json({
        success: false,
        message: 'Administrador no encontrado'
      });
    }

    const adminLocationId = adminLocation[0].ubicacion_id;
    console.log('🔍 removeResident - adminLocationId:', adminLocationId);

    // Verificar que el huerto pertenece al mismo condominio que el administrador
    if (garden.ubicacion_id !== adminLocationId && garden.usuario_creador !== adminId) {
      console.log('❌ removeResident - No puede gestionar huertos de otros condominios');
      console.log('🔍 removeResident - garden.ubicacion_id:', garden.ubicacion_id);
      console.log('🔍 removeResident - garden.usuario_creador:', garden.usuario_creador);
      return res.status(403).json({
        success: false,
        message: 'No puedes gestionar huertos de otros condominios'
      });
    }

    console.log('✅ removeResident - Permisos de condominio verificados');

    // Verificar que el usuario está asignado al huerto
    console.log('🔍 removeResident - Verificando asignación del usuario');
    const [assignmentResult] = await db.execute(
      'SELECT * FROM usuario_huerto WHERE usuario_id = ? AND huerto_id = ? AND is_deleted = 0',
      [userId, gardenId]
    );
    console.log('🔍 removeResident - Resultado de asignación:', assignmentResult);

    if (assignmentResult.length === 0) {
      console.log('❌ removeResident - Usuario no está asignado al huerto');
      return res.status(404).json({
        success: false,
        message: 'El usuario no está asignado a este huerto'
      });
    }

    console.log('✅ removeResident - Usuario está asignado al huerto');

    // Verificar que el usuario no es el propietario del huerto
    const assignment = assignmentResult[0];
    console.log('🔍 removeResident - Verificando rol del usuario:', assignment.assignment_role);
    
    if (assignment.assignment_role === 'propietario') {
      console.log('❌ removeResident - No se puede eliminar al propietario del huerto');
      return res.status(403).json({
        success: false,
        message: 'No se puede eliminar al propietario del huerto'
      });
    }

    console.log('✅ removeResident - Usuario no es propietario, procediendo con la eliminación');

    // Eliminar la asignación (soft delete)
    console.log('🔍 removeResident - Eliminando asignación (soft delete)');
    await db.execute(
      'UPDATE usuario_huerto SET is_deleted = 1 WHERE usuario_id = ? AND huerto_id = ?',
      [userId, gardenId]
    );

    console.log('✅ removeResident - Asignación eliminada exitosamente');

    res.json({
      success: true,
      message: 'Residente eliminado del huerto exitosamente',
      data: {
        userId,
        gardenId,
        action: 'removed'
      }
    });
  } catch (error) {
    console.error('Error al eliminar residente del huerto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};
