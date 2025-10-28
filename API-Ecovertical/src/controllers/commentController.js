import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { createNotification } from './notificationController.js';
import { CommentQueries } from '../utils/queries/index.js';
import irrigationAlertService from '../services/irrigationAlertService.js';

// Función auxiliar para cancelar alertas de riego cuando se registra un riego
async function cancelWateringAlerts(huertoId, usuarioId) {
  try {
    // Obtener alertas de riego activas para el huerto
    const alerts = await db.query(CommentQueries.getActiveWateringAlerts, [huertoId]);

    if (alerts.rows.length === 0) {
      return; // No hay alertas activas
    }

    // Actualizar última fecha de riego en las alertas
    const alertIds = alerts.rows.map(alert => alert.id);
    
    await db.query(CommentQueries.updateWateringAlertDates, [alertIds]);

    // Obtener todos los técnicos y administradores que tienen acceso al huerto
    const usuariosHuerto = await db.query(CommentQueries.getGardenTechUsers, [huertoId, usuarioId]);

    // Crear notificaciones de cancelación para cada alerta
    const notificacionesPromises = [];
    
    alerts.rows.forEach(alert => {
      usuariosHuerto.rows.forEach(usuario => {
        const tituloNotificacion = `Alerta de riego cancelada - ${alert.huerto_nombre}`;
        const mensajeNotificacion = `La alerta "${alert.titulo}" ha sido cancelada automáticamente porque se registró un riego en el huerto "${alert.huerto_nombre}".`;
        
        const datosAdicionales = {
          alerta_id: alert.id,
          huerto_id: huertoId,
          huerto_nombre: alert.huerto_nombre,
          tipo_alerta: 'riego_cancelado',
          motivo: 'riego_registrado'
        };
        
        notificacionesPromises.push(
          createNotification(
            usuario.usuario_id,
            tituloNotificacion,
            mensajeNotificacion,
            'riego',
            datosAdicionales
          )
        );
      });
    });

    await Promise.all(notificacionesPromises);
    
    console.log(`Alertas de riego canceladas para huerto ${huertoId}:`, alerts.rows.length);
    
  } catch (error) {
    console.error('Error en cancelWateringAlerts:', error);
    throw error;
  }
}

