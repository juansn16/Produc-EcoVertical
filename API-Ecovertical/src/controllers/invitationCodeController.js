import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

// Helper para generar códigos únicos de 6 caracteres
const generateInvitationCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Verificar si un código ya existe
const isCodeUnique = async (code) => {
  const [rows] = await db.query(
    'SELECT id FROM codigos_invitacion WHERE codigo = ? AND is_deleted = 0',
    [code]
  );
  return rows.length === 0;
};

// Generar código único
const generateUniqueCode = async () => {
  let code;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    code = generateInvitationCode();
    isUnique = await isCodeUnique(code);
    attempts++;
  }

  if (!isUnique) {
    throw new Error('No se pudo generar un código único después de múltiples intentos');
  }

  return code;
};

// Crear nuevo código de invitación
export const createInvitationCode = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const { expiracion_dias = 7 } = req.body;

    // Verificar que el usuario es administrador
    if (req.user.role !== 'administrador') {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden generar códigos de invitación'
      });
    }

    // Obtener ubicación del administrador
    const [adminLocation] = await db.query(
      'SELECT ubicacion_id FROM usuarios WHERE id = ? AND is_deleted = 0',
      [adminId]
    );

    if (!adminLocation.length) {
      return res.status(404).json({
        success: false,
        message: 'Administrador no encontrado'
      });
    }

    const ubicacionId = adminLocation[0].ubicacion_id;

    if (!ubicacionId) {
      return res.status(400).json({
        success: false,
        message: 'El administrador no tiene una ubicación asignada'
      });
    }

    // Desactivar código anterior si existe
    await db.query(
      'UPDATE codigos_invitacion SET esta_activo = 0, updated_at = NOW() WHERE administrador_id = ? AND esta_activo = 1',
      [adminId]
    );

    // Generar nuevo código único
    const codigo = await generateUniqueCode();
    const fechaExpiracion = new Date();
    fechaExpiracion.setDate(fechaExpiracion.getDate() + expiracion_dias);

    // Crear nuevo código
    const [result] = await db.query(
      `INSERT INTO codigos_invitacion 
       (id, codigo, administrador_id, ubicacion_id, esta_activo, fecha_expiracion) 
       VALUES (?, ?, ?, ?, 1, ?)`,
      [uuidv4(), codigo, adminId, ubicacionId, fechaExpiracion]
    );

    res.status(201).json({
      success: true,
      message: 'Código de invitación generado exitosamente',
      data: {
        id: result.insertId,
        codigo,
        fecha_expiracion: fechaExpiracion,
        expiracion_dias
      }
    });

  } catch (error) {
    console.error('Error creando código de invitación:', error);
    next(error);
  }
};

// Obtener código actual del administrador
export const getCurrentInvitationCode = async (req, res, next) => {
  try {
    const adminId = req.user.id;

    // Verificar que el usuario es administrador
    if (req.user.role !== 'administrador') {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden ver códigos de invitación'
      });
    }

    const [rows] = await db.query(
      `SELECT id, codigo, fecha_creacion, fecha_expiracion, esta_activo, usado_por, fecha_uso
       FROM codigos_invitacion 
       WHERE administrador_id = ? AND esta_activo = 1 AND is_deleted = 0
       ORDER BY fecha_creacion DESC 
       LIMIT 1`,
      [adminId]
    );

    if (!rows.length) {
      return res.json({
        success: true,
        message: 'No hay código de invitación activo',
        data: null
      });
    }

    const codigo = rows[0];
    const ahora = new Date();
    const estaExpirado = codigo.fecha_expiracion && new Date(codigo.fecha_expiracion) < ahora;

    res.json({
      success: true,
      data: {
        ...codigo,
        esta_expirado: estaExpirado,
        dias_restantes: codigo.fecha_expiracion 
          ? Math.ceil((new Date(codigo.fecha_expiracion) - ahora) / (1000 * 60 * 60 * 24))
          : null
      }
    });

  } catch (error) {
    console.error('Error obteniendo código de invitación:', error);
    next(error);
  }
};

// Eliminar código de invitación
export const deleteInvitationCode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    // Verificar que el usuario es administrador
    if (req.user.role !== 'administrador') {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden eliminar códigos de invitación'
      });
    }

    // Verificar que el código pertenece al administrador
    const [rows] = await db.query(
      'SELECT id FROM codigos_invitacion WHERE id = ? AND administrador_id = ? AND is_deleted = 0',
      [id, adminId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Código de invitación no encontrado'
      });
    }

    // Eliminar código (soft delete)
    await db.query(
      'UPDATE codigos_invitacion SET is_deleted = 1, updated_at = NOW() WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Código de invitación eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando código de invitación:', error);
    next(error);
  }
};

// Validar código de invitación (para el registro)
export const validateInvitationCode = async (req, res, next) => {
  try {
    const { codigo } = req.body;

    if (!codigo || codigo.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'El código debe tener exactamente 6 caracteres'
      });
    }

    const [rows] = await db.query(
      `SELECT ci.id, ci.codigo, ci.administrador_id, ci.ubicacion_id, ci.fecha_expiracion,
              u.nombre as admin_nombre, u.email as admin_email,
              ub.nombre as ubicacion_nombre, ub.ciudad, ub.estado
       FROM codigos_invitacion ci
       JOIN usuarios u ON ci.administrador_id = u.id
       JOIN ubicaciones ub ON ci.ubicacion_id = ub.id
       WHERE ci.codigo = ? AND ci.esta_activo = 1 AND ci.is_deleted = 0`,
      [codigo]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Código de invitación no válido o no encontrado'
      });
    }

    const codigoData = rows[0];
    const ahora = new Date();
    const estaExpirado = codigoData.fecha_expiracion && new Date(codigoData.fecha_expiracion) < ahora;

    if (estaExpirado) {
      return res.status(400).json({
        success: false,
        message: 'El código de invitación ha expirado'
      });
    }

    // El código puede ser usado múltiples veces hasta que expire
    // No validamos usado_por ya que permitimos múltiples usos

    res.json({
      success: true,
      message: 'Código de invitación válido',
      data: {
        codigo: codigoData.codigo,
        administrador: {
          nombre: codigoData.admin_nombre,
          email: codigoData.admin_email
        },
        ubicacion: {
          nombre: codigoData.ubicacion_nombre,
          ciudad: codigoData.ciudad,
          estado: codigoData.estado
        },
        fecha_expiracion: codigoData.fecha_expiracion
      }
    });

  } catch (error) {
    console.error('Error validando código de invitación:', error);
    next(error);
  }
};

// Obtener historial de códigos del administrador
export const getInvitationCodeHistory = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    // Verificar que el usuario es administrador
    if (req.user.role !== 'administrador') {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden ver el historial de códigos'
      });
    }

    const offset = (page - 1) * limit;

    const [rows] = await db.query(
      `SELECT ci.id, ci.codigo, ci.fecha_creacion, ci.fecha_expiracion, ci.esta_activo,
              ci.usado_por, ci.fecha_uso,
              u.nombre as usuario_nombre, u.email as usuario_email
       FROM codigos_invitacion ci
       LEFT JOIN usuarios u ON ci.usado_por = u.id
       WHERE ci.administrador_id = ? AND ci.is_deleted = 0
       ORDER BY ci.fecha_creacion DESC
       LIMIT ? OFFSET ?`,
      [adminId, parseInt(limit), parseInt(offset)]
    );

    // Contar total de registros
    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM codigos_invitacion WHERE administrador_id = ? AND is_deleted = 0',
      [adminId]
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        codigos: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo historial de códigos:', error);
    next(error);
  }
};
