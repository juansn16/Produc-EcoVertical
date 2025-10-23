import db from '../config/db.js';

/**
 * Middleware para verificar acceso a huertos
 * Aplica las siguientes reglas:
 * - Huertos privados: 
 *   * Creador: Acceso completo
 *   * Admin: Puede ver todos los huertos privados de su condominio
 *   * Técnico: Puede ver todos los huertos privados de su condominio
 * - Huertos públicos: Accesibles por todos los usuarios del mismo condominio
 */
export const verifyGardenAccess = async (req, res, next) => {
  try {
    const { gardenId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verificar que el huerto existe y obtener información del usuario
    const gardenResult = await db.query(`
      SELECT h.*, u.ubicacion_id as user_location_id, h.ubicacion_id as garden_location_id
      FROM huertos h
      LEFT JOIN usuarios u ON u.id = $1
      WHERE h.id = $2 AND h.is_deleted = false
    `, [userId, gardenId]);

    if (gardenResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }

    const garden = gardenResult.rows[0];

    // Si es huerto privado
    if (garden.tipo === 'privado') {
      // El creador siempre puede acceder
      if (garden.usuario_creador === userId) {
        console.log('✅ Acceso a huerto privado permitido - Usuario es el creador');
      }
      // Admin y técnico pueden ver huertos privados de su condominio
      else if (['administrador', 'tecnico'].includes(userRole) && garden.garden_location_id === garden.user_location_id) {
        console.log('✅ Acceso a huerto privado permitido - Admin/Técnico del mismo condominio');
      }
      // Verificar si el usuario es un residente asignado al huerto
      else {
        const assignmentResult = await db.query(
          'SELECT * FROM usuario_huerto WHERE usuario_id = $1 AND huerto_id = $2 AND is_deleted = false',
          [userId, gardenId]
        );

        if (assignmentResult.rows.length > 0) {
          console.log('✅ Acceso a huerto privado permitido - Usuario es residente asignado');
        } else {
          return res.status(403).json({
            success: false,
            message: 'No tienes permisos para acceder a este huerto privado'
          });
        }
      }
    }

    // Si es huerto público, verificar que sea del mismo condominio
    if (garden.tipo === 'publico') {
      if (garden.garden_location_id !== garden.user_location_id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este huerto público'
        });
      }
      console.log('✅ Acceso a huerto público permitido para:', userRole);
    }

    // Agregar información del huerto al request para uso posterior
    req.garden = garden;
    next();

  } catch (error) {
    console.error('Error en verifyGardenAccess:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * Middleware para verificar permisos de creación de huertos
 * - Huertos privados: Pueden ser creados por residente, técnico o administrador
 * - Huertos públicos: Pueden ser creados por residente, técnico o administrador
 */
export const verifyGardenCreationPermissions = (req, res, next) => {
  const { type } = req.body;
  const userRole = req.user.role;

  // Si no se especifica tipo, asumir privado
  const gardenType = type || 'privado';

  // Verificar que el usuario tiene permisos para crear huertos
  if (!['residente', 'tecnico', 'administrador'].includes(userRole)) {
    return res.status(403).json({
      success: false,
      message: 'No tienes permisos para crear huertos'
    });
  }

  next();
};

/**
 * Middleware para verificar permisos de modificación de huertos
 * - Huertos privados: 
 *   * Creador: Puede modificarlos
 *   * Admin: Puede modificarlos y otorgar permisos
 * - Huertos públicos: Administradores y técnicos pueden modificarlos
 */
export const verifyGardenModificationPermissions = async (req, res, next) => {
  try {
    const { gardenId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verificar que el huerto existe
    const gardenResult = await db.query(`
      SELECT h.*, u.ubicacion_id as user_location_id
      FROM huertos h
      LEFT JOIN usuarios u ON u.id = $1
      WHERE h.id = $2 AND h.is_deleted = false
    `, [userId, gardenId]);

    if (gardenResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Huerto no encontrado'
      });
    }

    const garden = gardenResult.rows[0];

    // Si es huerto privado
    if (garden.tipo === 'privado') {
      // El creador puede modificarlo
      if (garden.usuario_creador === userId) {
        console.log('✅ Permisos de modificación de huerto privado - Usuario es el creador');
      }
      // Admin puede modificar huertos privados de su condominio
      else if (userRole === 'administrador' && garden.ubicacion_id === garden.user_location_id) {
        console.log('✅ Permisos de modificación de huerto privado - Admin del mismo condominio');
      }
      // Otros casos: acceso denegado
      else {
        return res.status(403).json({
          success: false,
          message: 'Solo el creador o un administrador pueden modificar huertos privados'
        });
      }
    }

    // Si es huerto público, administradores y técnicos pueden modificarlo
    if (garden.tipo === 'publico') {
      if (!['administrador', 'tecnico'].includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Solo los administradores y técnicos pueden modificar huertos públicos'
        });
      }
      console.log('✅ Permisos de modificación de huerto público - Admin/Técnico');
    }

    req.garden = garden;
    next();

  } catch (error) {
    console.error('Error en verifyGardenModificationPermissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};
