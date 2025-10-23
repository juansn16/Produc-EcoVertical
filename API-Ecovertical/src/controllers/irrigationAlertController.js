import db from '../config/db.js';
import irrigationAlertService from '../services/irrigationAlertService.js';

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
    
    if (alertDateTime <= now) {
      return res.status(400).json({
        success: false,
        message: 'La fecha y hora de la alerta no pueden ser en el pasado'
      });
    }

    // Verificar que el huerto existe
    const [huertos] = await db.execute(
      'SELECT id, nombre, usuario_creador FROM huertos WHERE id = ?',
      [huerto_id]
    );

    if (huertos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }

    const huerto = huertos[0];

    // Crear la alerta
    const [result] = await db.execute(
      `INSERT INTO alertas_riego (huerto_id, descripcion, fecha_alerta, hora_alerta, creado_por) 
       VALUES (?, ?, ?, ?, ?)`,
      [huerto_id, descripcion, fecha_alerta, hora_alerta, creado_por]
    );

    const alertId = result.insertId;

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
    const [alerts] = await db.execute(
      `SELECT ar.id, ar.huerto_id, ar.descripcion, ar.fecha_alerta, ar.hora_alerta,
              ar.estado, ar.fecha_creacion, ar.fecha_actualizacion,
              h.nombre as huerto_nombre, h.usuario_creador as propietario_id,
              u.nombre as creado_por_nombre, u.email as creado_por_email
       FROM alertas_riego ar
       JOIN huertos h ON ar.huerto_id COLLATE utf8mb4_unicode_ci = h.id COLLATE utf8mb4_unicode_ci
       JOIN usuarios u ON ar.creado_por COLLATE utf8mb4_unicode_ci = u.id COLLATE utf8mb4_unicode_ci
       WHERE ar.estado = ?
       ORDER BY ar.fecha_creacion DESC, ar.fecha_alerta DESC, ar.hora_alerta DESC
       LIMIT ? OFFSET ?`,
      [estado, parseInt(limit), parseInt(offset)]
    );

    // Contar total de alertas
    const [countResult] = await db.execute(
      'SELECT COUNT(*) as total FROM alertas_riego WHERE estado = ?',
      [estado]
    );

    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        alerts,
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
    const [alerts] = await db.execute(
      `SELECT ar.id, ar.huerto_id, ar.descripcion, ar.fecha_alerta, ar.hora_alerta,
              ar.estado, ar.fecha_creacion,
              h.nombre as huerto_nombre
       FROM alertas_riego ar
       JOIN huertos h ON ar.huerto_id COLLATE utf8mb4_unicode_ci = h.id COLLATE utf8mb4_unicode_ci
       WHERE h.usuario_creador = ?
       ORDER BY ar.fecha_alerta ASC, ar.hora_alerta ASC
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    // Contar total
    const [countResult] = await db.execute(
      `SELECT COUNT(*) as total 
       FROM alertas_riego ar
       JOIN huertos h ON ar.huerto_id COLLATE utf8mb4_unicode_ci = h.id COLLATE utf8mb4_unicode_ci
       WHERE h.usuario_creador = ?`,
      [userId]
    );

    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        alerts,
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
    const [alerts] = await db.execute(
      `SELECT ar.id, ar.huerto_id, ar.descripcion, ar.fecha_alerta, ar.hora_alerta,
              ar.estado, ar.fecha_creacion, ar.fecha_actualizacion,
              h.nombre as huerto_nombre, h.usuario_creador as propietario_id,
              u.nombre as creado_por_nombre, u.email as creado_por_email
       FROM alertas_riego ar
       JOIN huertos h ON ar.huerto_id COLLATE utf8mb4_unicode_ci = h.id COLLATE utf8mb4_unicode_ci
       JOIN usuarios u ON ar.creado_por COLLATE utf8mb4_unicode_ci = u.id COLLATE utf8mb4_unicode_ci
       WHERE ar.id = ?`,
      [id]
    );

    if (alerts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Alerta no encontrada'
      });
    }

    const alert = alerts[0];

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
    const [alerts] = await db.execute(
      `SELECT ar.*, h.usuario_creador as propietario_id 
       FROM alertas_riego ar
       JOIN huertos h ON ar.huerto_id COLLATE utf8mb4_unicode_ci = h.id COLLATE utf8mb4_unicode_ci
       WHERE ar.id = ?`,
      [id]
    );

    if (alerts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Alerta no encontrada'
      });
    }

    const alert = alerts[0];

    // Verificar permisos
    if (!['administrador', 'tecnico'].includes(userRole) && alert.propietario_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para modificar esta alerta'
      });
    }

    // Actualizar estado
    await db.execute(
      'UPDATE alertas_riego SET estado = ?, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?',
      [estado, id]
    );

    // Si la alerta se marca como completada, notificar a los residentes del huerto
    if (estado === 'completada') {
      try {
        // Obtener información del huerto
        const [huertoInfo] = await db.execute(
          'SELECT id, nombre FROM huertos WHERE id = ?',
          [alert.huerto_id]
        );

        if (huertoInfo.length > 0) {
          const huerto = huertoInfo[0];
          
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
    const [alerts] = await db.execute(
      `SELECT ar.*, h.usuario_creador as propietario_id 
       FROM alertas_riego ar
       JOIN huertos h ON ar.huerto_id COLLATE utf8mb4_unicode_ci = h.id COLLATE utf8mb4_unicode_ci
       WHERE ar.id = ?`,
      [id]
    );

    if (alerts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Alerta no encontrada'
      });
    }

    const alert = alerts[0];

    // Solo administradores pueden eliminar alertas
    if (userRole !== 'administrador') {
      return res.status(403).json({
        success: false,
        message: 'Solo administradores pueden eliminar alertas'
      });
    }

    // Eliminar la alerta (las notificaciones se eliminan por CASCADE)
    await db.execute('DELETE FROM alertas_riego WHERE id = ?', [id]);

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
    const [userLocation] = await db.execute(
      "SELECT ubicacion_id FROM usuarios WHERE id = ? AND is_deleted = 0",
      [userId]
    );

    if (userLocation.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const userLocationId = userLocation[0].ubicacion_id;

    if (!userLocationId) {
      return res.status(400).json({
        success: false,
        message: 'El usuario no tiene una ubicación asignada. Contacta al administrador del sistema.'
      });
    }

    // Estadísticas de alertas (filtradas por condominio)
    const [alertStats] = await db.execute(
      `SELECT 
        ar.estado,
        COUNT(*) as cantidad
       FROM alertas_riego ar
       JOIN huertos h ON ar.huerto_id COLLATE utf8mb4_unicode_ci = h.id COLLATE utf8mb4_unicode_ci
       WHERE h.ubicacion_id = ?
       GROUP BY ar.estado`,
      [userLocationId]
    );

    // Estadísticas de notificaciones (filtradas por condominio)
    const [notificationStats] = await db.execute(
      `SELECT 
        na.tipo,
        COUNT(*) as cantidad
       FROM notificaciones_alertas na
       JOIN usuarios u ON na.usuario_id COLLATE utf8mb4_unicode_ci = u.id COLLATE utf8mb4_unicode_ci
       WHERE u.ubicacion_id = ?
       GROUP BY na.tipo`,
      [userLocationId]
    );

    // Estadísticas adicionales: alertas vencidas (basado en notificaciones, filtradas por condominio)
    const [vencidaStats] = await db.execute(
      `SELECT COUNT(*) as cantidad
       FROM notificaciones_alertas na
       JOIN usuarios u ON na.usuario_id COLLATE utf8mb4_unicode_ci = u.id COLLATE utf8mb4_unicode_ci
       WHERE na.tipo = 'vencida' AND u.ubicacion_id = ?`,
      [userLocationId]
    );

    // Usuarios conectados (filtrados por condominio) - contar usuarios únicos
    const [onlineUsers] = await db.execute(
      `SELECT COUNT(DISTINCT uc.usuario_id) as cantidad 
       FROM usuarios_conectados uc
       JOIN usuarios u ON uc.usuario_id COLLATE utf8mb4_unicode_ci = u.id COLLATE utf8mb4_unicode_ci
       WHERE u.ubicacion_id = ?`,
      [userLocationId]
    );

    // Estadísticas del servicio WebSocket
    const serviceStats = irrigationAlertService.getStats();

    res.json({
      success: true,
      data: {
        alerts: alertStats,
        notifications: notificationStats,
        alertasVencidas: vencidaStats[0].cantidad,
        onlineUsers: onlineUsers[0].cantidad,
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
    const [userLocation] = await db.execute(
      "SELECT ubicacion_id FROM usuarios WHERE id = ? AND is_deleted = 0",
      [userId]
    );

    if (userLocation.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const userLocationId = userLocation[0].ubicacion_id;

    if (!userLocationId) {
      return res.status(400).json({
        success: false,
        message: 'El usuario no tiene una ubicación asignada. Contacta al administrador del sistema.'
      });
    }

    // Obtener usuarios conectados del mismo condominio desde el servicio
    const connectedUsers = await irrigationAlertService.getConnectedUsers(userLocationId);

    res.json({
      success: true,
      data: {
        connectedUsers,
        totalConnections: connectedUsers.length,
        uniqueUsers: [...new Set(connectedUsers.map(u => u.usuario_id))].length,
        condominio: userLocationId,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error obteniendo usuarios conectados:', error);
    next(error);
  }
};