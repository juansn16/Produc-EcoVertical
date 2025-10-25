import db from '../config/db.js';
import irrigationAlertService from '../services/irrigationAlertService.js';
import { IrrigationAlertQueries } from '../utils/queries/index.js';

/**
 * Crear una nueva alerta de riego
 * Solo accesible para administradores y técnicos
 */
export const createIrrigationAlert = async (req, res, next) => {
  try {
    const { huerto_id, descripcion, fecha_alerta, hora_alerta } = req.body;
    const creado_por = req.user.id;

    // Validar que el usuario tenga permisos (admin o técnico)
    if (!['administrador', 'tecnico'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Solo administradores y técnicos pueden crear alertas de riego'
      });
    }

    // Validar que la fecha y hora no sean en el pasado
    const alertDateTime = new Date(`${fecha_alerta}T${hora_alerta}:00`);
    const now = new Date();
    
    console.log('🕐 Validación de fecha:', {
      fecha_alerta,
      hora_alerta,
      alertDateTime: alertDateTime.toISOString(),
      now: now.toISOString(),
      isValid: alertDateTime > now
    });
    
    if (alertDateTime <= now) {
      return res.status(400).json({
        success: false,
        message: 'La fecha y hora de la alerta no pueden ser en el pasado'
      });
    }

    // Verificar que el huerto existe
    const huertosResult = await db.query(IrrigationAlertQueries.checkGardenExists, [huerto_id]);

    if (huertosResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }

    const huerto = huertosResult.rows[0];

    // Crear la alerta
    const result = await db.query(IrrigationAlertQueries.createIrrigationAlert, 
      [huerto_id, descripcion, fecha_alerta, hora_alerta, creado_por]
    );

    const alertId = result.rows[0].id;

    // Crear notificaciones
    try {
      // Notificar a todos los residentes del huerto (propietario, colaboradores, visitantes)
      await irrigationAlertService.notifyGardenResidents(
        alertId,
        huerto.id,
        huerto.nombre,
        descripcion,
        req.user.name
      );

      // Notificar a administradores y técnicos
      await irrigationAlertService.notifyAdminsAndTechnicians(
        alertId,
        huerto.nombre,
        req.user.name,
        req.user.id
      );

    } catch (notificationError) {
      console.error('Error creando notificaciones:', notificationError);
      // No fallar la creación de la alerta por errores de notificación
    }

    res.status(201).json({
      success: true,
      message: 'Alerta de riego creada exitosamente',
      data: {
        id: alertId,
        huerto_id,
        descripcion,
        fecha_alerta,
        hora_alerta,
        estado: 'activa',
        huerto_nombre: huerto.nombre
      }
    });

  } catch (error) {
    console.error('Error creando alerta de riego:', error);
    next(error);
  }
};

/**
 * Obtener todas las alertas de riego
 * Solo accesible para administradores y técnicos
 */
export const getAllIrrigationAlerts = async (req, res, next) => {
  try {
    // Validar permisos
    if (!['administrador', 'tecnico'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Solo administradores y técnicos pueden ver todas las alertas'
      });
    }

    const { page = 1, limit = 10, estado = 'activa' } = req.query;
    const offset = (page - 1) * limit;

    // Obtener alertas con información del huerto y creador
    const alertsResult = await db.query(IrrigationAlertQueries.getAllIrrigationAlerts, 
      [estado, parseInt(limit), parseInt(offset)]
    );

    // Contar total de alertas
    const countResult = await db.query(IrrigationAlertQueries.countIrrigationAlerts, [estado]);

    const total = countResult.rows[0].total;

    res.json({
      success: true,
      data: {
        alerts: alertsResult.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo alertas de riego:', error);
    next(error);
  }
};

/**
 * Obtener alertas de riego para un usuario específico
 * Muestra alertas de huertos que pertenecen al usuario
 */
export const getUserIrrigationAlerts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Obtener alertas de huertos del usuario
    const alertsResult = await db.query(IrrigationAlertQueries.getUserIrrigationAlerts, 
      [userId, parseInt(limit), parseInt(offset)]
    );

    // Contar total
    const countResult = await db.query(IrrigationAlertQueries.countUserIrrigationAlerts, [userId]);

    const total = countResult.rows[0].total;

    res.json({
      success: true,
      data: {
        alerts: alertsResult.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo alertas del usuario:', error);
    next(error);
  }
};

/**
 * Obtener una alerta específica por ID
 */
export const getIrrigationAlertById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Obtener la alerta
    const alertsResult = await db.query(IrrigationAlertQueries.getIrrigationAlertById, [id]);

    if (alertsResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Alerta no encontrada'
      });
    }

    const alert = alertsResult.rows[0];

    // Verificar permisos: admin/tecnico pueden ver todas, usuarios solo las de sus huertos
    if (!['administrador', 'tecnico'].includes(userRole) && alert.propietario_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver esta alerta'
      });
    }

    res.json({
      success: true,
      data: alert
    });

  } catch (error) {
    console.error('Error obteniendo alerta:', error);
    next(error);
  }
};

