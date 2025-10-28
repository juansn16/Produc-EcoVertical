import db from '../config/db.js';

/**
 * Middleware para control de acceso a comentarios en huertos digitales
 * Implementa la lógica de segregación de permisos según roles y asignación de huertos
 */
export const verifyCommentAccess = async (req, res, next) => {
  try {
    let huerto_id = req.params.huerto_id;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log('🔍 [verifyCommentAccess] Iniciando verificación:', {
      commentId: req.params.commentId,
      huerto_id: req.params.huerto_id,
      userId,
      userRole,
      method: req.method,
      path: req.path
    });

    // Si no hay huerto_id en los parámetros, intentar obtenerlo del comentario
    if (!huerto_id && req.params.commentId) {
      console.log('🔍 [verifyCommentAccess] Obteniendo huerto_id del comentario:', req.params.commentId);
      try {
        const commentResult = await db.query(
          'SELECT huerto_id FROM comentarios WHERE id = $1 AND is_deleted = false',
          [req.params.commentId]
        );
        
        console.log('🔍 [verifyCommentAccess] Resultado de la query:', {
          rowsFound: commentResult.rows.length,
          data: commentResult.rows[0] || null
        });
        
        if (commentResult.rows.length === 0) {
          console.error('❌ [verifyCommentAccess] Comentario no encontrado:', req.params.commentId);
          return res.status(404).json({
            success: false,
            message: 'Comentario no encontrado'
          });
        }
        
        huerto_id = commentResult.rows[0].huerto_id;
        
        if (!huerto_id) {
          console.error('⚠️ [verifyCommentAccess] Comentario sin huerto_id:', req.params.commentId);
          return res.status(400).json({
            success: false,
            message: 'Comentario sin huerto asociado'
          });
        }

        console.log('✅ [verifyCommentAccess] huerto_id obtenido del comentario:', huerto_id);
      } catch (queryError) {
        console.error('❌ [verifyCommentAccess] Error obteniendo huerto_id del comentario:', {
          error: queryError.message,
          stack: queryError.stack,
          commentId: req.params.commentId
        });
        return res.status(500).json({
          success: false,
          message: 'Error al obtener información del comentario',
          error: process.env.NODE_ENV === 'development' ? queryError.message : 'Error interno del servidor'
        });
      }
    }

    if (!huerto_id) {
      console.error('❌ [verifyCommentAccess] ID de huerto no disponible');
      return res.status(400).json({
        success: false,
        message: 'ID de huerto requerido'
      });
    }

    console.log('🔐 [verifyCommentAccess] Verificando acceso a comentarios:', {
      huerto_id,
      userId,
      userRole,
      action: req.method
    });

    // Verificar que el huerto existe
    console.log('🔍 [verifyCommentAccess] Verificando existencia del huerto:', huerto_id);
    const huertoResult = await db.query(
      'SELECT * FROM huertos WHERE id = $1 AND is_deleted = false',
      [huerto_id]
    );

    console.log('🔍 [verifyCommentAccess] Resultado query huerto:', {
      found: huertoResult.rows.length > 0,
      huerto_id
    });

    if (huertoResult.rows.length === 0) {
      console.error('❌ [verifyCommentAccess] Huerto no encontrado:', huerto_id);
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }

    const huerto = huertoResult.rows[0];

    // ADMINISTRADOR: Acceso completo sin restricciones
    if (userRole === 'administrador') {
      console.log('✅ [verifyCommentAccess] Administrador - Acceso completo permitido');
      req.commentAccess = {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        reason: 'administrador'
      };
      return next();
    }

    // TÉCNICO: Acceso completo sin restricciones (similar al administrador)
    if (userRole === 'tecnico') {
      console.log('✅ [verifyCommentAccess] Técnico - Acceso completo permitido');
      req.commentAccess = {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        reason: 'tecnico'
      };
      return next();
    }

    // RESIDENTE: Verificar asignación al huerto específico
    if (userRole === 'residente') {
      console.log('🔍 [verifyCommentAccess] Verificando asignación de residente al huerto');
      // Verificar si el residente está asignado a este huerto específico
      const userHuertoResult = await db.query(
        'SELECT * FROM usuario_huerto WHERE usuario_id = $1 AND huerto_id = $2 AND is_deleted = false',
        [userId, huerto_id]
      );

      console.log('🔍 [verifyCommentAccess] Resultado asignación residente:', {
        isAssigned: userHuertoResult.rows.length > 0,
        userId,
        huerto_id
      });

      if (userHuertoResult.rows.length > 0) {
        console.log('✅ [verifyCommentAccess] Residente asignado - Acceso completo permitido');
        req.commentAccess = {
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: true,
          reason: 'residente_asignado'
        };
        return next();
      } else {
        console.log('👁️ [verifyCommentAccess] Residente no asignado - Solo visualización permitida');
        req.commentAccess = {
          canView: true,
          canCreate: false,
          canEdit: false,
          canDelete: false,
          reason: 'residente_no_asignado'
        };
        
        // Para operaciones de solo lectura (GET), permitir acceso
        if (req.method === 'GET') {
          return next();
        }
        
        // Para operaciones de escritura, denegar acceso
        console.error('❌ [verifyCommentAccess] Residente sin permisos de escritura en este huerto');
        return res.status(403).json({
          success: false,
          message: 'Solo puedes comentar en huertos donde eres residente asignado'
        });
      }
    }

    // USUARIOS NO AUTENTICADOS O CON ROLES NO VÁLIDOS: Solo visualización
    console.log('👁️ [verifyCommentAccess] Usuario sin permisos - Solo visualización permitida');
    req.commentAccess = {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      reason: 'sin_permisos'
    };

    // Para operaciones de solo lectura (GET), permitir acceso
    if (req.method === 'GET') {
      return next();
    }

    // Para operaciones de escritura, denegar acceso
    console.error('❌ [verifyCommentAccess] Usuario sin permisos para operaciones de escritura');
    return res.status(403).json({
      success: false,
      message: 'No tienes permisos para realizar esta acción en este huerto'
    });

  } catch (error) {
    console.error('❌ [verifyCommentAccess] Error crítico:', {
      error: error.message,
      stack: error.stack,
      params: req.params,
      user: req.user
    });
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};

/**
 * Middleware para verificar permisos específicos de comentarios
 * @param {string} action - Acción específica ('create', 'edit', 'delete')
 */
export const requireCommentPermission = (action) => {
  return (req, res, next) => {
    console.log('🔍 [requireCommentPermission] Verificando permisos para acción:', action);
    
    const access = req.commentAccess;
    
    if (!access) {
      console.error('❌ [requireCommentPermission] commentAccess no está definido');
      return res.status(500).json({
        success: false,
        message: 'Error de configuración: permisos de comentarios no verificados'
      });
    }

    console.log('🔍 [requireCommentPermission] Permisos actuales:', access);

    let hasPermission = false;
    let actionName = '';

    switch (action) {
      case 'create':
        hasPermission = access.canCreate;
        actionName = 'crear comentarios';
        break;
      case 'edit':
        hasPermission = access.canEdit;
        actionName = 'editar comentarios';
        break;
      case 'delete':
        hasPermission = access.canDelete;
        actionName = 'eliminar comentarios';
        break;
      default:
        console.error('❌ [requireCommentPermission] Acción no válida:', action);
        return res.status(400).json({
          success: false,
          message: 'Acción no válida'
        });
    }

    console.log('🔍 [requireCommentPermission] Resultado:', {
      action,
      hasPermission,
      reason: access.reason
    });

    if (!hasPermission) {
      console.error('❌ [requireCommentPermission] Permiso denegado:', {
        action,
        actionName,
        reason: access.reason
      });
      return res.status(403).json({
        success: false,
        message: `No tienes permisos para ${actionName} en este huerto`,
        reason: access.reason
      });
    }

    console.log('✅ [requireCommentPermission] Permiso concedido para:', action);
    next();
  };
};

/**
 * Middleware para verificar que un residente solo puede editar/eliminar sus propios comentarios
 * (excepto administradores y técnicos)
 */
export const verifyCommentOwnership = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log('🔍 [verifyCommentOwnership] Verificando propiedad del comentario:', {
      commentId,
      userId,
      userRole
    });

    // Administradores y técnicos pueden editar/eliminar cualquier comentario
    if (userRole === 'administrador' || userRole === 'tecnico') {
      console.log('✅ [verifyCommentOwnership] Admin/Técnico - Sin restricción de propiedad');
      return next();
    }

    // Para residentes, verificar que es el autor del comentario
    if (userRole === 'residente') {
      console.log('🔍 [verifyCommentOwnership] Verificando autoría del comentario para residente');
      const commentResult = await db.query(
        'SELECT usuario_id FROM comentarios WHERE id = $1 AND is_deleted = false',
        [commentId]
      );

      console.log('🔍 [verifyCommentOwnership] Resultado query:', {
        found: commentResult.rows.length > 0,
        authorId: commentResult.rows[0]?.usuario_id,
        currentUserId: userId
      });

      if (commentResult.rows.length === 0) {
        console.error('❌ [verifyCommentOwnership] Comentario no encontrado:', commentId);
        return res.status(404).json({
          success: false,
          message: 'Comentario no encontrado'
        });
      }

      if (commentResult.rows[0].usuario_id !== userId) {
        console.error('❌ [verifyCommentOwnership] Usuario no es el autor del comentario:', {
          commentAuthor: commentResult.rows[0].usuario_id,
          currentUser: userId
        });
        return res.status(403).json({
          success: false,
          message: 'Solo puedes editar o eliminar tus propios comentarios'
        });
      }

      console.log('✅ [verifyCommentOwnership] Usuario es el autor del comentario');
    }

    next();
  } catch (error) {
    console.error('❌ [verifyCommentOwnership] Error crítico:', {
      error: error.message,
      stack: error.stack,
      commentId: req.params.commentId,
      userId: req.user?.id
    });
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};