// Crear nuevo comentario con datos estadísticos
export const createComment = async (req, res) => {
  try {
    const { huerto_id } = req.params; // Obtener huerto_id de los parámetros de la ruta
    const {
      contenido,
      tipo_comentario,
      // Datos estadísticos opcionales
      cantidad_agua,
      unidad_agua,
      cantidad_siembra,
      cantidad_cosecha,
      cantidad_abono,
      unidad_abono,
      cantidad_plagas,
      cantidad_mantenimiento,
      unidad_mantenimiento,
      fecha_actividad,
      // Nuevo formato de plagas
      plaga_especie,
      plaga_nivel,
      // Relación siembra-cosecha
      siembra_relacionada,
      // Nuevos campos
      cambio_tierra,
      huerto_siembra_id,
      nombre_siembra // New field for siembra comments
    } = req.body;
    
    const userId = req.user.id;
    
    // Verificar que el huerto existe
    const huertoResult = await db.query(CommentQueries.checkGardenExists, [huerto_id]);
    
    if (huertoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }
    
    // La validación de acceso se maneja en el middleware verifyCommentAccess
    // Aquí solo verificamos que el middleware haya establecido los permisos correctamente
    if (!req.commentAccess || !req.commentAccess.canCreate) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para crear comentarios en este huerto'
      });
    }
    
    // Crear el comentario
    const commentId = uuidv4();
    await db.query(CommentQueries.create, [
      commentId, huerto_id, userId, contenido, tipo_comentario || 'general', cambio_tierra || null, nombre_siembra || null
    ]);
    
    // Mapear nivel de plaga a un valor numérico si se envía el nuevo formato
    let cantidadPlagasCalculada = cantidad_plagas || 0;
    if (tipo_comentario === 'plagas' && plaga_nivel) {
      const niveles = { pocos: 1, medio: 2, muchos: 3 };
      cantidadPlagasCalculada = niveles[plaga_nivel] || 0;
      console.log('🐛 Datos de plagas recibidos:', { plaga_especie, plaga_nivel, cantidadPlagasCalculada });
    }

    // Log para debuggear datos de mantenimiento
    if (tipo_comentario === 'mantenimiento') {
      console.log('🔧 Backend - Datos de mantenimiento recibidos:', { 
        cantidad_mantenimiento, 
        unidad_mantenimiento, 
        tipo_comentario 
      });
    }

    // Si hay datos estadísticos, crear registro en huerto_data
    if (cantidad_agua || cantidad_siembra || cantidad_cosecha || cantidad_abono || cantidadPlagasCalculada || plaga_especie || plaga_nivel || cantidad_mantenimiento || huerto_siembra_id) {
      const dataId = uuidv4();
      await db.query(CommentQueries.createGardenData, [
        dataId,
        commentId,  // ✨ Ligar directamente con el comentario
        huerto_id,
        fecha_actividad || new Date().toISOString().split('T')[0],
        cantidad_agua || 0,
        unidad_agua || 'ml',  // ✨ Unidad de agua (ml por defecto)
        cantidad_siembra || 0,
        cantidad_cosecha || 0,
        cantidad_abono || 0,
        unidad_abono || 'kg',
        cantidadPlagasCalculada,
        cantidad_mantenimiento || 0,
        unidad_mantenimiento || 'minutos',
        plaga_especie || null,
        plaga_nivel || null,
        siembra_relacionada || null,  // ✨ Relación siembra-cosecha
        huerto_siembra_id || null,    // ✨ Relación huerto-siembra para otros tipos
        userId
      ]);

      // Si se registró un riego (cantidad_agua > 0), cancelar alertas de riego activas
      if (cantidad_agua && cantidad_agua > 0) {
        try {
          await cancelWateringAlerts(huerto_id, userId);
        } catch (error) {
          console.error('Error al cancelar alertas de riego:', error);
          // No fallar la operación principal si falla la cancelación de alertas
        }
      }
    }
    
    // Obtener el comentario creado con información del usuario y datos estadísticos
    const commentData = await db.query(CommentQueries.getByIdWithData, [commentId]);
    
    // Mapear nivel textual de plagas si hay cantidad_plagas y agregar campos por defecto
    if (commentData.rows.length > 0) {
      if (commentData.rows[0].tipo_comentario === 'plagas') {
        const v = parseInt(commentData.rows[0].cantidad_plagas || 0);
        commentData.rows[0].plaga_nivel_texto = v === 3 ? 'muchos' : v === 2 ? 'medio' : v === 1 ? 'pocos' : null;
        // Si no hay cantidad_plagas pero sí hay plaga_nivel directo, usarlo
        if (!commentData.rows[0].plaga_nivel_texto && commentData.rows[0].plaga_nivel) {
          commentData.rows[0].plaga_nivel_texto = commentData.rows[0].plaga_nivel;
        }
      }
      
      // Los campos huerto_siembra_id ya vienen de la consulta SQL (tabla huerto_data)
    }
    
    // Obtener información del huerto para las notificaciones
    const huertoData = await db.query('SELECT nombre FROM huertos WHERE id = $1', [huerto_id]);
    
    const huertoNombre = huertoData.rows.length > 0 ? huertoData.rows[0].nombre : 'Huerto';
    
    // Obtener todos los usuarios que tienen acceso al huerto (excepto el que creó el comentario)
    const usuariosHuerto = await db.query(CommentQueries.getGardenUsersForNotification, [huerto_id, userId]);
    
    // Crear notificaciones para todos los usuarios del huerto
    const notificacionesPromises = usuariosHuerto.rows.map(async (usuario) => {
      try {
        const titulo = `Nuevo comentario en ${huertoNombre}`;
        const mensaje = `${commentData.rows[0].usuario_nombre} ha agregado un comentario en el huerto "${huertoNombre}": "${contenido.substring(0, 100)}${contenido.length > 100 ? '...' : ''}"`;
        
        const datosAdicionales = {
          huerto_id: huerto_id,
          huerto_nombre: huertoNombre,
          comentario_id: commentId,
          autor_id: userId,
          autor_nombre: commentData.rows[0].usuario_nombre,
          autor_rol: commentData.rows[0].usuario_rol,
          tipo_comentario: tipo_comentario || 'general'
        };
        
        await createNotification(
          usuario.usuario_id,
          titulo,
          mensaje,
          'comentario',
          datosAdicionales
        );
      } catch (error) {
        console.error(`Error al crear notificación para usuario ${usuario.usuario_id}:`, error);
        // No fallar la operación principal si falla una notificación
      }
    });
    
    // Ejecutar todas las notificaciones en paralelo
    await Promise.all(notificacionesPromises);
    
    // Enviar notificaciones en tiempo real a usuarios conectados
    const realtimePromises = usuariosHuerto.rows.map(async (usuario) => {
      try {
        await irrigationAlertService.sendRealtimeNotification(
          usuario.usuario_id,
          'newCommentNotification',
          {
            type: 'comment_created',
            huerto_id: huerto_id,
            huerto_nombre: huertoNombre,
            comentario_id: commentId,
            autor_id: userId,
            autor_nombre: commentData.rows[0].usuario_nombre,
            autor_rol: commentData.rows[0].usuario_rol,
            mensaje: `${commentData.rows[0].usuario_nombre} ha agregado un comentario en el huerto "${huertoNombre}": "${contenido.substring(0, 100)}${contenido.length > 100 ? '...' : ''}"`,
            timestamp: new Date().toISOString()
          }
        );
      } catch (error) {
        console.error(`Error enviando notificación en tiempo real para usuario ${usuario.usuario_id}:`, error);
        // No fallar la operación principal si falla una notificación en tiempo real
      }
    });
    
    // Ejecutar notificaciones en tiempo real en paralelo
    await Promise.all(realtimePromises);
    
    res.status(201).json({
      success: true,
      message: 'Comentario creado exitosamente',
      data: commentData.rows[0]
    });
  } catch (error) {
    console.error('Error al crear comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener comentarios de un huerto
export const getCommentsByGarden = async (req, res) => {
  try {
    const { huerto_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    console.log('Solicitando comentarios para huerto:', huerto_id);
    
    const offset = (page - 1) * limit;
    
    // Verificar que el huerto existe
    const huertoResult = await db.query(CommentQueries.checkGardenExists, [huerto_id]);
    
    if (huertoResult.rows.length === 0) {
      console.log('Huerto no encontrado:', huerto_id);
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }
    
    console.log('Huerto encontrado, buscando comentarios...');
    
    // Obtener comentarios con información del usuario - COLUMNA CORREGIDA
    const comments = await db.query(CommentQueries.getByGarden, [huerto_id, parseInt(limit), offset]);

    // Mapear nivel textual de plagas si hay cantidad_plagas y agregar campos por defecto
    const mapped = comments.rows.map((c) => {
      if (c.tipo_comentario === 'plagas') {
        const v = parseInt(c.cantidad_plagas || 0);
        c.plaga_nivel_texto = v === 3 ? 'muchos' : v === 2 ? 'medio' : v === 1 ? 'pocos' : null;
        // Si no hay cantidad_plagas pero sí hay plaga_nivel directo, usarlo
        if (!c.plaga_nivel_texto && c.plaga_nivel) {
          c.plaga_nivel_texto = c.plaga_nivel;
        }
        console.log('🐛 Comentario de plagas mapeado:', { 
          id: c.id, 
          cantidad_plagas: c.cantidad_plagas, 
          plaga_especie: c.plaga_especie, 
          plaga_nivel: c.plaga_nivel, 
          plaga_nivel_texto: c.plaga_nivel_texto 
        });
      }
      
      // Los campos huerto_siembra_id ya vienen de la consulta SQL (tabla huerto_data)
      
      return c;
    });
    
    console.log('Comentarios encontrados:', comments.rows.length);
    
    // Obtener total de comentarios
    const totalResult = await db.query(CommentQueries.countByGarden, [huerto_id]);
    
    const total = totalResult.rows.length > 0 ? totalResult.rows[0].total : 0;
    
    console.log('Total de comentarios:', total);
    
    res.json({
      success: true,
      data: mapped,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error detallado al obtener comentarios:', error);
    console.error('Stack trace:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener comentarios',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

// Actualizar comentario
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { 
      contenido, 
      tipo_comentario,
      // Datos estadísticos opcionales
      cantidad_agua,
      unidad_agua,
      cantidad_siembra,
      cantidad_cosecha,
      cantidad_abono,
      unidad_abono,
      cantidad_plagas,
      cantidad_mantenimiento,
      unidad_mantenimiento,
      fecha_actividad,
      // Nuevo formato de plagas
      plaga_especie,
      plaga_nivel,
      // Relación siembra-cosecha
      siembra_relacionada,
      // Nuevos campos
      cambio_tierra,
      huerto_siembra_id,
      nombre_siembra // New field for siembra comments
    } = req.body;
    const userId = req.user.id;
    
    console.log('🔄 [updateComment] Iniciando actualización de comentario:', {
      commentId,
      userId,
      contenido: contenido?.substring(0, 50),
      tipo_comentario
    });
    
    // Verificar que el comentario existe y pertenece al usuario
    const commentResult = await db.query(CommentQueries.getById, [commentId]);
    
    console.log('🔍 [updateComment] Resultado de búsqueda del comentario:', {
      found: commentResult.rows.length > 0,
      commentId
    });
    
    if (commentResult.rows.length === 0) {
      console.error('❌ [updateComment] Comentario no encontrado:', commentId);
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }
    
    const comment = commentResult.rows[0];
    
    console.log('🔍 [updateComment] Verificando permisos:', {
      commentAuthor: comment.usuario_id,
      currentUser: userId,
      userRole: req.user.role
    });
    
    // Solo el autor del comentario o un administrador puede editarlo
    if (comment.usuario_id !== userId && req.user.role !== 'administrador') {
      console.error('❌ [updateComment] Sin permisos para editar');
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para editar este comentario'
      });
    }
    
    // Actualizar el comentario
    console.log('🔄 [updateComment] Ejecutando query de actualización');
    await db.query(CommentQueries.update, [
      contenido, tipo_comentario || comment.tipo_comentario, cambio_tierra || null, nombre_siembra || null, commentId
    ]);
    
    console.log('✅ [updateComment] Comentario actualizado exitosamente');

    // Obtener el comentario actualizado inmediatamente
    let updatedComment;
    try {
      console.log('🔍 Obteniendo comentario actualizado para:', commentId);
      console.log('🔍 Query que se va a ejecutar: getByIdWithData');
      console.log('🔍 Parámetros:', [commentId]);
      updatedComment = await db.query(CommentQueries.getById, [commentId]);
      console.log('✅ Comentario actualizado obtenido:', updatedComment.rows.length);
      console.log('✅ Resultado query:', JSON.stringify(updatedComment.rows[0] || {}, null, 2));
    } catch (queryError) {
      console.error('❌ Error obteniendo comentario actualizado:', queryError);
      console.error('Stack trace:', queryError.stack);
      console.error('Query:', CommentQueries.getByIdWithData);
      console.error('Parameters:', [commentId]);
      
      // Intentar obtener el comentario básico como fallback
      try {
        const basicComment = await db.query(CommentQueries.getById, [commentId]);
        console.log('✅ Comentario básico obtenido como fallback');
        
        if (basicComment.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Comentario no encontrado'
          });
        }
        
        // Mapear nivel textual de plagas si es necesario
        if (basicComment.rows[0].tipo_comentario === 'plagas') {
          const v = parseInt(basicComment.rows[0].cantidad_plagas || 0);
          basicComment.rows[0].plaga_nivel_texto = v === 3 ? 'muchos' : v === 2 ? 'medio' : v === 1 ? 'pocos' : null;
        }
        
        return res.json({
          success: true,
          message: 'Comentario actualizado exitosamente',
          data: basicComment.rows[0]
        });
      } catch (fallbackError) {
        console.error('❌ Error en fallback:', fallbackError);
        // No retornar error aquí para evitar múltiples respuestas, continuar
        updatedComment = null;
      }
    }

    // Obtener información del huerto y usuario para las notificaciones (sin bloquear la respuesta)
    try {
      let huertoData, usuarioData;
      try {
        huertoData = await db.query(CommentQueries.getGardenInfoForNotification, [commentId]);
        usuarioData = await db.query(CommentQueries.getUserInfoForNotification, [userId]);
      } catch (notificationError) {
        console.error('Error obteniendo datos para notificaciones:', notificationError);
        // Continuar sin las notificaciones
        huertoData = { rows: [] };
        usuarioData = { rows: [] };
      }

      if (huertoData.rows.length > 0 && usuarioData.rows.length > 0) {
      const huertoNombre = huertoData.rows[0].huerto_nombre;
      const huertoCreador = huertoData.rows[0].huerto_creador;
      const usuarioNombre = usuarioData.rows[0].usuario_nombre;
      const usuarioRol = usuarioData.rows[0].usuario_rol;

      // Solo notificar si el que edita NO es el dueño del huerto
      if (userId !== huertoCreador) {
        // Obtener todos los usuarios que tienen acceso al huerto (excepto el que editó)
        const usuariosHuerto = await db.query(CommentQueries.getGardenUsersForNotification, [comment.huerto_id, userId]);

        // Crear notificaciones para todos los usuarios del huerto
        const notificacionesPromises = usuariosHuerto.rows.map(async (usuario) => {
          try {
            const titulo = `Comentario editado en ${huertoNombre}`;
            const mensaje = `${usuarioNombre} ha editado un comentario en el huerto "${huertoNombre}": "${contenido.substring(0, 100)}${contenido.length > 100 ? '...' : ''}"`;
            
            const datosAdicionales = {
              huerto_id: comment.huerto_id,
              huerto_nombre: huertoNombre,
              comentario_id: commentId,
              autor_id: userId,
              autor_nombre: usuarioNombre,
              autor_rol: usuarioRol,
              tipo_comentario: tipo_comentario || comment.tipo_comentario,
              accion: 'editado'
            };
            
            await createNotification(
              usuario.usuario_id,
              titulo,
              mensaje,
              'comentario',
              datosAdicionales
            );
          } catch (error) {
            console.error(`Error al crear notificación de edición para usuario ${usuario.usuario_id}:`, error);
          }
        });

        // Ejecutar todas las notificaciones en paralelo
        await Promise.all(notificacionesPromises);

        // Enviar notificaciones en tiempo real a usuarios conectados
        const realtimePromises = usuariosHuerto.rows.map(async (usuario) => {
          try {
            await irrigationAlertService.sendRealtimeNotification(
              usuario.usuario_id,
              'commentEditedNotification',
              {
                type: 'comment_edited',
                huerto_id: comment.huerto_id,
                huerto_nombre: huertoNombre,
                comentario_id: commentId,
                autor_id: userId,
                autor_nombre: usuarioNombre,
                autor_rol: usuarioRol,
                mensaje: `${usuarioNombre} ha editado un comentario en el huerto "${huertoNombre}": "${contenido.substring(0, 100)}${contenido.length > 100 ? '...' : ''}"`,
                timestamp: new Date().toISOString()
              }
            );
          } catch (error) {
            console.error(`Error enviando notificación en tiempo real de edición para usuario ${usuario.usuario_id}:`, error);
          }
        });

        // Ejecutar notificaciones en tiempo real en paralelo
        await Promise.all(realtimePromises);
      }
      }
    } catch (notificationProcessError) {
      console.error('Error procesando notificaciones:', notificationProcessError);
      // Continuar sin bloquear la respuesta
    }
    
    // Procesar datos estadísticos en segundo plano (sin bloquear la respuesta)
    try {
      // Mapear nivel de plaga a un valor numérico si se envía el nuevo formato
      let cantidadPlagasCalculada = cantidad_plagas || 0;
      if (tipo_comentario === 'plagas' && plaga_nivel) {
        const niveles = { pocos: 1, medio: 2, muchos: 3 };
        cantidadPlagasCalculada = niveles[plaga_nivel] || 0;
        console.log('🐛 Datos de plagas actualizados:', { plaga_especie, plaga_nivel, cantidadPlagasCalculada });
      }
      
      // Actualizar o crear datos en huerto_data solo si hay datos para actualizar
      const hasDataToUpdate = cantidad_agua || cantidad_siembra || cantidad_cosecha || cantidad_abono || 
                              cantidadPlagasCalculada || cantidad_mantenimiento || plaga_especie || plaga_nivel ||
                              siembra_relacionada || huerto_siembra_id;
      
      if (hasDataToUpdate && tipo_comentario !== 'general') {
        // Verificar si ya existe un registro de datos para este comentario
        const existingData = await db.query(CommentQueries.checkExistingGardenData, [commentId]);
        
        if (existingData.rows.length > 0) {
          // Actualizar registro existente
          await db.query(CommentQueries.updateGardenData, [
            cantidad_agua || null,
            unidad_agua || null,
            cantidad_siembra || null,
            cantidad_cosecha || null,
            cantidad_abono || null,
            unidad_abono || null,
            cantidadPlagasCalculada || null,
            cantidad_mantenimiento || null,
            unidad_mantenimiento || null,
            plaga_especie || null,
            plaga_nivel || null,
            siembra_relacionada || null,
            huerto_siembra_id || null,
            fecha_actividad || new Date().toISOString().split('T')[0],
            commentId
          ]);
        } else if (tipo_comentario !== 'general') {
          // Solo crear nuevo registro si no es comentario general
          const dataId = uuidv4();
          await db.query(CommentQueries.createGardenData, [
            dataId,
            commentId,
            comment.huerto_id,
            fecha_actividad || new Date().toISOString().split('T')[0],
            cantidad_agua || null,
            unidad_agua || null,
            cantidad_siembra || null,
            cantidad_cosecha || null,
            cantidad_abono || null,
            unidad_abono || null,
            cantidadPlagasCalculada || null,
            cantidad_mantenimiento || null,
            unidad_mantenimiento || null,
            plaga_especie || null,
            plaga_nivel || null,
            siembra_relacionada || null,
            huerto_siembra_id || null,
            userId
          ]);
        }
      }
    } catch (gardenDataError) {
      console.error('Error actualizando datos de huerto:', gardenDataError);
      // Continuar sin actualizar los datos estadísticos
    }
    
    // Verificar que el comentario fue obtenido correctamente
    if (!updatedComment || !updatedComment.rows || updatedComment.rows.length === 0) {
      console.error('⚠️ No se pudo obtener el comentario actualizado con datos completos, intentando fallback...');
      // Intentar obtener comentario básico como fallback
      try {
        const basicComment = await db.query(CommentQueries.getById, [commentId]);
        if (basicComment.rows.length > 0) {
          // Mapear nivel textual de plagas si es necesario
          if (basicComment.rows[0].tipo_comentario === 'plagas') {
            const v = parseInt(basicComment.rows[0].cantidad_plagas || 0);
            basicComment.rows[0].plaga_nivel_texto = v === 3 ? 'muchos' : v === 2 ? 'medio' : v === 1 ? 'pocos' : null;
          }
          
          return res.json({
            success: true,
            message: 'Comentario actualizado exitosamente',
            data: basicComment.rows[0]
          });
        } else {
          // Si no se encontró el comentario, retornar error
          return res.status(404).json({
            success: false,
            message: 'Comentario no encontrado después de actualizar'
          });
        }
      } catch (error) {
        console.error('Error en último fallback:', error);
        // Si todo falla, retornar error
        return res.status(500).json({
          success: false,
          message: 'Error al obtener comentario actualizado',
          error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
        });
      }
    }
    
    // Verificar que tenemos el comentario antes de acceder
    if (!updatedComment || !updatedComment.rows || updatedComment.rows.length === 0) {
      console.error('❌ No se pudo obtener el comentario después de actualizar');
      return res.status(404).json({
        success: false,
        message: 'No se pudo obtener el comentario actualizado'
      });
    }
    
    // Mapear nivel textual de plagas si hay cantidad_plagas
    if (updatedComment.rows[0].tipo_comentario === 'plagas') {
      const v = parseInt(updatedComment.rows[0].cantidad_plagas || 0);
      updatedComment.rows[0].plaga_nivel_texto = v === 3 ? 'muchos' : v === 2 ? 'medio' : v === 1 ? 'pocos' : null;
      // Si no hay cantidad_plagas pero sí hay plaga_nivel directo, usarlo
      if (!updatedComment.rows[0].plaga_nivel_texto && updatedComment.rows[0].plaga_nivel) {
        updatedComment.rows[0].plaga_nivel_texto = updatedComment.rows[0].plaga_nivel;
      }
    }
    
    console.log('✅ Enviando respuesta con comentario actualizado');
    return res.json({
      success: true,
      message: 'Comentario actualizado exitosamente',
      data: updatedComment.rows[0]
    });
  } catch (error) {
    console.error('❌ Error al actualizar comentario:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
    console.error('Error hint:', error.hint);
    console.error('Error position:', error.position);
    console.error('Stack trace completo:', error.stack);
    console.error('Request params:', req.params);
    console.error('Request body:', req.body);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? {
        code: error.code,
        detail: error.detail,
        hint: error.hint,
        position: error.position
      } : undefined
    });
  }
};

// Eliminar comentario (soft delete)
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    
    console.log('🗑️ [deleteComment] Iniciando eliminación de comentario:', {
      commentId,
      userId,
      userRole: req.user.role
    });
    
    // Verificar que el comentario existe
    const commentResult = await db.query(CommentQueries.getById, [commentId]);
    
    console.log('🔍 [deleteComment] Resultado de búsqueda del comentario:', {
      found: commentResult.rows.length > 0,
      commentId
    });
    
    if (commentResult.rows.length === 0) {
      console.error('❌ [deleteComment] Comentario no encontrado:', commentId);
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }
    
    const comment = commentResult.rows[0];
    
    console.log('🔍 [deleteComment] Verificando permisos:', {
      commentAuthor: comment.usuario_id,
      currentUser: userId,
      userRole: req.user.role
    });
    
    // Solo el autor del comentario o un administrador puede eliminarlo
    if (comment.usuario_id !== userId && req.user.role !== 'administrador') {
      console.error('❌ [deleteComment] Sin permisos para eliminar');
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar este comentario'
      });
    }
    
    // Obtener información del huerto ANTES del soft delete para las notificaciones
    console.log('🔍 [deleteComment] Obteniendo información del huerto antes del delete');
    let huertoData, usuarioData;
    
    try {
      huertoData = await db.query(CommentQueries.getGardenInfoForNotification, [commentId]);
      console.log('✅ [deleteComment] Información del huerto obtenida:', {
        found: huertoData.rows.length > 0
      });
    } catch (error) {
      console.error('⚠️ [deleteComment] Error obteniendo información del huerto:', error);
      huertoData = { rows: [] };
    }
    
    try {
      usuarioData = await db.query(CommentQueries.getUserInfoForNotification, [userId]);
      console.log('✅ [deleteComment] Información del usuario obtenida:', {
        found: usuarioData.rows.length > 0
      });
    } catch (error) {
      console.error('⚠️ [deleteComment] Error obteniendo información del usuario:', error);
      usuarioData = { rows: [] };
    }
    
    // Soft delete
    console.log('🗑️ [deleteComment] Ejecutando soft delete');
    await db.query(CommentQueries.delete, [commentId]);
    console.log('✅ [deleteComment] Soft delete ejecutado exitosamente');

    // Procesar notificaciones en segundo plano (no bloquear la respuesta)
    if (huertoData.rows.length > 0 && usuarioData.rows.length > 0) {
      try {
        const huertoNombre = huertoData.rows[0].huerto_nombre;
        const huertoCreador = huertoData.rows[0].huerto_creador;
        const usuarioNombre = usuarioData.rows[0].usuario_nombre;
        const usuarioRol = usuarioData.rows[0].usuario_rol;

        console.log('📨 [deleteComment] Procesando notificaciones');

        // Solo notificar si el que elimina NO es el dueño del huerto
        if (userId !== huertoCreador) {
          // Obtener todos los usuarios que tienen acceso al huerto (excepto el que eliminó)
          const usuariosHuerto = await db.query(CommentQueries.getGardenUsersForNotification, [comment.huerto_id, userId]);
          
          console.log('📨 [deleteComment] Usuarios a notificar:', usuariosHuerto.rows.length);

          // Crear notificaciones para todos los usuarios del huerto
          const notificacionesPromises = usuariosHuerto.rows.map(async (usuario) => {
            try {
              const titulo = `Comentario eliminado en ${huertoNombre}`;
              const mensaje = `${usuarioNombre} ha eliminado un comentario en el huerto "${huertoNombre}"`;
              
              const datosAdicionales = {
                huerto_id: comment.huerto_id,
                huerto_nombre: huertoNombre,
                comentario_id: commentId,
                autor_id: userId,
                autor_nombre: usuarioNombre,
                autor_rol: usuarioRol,
                tipo_comentario: comment.tipo_comentario,
                accion: 'eliminado'
              };
              
              await createNotification(
                usuario.usuario_id,
                titulo,
                mensaje,
                'comentario',
                datosAdicionales
              );
            } catch (error) {
              console.error(`⚠️ [deleteComment] Error al crear notificación para usuario ${usuario.usuario_id}:`, error);
            }
          });

          // Ejecutar todas las notificaciones en paralelo
          await Promise.all(notificacionesPromises);

          // Enviar notificaciones en tiempo real a usuarios conectados
          const realtimePromises = usuariosHuerto.rows.map(async (usuario) => {
            try {
              await irrigationAlertService.sendRealtimeNotification(
                usuario.usuario_id,
                'commentDeletedNotification',
                {
                  type: 'comment_deleted',
                  huerto_id: comment.huerto_id,
                  huerto_nombre: huertoNombre,
                  comentario_id: commentId,
                  autor_id: userId,
                  autor_nombre: usuarioNombre,
                  autor_rol: usuarioRol,
                  mensaje: `${usuarioNombre} ha eliminado un comentario en el huerto "${huertoNombre}"`,
                  timestamp: new Date().toISOString()
                }
              );
            } catch (error) {
              console.error(`⚠️ [deleteComment] Error enviando notificación en tiempo real para usuario ${usuario.usuario_id}:`, error);
            }
          });

          // Ejecutar notificaciones en tiempo real en paralelo
          await Promise.all(realtimePromises);
          
          console.log('✅ [deleteComment] Notificaciones procesadas');
        } else {
          console.log('ℹ️ [deleteComment] Usuario es el creador del huerto, no se envían notificaciones');
        }
      } catch (notificationError) {
        console.error('⚠️ [deleteComment] Error procesando notificaciones (no crítico):', notificationError);
        // No fallar la operación si las notificaciones fallan
      }
    } else {
      console.log('ℹ️ [deleteComment] No se pueden enviar notificaciones (falta información del huerto o usuario)');
    }
    
    console.log('✅ [deleteComment] Comentario eliminado exitosamente, enviando respuesta');
    res.json({
      success: true,
      message: 'Comentario eliminado exitosamente'
    });
  } catch (error) {
    console.error('❌ [deleteComment] Error crítico al eliminar comentario:', {
      error: error.message,
      code: error.code,
      stack: error.stack,
      commentId: req.params.commentId,
      userId: req.user?.id
    });
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? {
        code: error.code,
        position: error.position
      } : undefined
    });
  }
};

