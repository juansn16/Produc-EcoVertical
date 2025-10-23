import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { createNotification } from './notificationController.js';
import { AlertQueries } from '../utils/queries/index.js';

// Crear nueva alerta (solo para alertas generales, NO de riego)
export const createAlert = async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      tipo,
      prioridad = 'media',
      huerto_id,
      fecha_programada,
      fecha_vencimiento,
      hora_programada,
      notas
    } = req.body;
    
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Verificar que no sea una alerta de riego
    if (tipo === 'riego') {
      return res.status(400).json({
        success: false,
        message: 'Las alertas de riego deben crearse a través del endpoint /scheduled-watering'
      });
    }
    
    // Verificar que el huerto existe y obtener su información
    const huertoResult = await db.query(AlertQueries.getGardenInfo, [huerto_id]);
    
    if (huertoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }

    const huerto = huertoResult.rows[0];
    
    // Verificar permisos según el tipo de huerto
    if (huerto.tipo === 'publico') {
      // Huertos públicos: solo administradores y técnicos pueden crear alertas
      if (!['administrador', 'tecnico'].includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Solo los administradores y técnicos pueden crear alertas en huertos públicos'
        });
      }
    } else if (huerto.tipo === 'privado') {
      // Huertos privados: solo el propietario puede crear alertas
      const userRoleResult = await db.query(AlertQueries.getUserRoleInGarden, [userId, huerto_id]);
      
      const isOwner = userRoleResult.rows.length > 0 && userRoleResult.rows[0].rol === 'propietario';
      
      if (!isOwner && userRole !== 'administrador') {
        return res.status(403).json({
          success: false,
          message: 'Solo el propietario del huerto puede crear alertas en huertos privados'
        });
      }
    }
    
    // Crear la alerta
    const alertId = uuidv4();
    
    await db.query(AlertQueries.create, [
      alertId, titulo, descripcion, tipo, prioridad, huerto_id, userId, 
      fecha_programada, hora_programada || null, fecha_vencimiento || null, 
      true, notas || null
    ]);
    
    // Determinar usuarios a notificar según el tipo de huerto
    let usuariosANotificar = [];
    
    if (huerto.tipo === 'publico') {
      // Huertos públicos: notificar a todos los usuarios del huerto
      const usuariosResult = await db.query(AlertQueries.getUsersInPublicGarden, [huerto_id]);
      usuariosANotificar = usuariosResult.rows.map(u => u.usuario_id);
    } else if (huerto.tipo === 'privado') {
      // Huertos privados: notificar solo al propietario
      const propietarioResult = await db.query(AlertQueries.getOwnerOfPrivateGarden, [huerto_id]);
      usuariosANotificar = propietarioResult.rows.map(u => u.usuario_id);
    }
    
    // Crear notificaciones para los usuarios
    for (const usuarioId of usuariosANotificar) {
      await createNotification({
        titulo: titulo,
        mensaje: descripcion,
        tipo: 'alerta',
        usuario_id: usuarioId,
        huerto_id: huerto_id,
        alerta_id: alertId
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Alerta creada exitosamente',
      data: {
        id: alertId,
        titulo,
        descripcion,
        tipo,
        prioridad,
        huerto_id,
        fecha_programada,
        hora_programada,
        fecha_vencimiento,
        esta_activa: true,
        notas
      }
    });
  } catch (error) {
    console.error('Error al crear alerta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener próximas alertas
export const getUpcomingAlerts = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const userId = req.user.id;
    
    const alerts = await db.query(AlertQueries.getUpcomingAlerts, [userId, parseInt(limit), parseInt(offset)]);
    
    res.json({
      success: true,
      data: alerts.rows
    });
  } catch (error) {
    console.error('Error al obtener próximas alertas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener alertas por jardín
export const getGardenAlerts = async (req, res) => {
  try {
    const { gardenId } = req.params;
    const { limit = 10, offset = 0, solo_activas = false } = req.query;
    
    const alerts = await db.query(AlertQueries.getGardenAlerts, [
      gardenId, 
      solo_activas === 'true' ? true : null, 
      parseInt(limit), 
      parseInt(offset)
    ]);
    
    res.json({
      success: true,
      data: alerts.rows
    });
  } catch (error) {
    console.error('Error al obtener alertas del jardín:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar estado de alerta
export const updateAlertStatus = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { esta_activa } = req.body;
    
    await db.query(AlertQueries.updateStatus, [esta_activa, alertId]);
    
    res.json({
      success: true,
      message: 'Estado de alerta actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar estado de alerta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar alerta
export const updateAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { titulo, descripcion, prioridad, fecha_programada, hora_programada, fecha_vencimiento, notas } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Verificar que la alerta existe y obtener información
    const alertResult = await db.query(AlertQueries.getByIdWithGarden, [alertId]);
    
    if (alertResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Alerta no encontrada'
      });
    }
    
    const alert = alertResult.rows[0];
    
    // Verificar permisos
    if (alert.usuario_creador !== userId && userRole !== 'administrador') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para editar esta alerta'
      });
    }
    
    await db.query(AlertQueries.update, [
      titulo, descripcion, prioridad, fecha_programada, 
      hora_programada, fecha_vencimiento, notas, alertId
    ]);
    
    res.json({
      success: true,
      message: 'Alerta actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar alerta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Eliminar alerta
export const deleteAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Verificar que la alerta existe
    const alertResult = await db.query(AlertQueries.getById, [alertId]);
    
    if (alertResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Alerta no encontrada'
      });
    }
    
    const alert = alertResult.rows[0];
    
    // Verificar permisos
    if (alert.usuario_creador !== userId && userRole !== 'administrador') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar esta alerta'
      });
    }
    
    // Soft delete
    await db.query(AlertQueries.softDelete, [alertId]);
    
    res.json({
      success: true,
      message: 'Alerta eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar alerta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Disparar notificación de alerta
export const triggerAlertNotification = async (req, res) => {
  try {
    const { alertId } = req.params;
    
    // Obtener información de la alerta
    const alertResult = await db.query(AlertQueries.getAlertForNotification, [alertId]);
    
    if (alertResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Alerta no encontrada'
      });
    }
    
    const alert = alertResult.rows[0];
    
    // Obtener usuarios del huerto
    const usuariosResult = await db.query(AlertQueries.getGardenUsers, [alert.huerto_id]);
    
    // Crear notificaciones
    for (const usuario of usuariosResult.rows) {
      await createNotification({
        titulo: alert.titulo,
        mensaje: alert.descripcion,
        tipo: 'alerta',
        usuario_id: usuario.usuario_id,
        huerto_id: alert.huerto_id,
        alerta_id: alertId
      });
    }
    
    res.json({
      success: true,
      message: 'Notificación enviada exitosamente'
    });
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};