/**
 * Actualizar el estado de una alerta
 */
export const updateIrrigationAlertStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validar estado
    if (!['activa', 'completada', 'cancelada'].includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido'
      });
    }

    // Obtener la alerta
    const alertsResult = await db.query(IrrigationAlertQueries.getIrrigationAlertWithOwner, [id]);

    if (alertsResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Alerta no encontrada'
      });
    }

    const alert = alertsResult.rows[0];

    // Verificar permisos
    if (!['administrador', 'tecnico'].includes(userRole) && alert.propietario_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para modificar esta alerta'
      });
    }

    // Actualizar estado
    await db.query(IrrigationAlertQueries.updateIrrigationAlertStatus, [estado, id]);

    // Si la alerta se marca como completada, notificar a los residentes del huerto
    if (estado === 'completada') {
      try {
        // Obtener información del huerto
        const huertoInfoResult = await db.query(IrrigationAlertQueries.getGardenInfo, [alert.huerto_id]);

        if (huertoInfoResult.rows.length > 0) {
          const huerto = huertoInfoResult.rows[0];
          
          // Verificar si hay usuarios conectados o colaboradores antes de notificar completado
          const hasConnectedUsers = await irrigationAlertService.checkIfUsersAreConnected(huerto.id);
          
          if (hasConnectedUsers) {
            // Notificar a todos los residentes del huerto sobre la finalización
            await irrigationAlertService.notifyAlertCompletion(
              id,
              huerto.id,
              huerto.nombre,
              alert.descripcion,
              req.user.name
            );
            console.log(`📢 Notificación de completado manual enviada para alerta ${id} - hay usuarios conectados`);
          } else {
            console.log(`⏭️ No se envió notificación de completado manual para alerta ${id} - no hay usuarios conectados ni colaboradores`);
          }
        }
      } catch (notificationError) {
        console.error('Error enviando notificación de completado:', notificationError);
        // No fallar la actualización por errores de notificación
      }
    }

    res.json({
      success: true,
      message: 'Estado de alerta actualizado exitosamente',
      data: { id, estado }
    });

  } catch (error) {
    console.error('Error actualizando estado de alerta:', error);
    next(error);
  }
};

/**
 * Eliminar una alerta de riego
 */
export const deleteIrrigationAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Obtener la alerta
    const alertsResult = await db.query(IrrigationAlertQueries.getIrrigationAlertWithOwner, [id]);

    if (alertsResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Alerta no encontrada'
      });
    }

    const alert = alertsResult.rows[0];

    // Solo administradores pueden eliminar alertas
    if (userRole !== 'administrador') {
      return res.status(403).json({
        success: false,
        message: 'Solo administradores pueden eliminar alertas'
      });
    }

    // Eliminar la alerta (las notificaciones se eliminan por CASCADE)
    await db.query(IrrigationAlertQueries.deleteIrrigationAlert, [id]);

    res.json({
      success: true,
      message: 'Alerta eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando alerta:', error);
    next(error);
  }
};

/**
 * Obtener estadísticas del sistema de alertas
 * Filtra por condominio del usuario autenticado
 */