// Obtener estadísticas de comentarios por huerto
export const getCommentStats = async (req, res) => {
  try {
    const { huerto_id } = req.params;
    
    // Verificar que el huerto existe
    const huertoResult = await db.query(CommentQueries.checkGardenExists, [huerto_id]);
    
    if (huertoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }
    
    // Obtener estadísticas de comentarios
    const statsResult = await db.query(CommentQueries.getStatsByGarden, [huerto_id]);
    
    res.json({
      success: true,
      data: statsResult.rows || [] // Asegurar que siempre devuelva un array
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de comentarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener comentarios de uso de inventario
export const getInventoryUsageComments = async (req, res) => {
  try {
    const { inventory_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    console.log('🔍 Solicitando comentarios de uso para inventario:', inventory_id);
    
    const offset = (page - 1) * limit;
    
    // Verificar que el item de inventario existe
    const inventoryResult = await db.query(CommentQueries.checkInventoryExists, [inventory_id]);
    
    if (inventoryResult.rows.length === 0) {
      console.log('❌ Item de inventario no encontrado:', inventory_id);
      return res.status(404).json({
        success: false,
        message: 'Item de inventario no encontrado'
      });
    }
    
    console.log('✅ Item de inventario encontrado, buscando comentarios...');
    
    // Obtener comentarios de uso del inventario con información del usuario
    const comments = await db.query(CommentQueries.getInventoryCommentsWithUser, [inventory_id]);
    
    console.log(`📊 Encontrados ${comments.rows.length} comentarios de uso`);
    
    // Filtrar solo comentarios de tipo 'uso' (comentarios automáticos de uso)
    const usageComments = comments.rows.filter(comment => 
      comment.tipo_comentario === 'uso'
    );
    
    // Aplicar paginación
    const paginatedComments = usageComments.slice(offset, offset + parseInt(limit));
    
    // Formatear los comentarios para el frontend
    const formattedComments = paginatedComments.map(comment => ({
      id: comment.id,
      contenido: comment.contenido,
      tipo_comentario: comment.tipo_comentario,
      cantidad_usada: comment.cantidad_usada,
      unidad_medida: comment.unidad_medida,
      fecha_creacion: comment.fecha_creacion,
      usuario_nombre: comment.usuario_nombre,
      usuario_rol: comment.usuario_rol,
      // Agregar etiquetas para compatibilidad con el frontend
      etiquetas: ['inventario', 'uso']
    }));
    
    res.json({
      success: true,
      data: formattedComments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: usageComments.length,
        totalPages: Math.ceil(usageComments.length / limit)
      }
    });
    
  } catch (error) {
    console.error('❌ Error al obtener comentarios de uso de inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};