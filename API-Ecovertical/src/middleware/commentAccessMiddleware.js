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

    // Si no hay huerto_id en los parámetros, intentar obtenerlo del comentario
    if (!huerto_id && req.params.commentId) {
      try {
        const commentResult = await db.query(
          'SELECT huerto_id FROM comentarios WHERE id = $1 AND is_deleted = false',
          [req.params.commentId]
        );
        
        if (commentResult.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Comentario no encontrado'
          });
        }
        
        huerto_id = commentResult.rows[0].huerto_id;
        
        if (!huerto_id) {
          console.error('⚠️ Comentario sin huerto_id:', req.params.commentId);
          return res.status(400).json({
            success: false,
            message: 'Comentario sin huerto asociado'
          });
        }
      } catch (queryError) {
        console.error('Error obteniendo huerto_id del comentario:', queryError);
        return res.status(500).json({
          success: false,
          message: 'Error al obtener información del comentario',
          error: process.env.NODE_ENV === 'development' ? queryError.message : undefined
        });
      }
    }

    if (!huerto_id) {
      return res.status(400).json({
        success: false,
        message: 'ID de huerto requerido'
      });
    }

    console.log('🔐 Verificando acceso a comentarios:', {
      huerto_id,
      userId,
      userRole,
      action: req.method
    });

    // Verificar que el huerto existe
    const huertoResult = await db.query(
      'SELECT * FROM huertos WHERE id = $1 AND is_deleted = false',
      [huerto_id]
    );

    if (huertoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }

    const huerto = huertoResult.rows[0];

    // ADMINISTRADOR: Acceso completo sin restricciones
    if (userRole === 'administrador') {
      console.log('✅ Administrador - Acceso completo permitido');
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
      console.log('✅ Técnico - Acceso completo permitido');
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
      // Verificar si el residente está asignado a este huerto específico
      const userHuertoResult = await db.query(
        'SELECT * FROM usuario_huerto WHERE usuario_id = $1 AND huerto_id = $2 AND is_deleted = false',
        [userId, huerto_id]
      );

      if (userHuertoResult.rows.length > 0) {
        console.log('✅ Residente asignado - Acceso completo permitido');
        req.commentAccess = {
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: true,
          reason: 'residente_asignado'
        };
        return next();
      } else {
        console.log('👁️ Residente no asignado - Solo visualización permitida');
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
        return res.status(403).json({
          success: false,
          message: 'Solo puedes comentar en huertos donde eres residente asignado'
        });
      }
    }

    // USUARIOS NO AUTENTICADOS O CON ROLES NO VÁLIDOS: Solo visualización
    console.log('👁️ Usuario sin permisos - Solo visualización permitida');
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
    return res.status(403).json({
      success: false,
      message: 'No tienes permisos para realizar esta acción en este huerto'
    });

  } catch (error) {
    console.error('Error en verifyCommentAccess:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Middleware para verificar permisos específicos de comentarios
 * @param {string} action - Acción específica ('create', 'edit', 'delete')
 */
export const requireCommentPermission = (action) => {
  return (req, res, next) => {
    const access = req.commentAccess;
    
    if (!access) {
      return res.status(500).json({
        success: false,
        message: 'Error de configuración: permisos de comentarios no verificados'
      });
    }

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
        return res.status(400).json({
          success: false,
          message: 'Acción no válida'
        });
    }

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `No tienes permisos para ${actionName} en este huerto`,
        reason: access.reason
      });
    }

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

    // Administradores y técnicos pueden editar/eliminar cualquier comentario
    if (userRole === 'administrador' || userRole === 'tecnico') {
      return next();
    }

    // Para residentes, verificar que es el autor del comentario
    if (userRole === 'residente') {
      const commentResult = await db.query(
        'SELECT usuario_id FROM comentarios WHERE id = $1 AND is_deleted = false',
        [commentId]
      );

      if (commentResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Comentario no encontrado'
        });
      }

      if (commentResult.rows[0].usuario_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Solo puedes editar o eliminar tus propios comentarios'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Error en verifyCommentOwnership:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};
