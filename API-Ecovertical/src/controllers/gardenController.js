import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { GardenQueries } from '../utils/queries/index.js';
import { UbicacionQueries, UsuarioQueries } from '../utils/queries.js';

// Listar huertos con filtros
export const listGardens = async (req, res) => {
  try {
    const { type, status } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    console.log('🔍 listGardens - Parámetros:', { userId, userRole, type, status });
    
    // Obtener la ubicación del usuario para filtrar huertos públicos
    const userResult = await db.query(GardenQueries.checkUserExists, [userId]);
    
    if (userResult.rows.length === 0) {
      console.log('❌ Usuario no encontrado:', userId);
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    const userLocationId = userResult.rows[0].ubicacion_id;
    console.log('📍 Ubicación del usuario:', userLocationId);
    
    // Usar la query centralizada para listar huertos con acceso
    const gardens = await db.query(GardenQueries.listWithAccess, [userId, userLocationId, userRole]);
    
    console.log('✅ Huertos encontrados:', gardens.rows.length);
    gardens.rows.forEach(garden => {
      console.log(`  - ${garden.nombre} (${garden.tipo}) - Acceso: ${garden.access_type}`);
    });
    
    res.json({
      success: true,
      data: gardens.rows,
      total: gardens.rows.length
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
    const locationResult = await db.query(GardenQueries.checkLocationExists, [location]);
    if (locationResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La ubicación especificada no existe'
      });
    }
    
    // Para huertos públicos, verificar permisos según el rol del usuario
    if (gardenType === 'publico') {
      const userResult = await db.query(GardenQueries.checkUserExists, [userId]);
      
      console.log('🔍 Debug - Creando huerto público:', {
        userId,
        userLocationId: userResult.rows[0]?.ubicacion_id,
        requestedLocationId: location,
        userExists: userResult.rows.length > 0,
        userRole
      });
      
      if (userResult.rows.length === 0) {
        console.log('❌ Error - Usuario no encontrado');
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      // Los administradores pueden crear huertos públicos en cualquier ubicación
      // Los residentes y técnicos solo pueden crear en su propio condominio
      if (userRole !== 'administrador' && userResult.rows[0].ubicacion_id !== location) {
        console.log('❌ Error - Usuario no puede crear huerto público:', {
          reason: 'Ubicación no coincide',
          userLocationId: userResult.rows[0]?.ubicacion_id,
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
      const userResult = await db.query(GardenQueries.checkUserExists, [userId]);
      
      console.log('🔍 Debug - Creando huerto privado:', {
        userId,
        userLocationId: userResult.rows[0]?.ubicacion_id,
        requestedLocationId: location,
        userExists: userResult.rows.length > 0
      });
      
      if (userResult.rows.length === 0) {
        console.log('❌ Error - Usuario no encontrado');
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      // Para huertos privados, el usuario puede crear en cualquier ubicación,
      // pero si no tiene ubicación asignada, usar la ubicación por defecto
      if (!userResult.rows[0].ubicacion_id && location) {
        console.log('⚠️ Warning - Usuario sin ubicación asignada, usando ubicación proporcionada');
      }
    }
    
    // Crear el huerto
    const gardenId = uuidv4();
    await db.query(GardenQueries.create, [
      gardenId,
      name,
      description || '',
      gardenType,
      dimensions,
      plantCapacity,
      location,
      userId,
      null // imagen_url por defecto
    ]);
    
    // Obtener el huerto recién creado
    const gardenResult = await db.query(GardenQueries.getRecentlyCreated, [name, userId]);
    
    const createdGardenId = gardenResult.rows[0].id;
    
    // Asignar automáticamente al creador como propietario
    const assignmentId = uuidv4();
    await db.query(GardenQueries.createUserGardenAssignment, [
      assignmentId,
      userId,
      createdGardenId,
      'propietario'
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Huerto creado exitosamente',
      data: gardenResult.rows[0]
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
    const gardenResult = await db.query(GardenQueries.getByIdWithDetails, [userId, gardenId]);
    
    if (gardenResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }
    
    const garden = gardenResult.rows[0];
    
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
    const usersResult = await db.query(GardenQueries.getGardenUsers, [gardenId]);
    
    // Obtener estadísticas básicas
    const statsResult = await db.query(GardenQueries.getGardenStats, [gardenId]);
    
    garden.usuarios_asignados = usersResult.rows;
    garden.estadisticas = statsResult.rows[0];
    
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
    const gardenResult = await db.query(GardenQueries.getById, [gardenId]);
    if (gardenResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }
    
    // Verificar permisos (solo admin, técnico o creador del huerto pueden actualizar)
    const garden = gardenResult.rows[0];
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
      const locationResult = await db.query(GardenQueries.checkLocationExists, [updateData.location]);
      if (locationResult.rows.length === 0) {
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
      updateFields.push('nombre');
      updateValues.push(updateData.name);
    }
    if (updateData.description !== undefined) {
      updateFields.push('descripcion');
      updateValues.push(updateData.description);
    }
    if (updateData.type) {
      updateFields.push('tipo');
      updateValues.push(updateData.type);
    }
    if (updateData.dimensions) {
      updateFields.push('superficie');
      updateValues.push(updateData.dimensions);
    }
    if (updateData.plantCapacity) {
      updateFields.push('capacidad');
      updateValues.push(updateData.plantCapacity);
    }
    if (updateData.location) {
      updateFields.push('ubicacion_id');
      updateValues.push(updateData.location);
    }
    if (updateData.imageUrl !== undefined) {
      updateFields.push('imagen_url');
      updateValues.push(updateData.imageUrl);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron campos para actualizar'
      });
    }
    
    updateValues.push(gardenId);
    
    const updateQuery = GardenQueries.buildUpdateQuery(updateFields);
    await db.query(updateQuery, updateValues);
    
    // Obtener el huerto actualizado
    const updatedGarden = await db.query(GardenQueries.getRecentlyCreated, [garden.nombre, garden.usuario_creador]);
    
    res.json({
      success: true,
      message: 'Huerto actualizado exitosamente',
      data: updatedGarden.rows[0]
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
    const gardenResult = await db.query(GardenQueries.getById, [gardenId]);
    if (gardenResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }
    
    // Realizar soft delete
    await db.query(GardenQueries.softDelete, [gardenId]);
    
    // También hacer soft delete de las relaciones usuario-huerto
    await db.query(GardenQueries.removeAllUsersFromGarden, [gardenId]);
    
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
    const gardenResult = await db.query(GardenQueries.getById, [gardenId]);
    if (gardenResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }
    
    // Crear alerta de mantenimiento
    const maintenanceDate = new Date(date);
    const expirationDate = new Date(maintenanceDate.getTime() + (duration * 60000)); // duration en minutos
    
    const alertId = uuidv4();
    await db.query(GardenQueries.createMaintenanceAlert, [
      alertId,
      `Mantenimiento: ${type}`,
      `${description}\n\nNotas del técnico: ${technicianNotes || 'N/A'}\nDuración: ${duration} minutos`,
      'mantenimiento',
      'media',
      gardenId,
      userId,
      maintenanceDate,
      expirationDate,
      true,
      `Tipo: ${type} | Duración: ${duration} min`
    ]);
    
    // Obtener usuarios asignados al huerto para notificarles
    const usersResult = await db.query(GardenQueries.getGardenUsersForNotifications, [gardenId]);
    
    // Crear destinatarios para la alerta
    for (const user of usersResult.rows) {
      const recipientId = uuidv4();
      await db.query(GardenQueries.createAlertRecipients, [
        recipientId,
        alertId,
        user.usuario_id
      ]);
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
        affectedUsers: usersResult.rows.length
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
    const gardenResult = await db.query(GardenQueries.getById, [gardenId]);
    if (gardenResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }
    
    // Obtener historial de mantenimiento
    let maintenanceHistory;
    if (startDate || endDate) {
      maintenanceHistory = await db.query(GardenQueries.getMaintenanceHistoryWithDates, [gardenId, startDate, endDate]);
    } else {
      maintenanceHistory = await db.query(GardenQueries.getMaintenanceHistory, [gardenId]);
    }
    
    res.json({
      success: true,
      data: maintenanceHistory.rows,
      total: maintenanceHistory.rows.length
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
    const gardenResult = await db.query(GardenQueries.getById, [gardenId]);
    if (gardenResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }
    
    // Obtener datos del huerto (siembra, cosecha, etc.)
    const gardenDataResult = await db.query(GardenQueries.getGardenData, [gardenId]);
    
    // Calcular estadísticas
    const stats = gardenDataResult.rows.reduce((acc, record) => {
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
        records: gardenDataResult.rows,
        statistics: stats,
        total_records: gardenDataResult.rows.length
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
    const gardenResult = await db.query(GardenQueries.getById, [gardenId]);
    if (gardenResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }

    const garden = gardenResult.rows[0];

    // Verificar que el administrador puede gestionar este huerto
    const adminLocationResult = await db.query(GardenQueries.checkUserExists, [adminId]);
    if (adminLocationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Administrador no encontrado'
      });
    }

    const adminLocationId = adminLocationResult.rows[0].ubicacion_id;

    // Verificar que el huerto pertenece al mismo condominio que el administrador
    if (garden.ubicacion_id !== adminLocationId && garden.usuario_creador !== adminId) {
      return res.status(403).json({
        success: false,
        message: 'No puedes gestionar huertos de otros condominios'
      });
    }
    
    // Verificar que el usuario existe
    const userResult = await db.query(GardenQueries.getUserInfo, [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const user = userResult.rows[0];

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
    const existingAssignmentResult = await db.query(GardenQueries.checkExistingAssignment, [userId, gardenId]);
    
    if (existingAssignmentResult.rows.length > 0) {
      const assignment = existingAssignmentResult.rows[0];
      
      // Si ya existe una asignación activa
      if (assignment.is_deleted === false) {
        return res.status(400).json({
          success: false,
          message: 'El usuario ya está asignado a este huerto'
        });
      }
      
      // Si existe una asignación eliminada (soft delete), reactivarla
      await db.query(GardenQueries.reactivateAssignment, ['colaborador', userId, gardenId]);
      
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
    const currentUsersResult = await db.query(GardenQueries.countGardenUsers, [gardenId]);
    
    if (currentUsersResult.rows[0].count >= garden.capacidad) {
      return res.status(400).json({
        success: false,
        message: 'El huerto ha alcanzado su capacidad máxima de usuarios'
      });
    }
    
    // Asignar usuario al huerto
    await db.query(GardenQueries.createUserGardenAssignment, [uuidv4(), userId, gardenId, 'colaborador']);
    
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
    const gardenResult = await db.query(GardenQueries.getById, [gardenId]);
    if (gardenResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }
    
    // Verificar que el usuario tiene acceso al huerto
    const userAccessResult = await db.query(GardenQueries.checkUserGardenAccess, [userId, gardenId]);
    
    if (userAccessResult.rows.length === 0 && req.user.rol !== 'administrador' && req.user.rol !== 'tecnico') {
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
    const dataId = uuidv4();
    await db.query(GardenQueries.createGardenData, [
      dataId,
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
    
    // Obtener el registro creado
    const dataResult = await db.query(`
      SELECT hd.*, u.nombre as registrador_nombre
      FROM huerto_data hd
      LEFT JOIN usuarios u ON hd.usuario_registro = u.id
      WHERE hd.id = $1
    `, [dataId]);
    
    res.status(201).json({
      success: true,
      message: 'Datos del huerto registrados exitosamente',
      data: dataResult.rows[0]
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
    
    let gardens;
    
    if (userRole === 'administrador') {
      // Los administradores pueden ver todos los huertos de su condominio
      // Primero obtener la ubicación del administrador
      const adminResult = await db.query(GardenQueries.checkUserExists, [userId]);
      
      if (adminResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Administrador no encontrado'
        });
      }
      
      const adminLocationId = adminResult.rows[0].ubicacion_id;
      
      gardens = await db.query(GardenQueries.getUserGardens, [userId, userId, adminLocationId]);
    } else {
      // Otros usuarios solo ven huertos donde están asignados
      gardens = await db.query(GardenQueries.getUserAssignedGardens, [userId]);
    }
    
    res.json({
      success: true,
      data: gardens.rows,
      total: gardens.rows.length
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
    const gardenResult = await db.query(GardenQueries.getById, [gardenId]);
    if (gardenResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }

    // Verificar que el usuario está asignado al huerto
    const assignmentResult = await db.query(GardenQueries.checkUserGardenAssignment, [userId, gardenId]);

    if (assignmentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No estás asignado a este huerto'
      });
    }

    // Eliminar la asignación (soft delete)
    await db.query(`
      UPDATE usuario_huerto SET is_deleted = true WHERE usuario_id = $1 AND huerto_id = $2
    `, [userId, gardenId]);

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
    const gardenResult = await db.query(GardenQueries.getById, [gardenId]);
    if (gardenResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }

    const garden = gardenResult.rows[0];

    // Verificar que el administrador puede gestionar este huerto
    const adminLocationResult = await db.query(GardenQueries.checkUserExists, [adminId]);

    if (adminLocationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Administrador no encontrado'
      });
    }

    const adminLocationId = adminLocationResult.rows[0].ubicacion_id;

    // Verificar que el huerto pertenece al mismo condominio que el administrador
    if (garden.ubicacion_id !== adminLocationId && garden.usuario_creador !== adminId) {
      return res.status(403).json({
        success: false,
        message: 'No puedes gestionar huertos de otros condominios'
      });
    }

    // Obtener residentes del huerto
    const residentsResult = await db.query(GardenQueries.getGardenResidents, [gardenId]);

    res.json({
      success: true,
      data: residentsResult.rows,
      total: residentsResult.rows.length,
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
    const gardenResult = await db.query(GardenQueries.getById, [gardenId]);
    if (gardenResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }

    const garden = gardenResult.rows[0];

    // Si el usuario que solicita es administrador o técnico, puede verificar cualquier usuario
    // Si es el propio usuario, también puede verificar su estado
    if (requestingUserRole === 'administrador' || requestingUserRole === 'tecnico' || requestingUserId === userId) {
      const assignmentResult = await db.query(GardenQueries.checkUserGardenAssignment, [userId, gardenId]);

      const isAssigned = assignmentResult.rows.length > 0;

      res.json({
        success: true,
        data: {
          userId,
          gardenId,
          isAssigned,
          assignment: isAssigned ? assignmentResult.rows[0] : null
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
    const gardenResult = await db.query(GardenQueries.getById, [gardenId]);
    
    if (gardenResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }

    const garden = gardenResult.rows[0];

    // Verificar que el administrador puede gestionar este huerto
    const adminLocationResult = await db.query(GardenQueries.checkUserExists, [adminId]);

    if (adminLocationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Administrador no encontrado'
      });
    }

    const adminLocationId = adminLocationResult.rows[0].ubicacion_id;

    // Verificar que el huerto pertenece al mismo condominio que el administrador
    if (garden.ubicacion_id !== adminLocationId && garden.usuario_creador !== adminId) {
      return res.status(403).json({
        success: false,
        message: 'No puedes gestionar huertos de otros condominios'
      });
    }

    // Verificar que el usuario está asignado al huerto
    const assignmentResult = await db.query(GardenQueries.checkUserGardenAssignment, [userId, gardenId]);

    if (assignmentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'El usuario no está asignado a este huerto'
      });
    }

    // Verificar que el usuario no es el propietario del huerto
    const assignment = assignmentResult.rows[0];
    
    if (assignment.rol === 'propietario') {
      return res.status(403).json({
        success: false,
        message: 'No se puede eliminar al propietario del huerto'
      });
    }

    // Eliminar la asignación (soft delete)
    await db.query(`
      UPDATE usuario_huerto SET is_deleted = true WHERE usuario_id = $1 AND huerto_id = $2
    `, [userId, gardenId]);

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