export const getIrrigationAlertStats = async (req, res, next) => {
  try {
    // Solo administradores pueden ver estadísticas
    if (req.user.role !== 'administrador') {
      return res.status(403).json({
        success: false,
        message: 'Solo administradores pueden ver estadísticas'
      });
    }

    const userId = req.user.id;

    // Obtener la ubicación del usuario autenticado
    const userLocationResult = await db.query(IrrigationAlertQueries.getUserLocation, [userId]);

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

    // Estadísticas de alertas (filtradas por condominio)
    const alertStatsResult = await db.query(IrrigationAlertQueries.getAlertStatsByLocation, [userLocationId]);

    // Estadísticas de notificaciones (filtradas por condominio)
    const notificationStatsResult = await db.query(IrrigationAlertQueries.getNotificationStatsByLocation, [userLocationId]);

    // Estadísticas adicionales: alertas vencidas (basado en notificaciones, filtradas por condominio)
    const vencidaStatsResult = await db.query(IrrigationAlertQueries.getExpiredAlertStatsByLocation, [userLocationId]);

    // Usuarios conectados (filtrados por condominio) - contar usuarios únicos
    const onlineUsersResult = await db.query(IrrigationAlertQueries.getOnlineUsersByLocation, [userLocationId]);

    // Estadísticas del servicio WebSocket
    const serviceStats = irrigationAlertService.getStats();

    res.json({
      success: true,
      data: {
        alerts: alertStatsResult.rows,
        notifications: notificationStatsResult.rows,
        alertasVencidas: vencidaStatsResult.rows[0].cantidad,
        onlineUsers: onlineUsersResult.rows[0].cantidad,
        condominio: userLocationId,
        serviceStats
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    next(error);
  }
};

/**
 * Probar notificación WebSocket (para debugging)
 * Solo accesible para administradores y técnicos
 */
export const testWebSocketNotification = async (req, res, next) => {
  try {
    const { userId, message } = req.body;

    // Validar que el usuario tenga permisos (admin o técnico)
    if (!['administrador', 'tecnico'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Solo administradores y técnicos pueden probar notificaciones'
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el ID del usuario'
      });
    }

    const result = await irrigationAlertService.testWebSocketNotification(
      userId, 
      message || 'Prueba de notificación WebSocket'
    );

    res.json({
      success: result,
      message: result ? 'Notificación de prueba enviada' : 'Usuario no está en línea'
    });

  } catch (error) {
    console.error('Error probando notificación WebSocket:', error);
    next(error);
  }
};

/**
 * Obtener usuarios conectados en tiempo real
 * Solo accesible para administradores y técnicos
 * Filtra por condominio del usuario autenticado
 */
export const getConnectedUsers = async (req, res, next) => {
  try {
    // Validar que el usuario tenga permisos (admin o técnico)
    if (!['administrador', 'tecnico'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Solo administradores y técnicos pueden ver usuarios conectados'
      });
    }

    const userId = req.user.id;

    // Obtener la ubicación del usuario autenticado
    const userLocationResult = await db.query(IrrigationAlertQueries.getUserLocation, [userId]);

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

    // Debug: Verificar estado de la tabla usuarios_conectados
    console.log(`🔍 Debug - Usuario autenticado: ${userId}, Condominio: ${userLocationId}`);
    
    // Verificar si hay registros en la tabla usuarios_conectados
    const debugResult = await db.query(
      `SELECT COUNT(*) as total FROM usuarios_conectados`
    );
    console.log(`📊 Total registros en usuarios_conectados: ${debugResult.rows[0].total}`);

    // Verificar registros del usuario actual
    const userDebugResult = await db.query(
      `SELECT * FROM usuarios_conectados WHERE usuario_id = $1`,
      [userId]
    );
    console.log(`👤 Registros del usuario actual: ${userDebugResult.rows.length}`);

    // Obtener usuarios conectados del mismo condominio desde el servicio
    const connectedUsers = await irrigationAlertService.getConnectedUsers(userLocationId);

    res.json({
      success: true,
      data: {
        connectedUsers,
        totalConnections: connectedUsers.length,
        uniqueUsers: [...new Set(connectedUsers.map(u => u.usuario_id))].length,
        condominio: userLocationId,
        timestamp: new Date().toISOString(),
        debug: {
          totalRecordsInTable: debugResult.rows[0].total,
          currentUserRecords: userDebugResult.rows.length,
          serviceStats: irrigationAlertService.getStats()
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo usuarios conectados:', error);
    next(error);
  }
};