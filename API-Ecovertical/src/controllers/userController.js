import bcryptjs from "bcryptjs";
import db from "../config/db.js"; // conexión PostgreSQL pool
import { UserQueries } from "../utils/queries/index.js";

// Helper para no enviar contraseña
const safeUser = (u) => {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
};

export const getMyProfile = async (req, res, next) => {
  try {
    const result = await db.query(UserQueries.getMyProfile, [req.user.id]);
    if (!result.rows.length) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const { nombre, email, telefono, imagen_url } = req.body;

    // Verificar si el email ya existe para otro usuario
    if (email) {
      const existsResult = await db.query(UserQueries.checkEmailExists, [email, req.user.id]);
      if (existsResult.rows.length) return res.status(409).json({ message: "El email ya está en uso" });
    }

    // Actualizar todos los campos incluyendo imagen_url
    await db.query(UserQueries.updateMyProfile, [nombre, email, telefono, imagen_url, req.user.id]);

    // Obtener usuario actualizado con imagen_url
    const updatedResult = await db.query(UserQueries.getUpdatedProfile, [req.user.id]);
    res.json({ message: "Perfil actualizado", user: updatedResult.rows[0] });
  } catch (err) {
    next(err);
  }
};

export const changeMyPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const result = await db.query(UserQueries.getUserPassword, [req.user.id]);
    if (!result.rows.length) return res.status(404).json({ message: "Usuario no encontrado" });

    const ok = await bcryptjs.compare(currentPassword, result.rows[0].password);
    if (!ok) return res.status(400).json({ message: "Contraseña actual incorrecta" });

    const hashed = await bcryptjs.hash(newPassword, 10);
    await db.query(UserQueries.updatePassword, [hashed, req.user.id]);

    res.json({ message: "Contraseña actualizada" });
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { search = "" } = req.query;
    
    // Construir parámetros para la búsqueda
    const searchPattern = `%${search}%`;
    const params = [search, searchPattern, searchPattern];

    const result = await db.query(UserQueries.getUsers, params);
    res.json({ users: result.rows });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const result = await db.query(UserQueries.getUserById, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    const { name, email, role, status } = req.body;

    // Verificar si existe
    const existsResult = await db.query(UserQueries.checkUserExists, [req.params.id]);
    if (!existsResult.rows.length) return res.status(404).json({ message: "Usuario no encontrado" });

    // Validar email único
    if (email) {
      const emailExistsResult = await db.query(UserQueries.checkEmailExistsForUpdate, [email, req.params.id]);
      if (emailExistsResult.rows.length) return res.status(409).json({ message: "El email ya está en uso" });
    }

    await db.query(UserQueries.updateUserById, [name, email, role, status, req.params.id]);

    const updatedResult = await db.query(UserQueries.getUpdatedUserById, [req.params.id]);
    res.json({ message: "Usuario actualizado", user: updatedResult.rows[0] });
  } catch (err) {
    next(err);
  }
};

export const deleteUserById = async (req, res, next) => {
  try {
    const existsResult = await db.query(UserQueries.checkUserExists, [req.params.id]);
    if (!existsResult.rows.length) return res.status(404).json({ message: "Usuario no encontrado" });

    await db.query(UserQueries.deleteUserById, [req.params.id]);
    res.json({ message: "Usuario eliminado" });
  } catch (err) {
    next(err);
  }
};

// Obtener usuarios del mismo condominio
export const getCondominiumUsers = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const { search = "" } = req.query;

    // Obtener la ubicación del administrador
    const adminLocationResult = await db.query(UserQueries.getAdminLocation, [adminId]);

    if (!adminLocationResult.rows.length) {
      return res.status(404).json({ message: 'Administrador no encontrado' });
    }

    const adminLocationId = adminLocationResult.rows[0].ubicacion_id;

    if (!adminLocationId) {
      return res.status(400).json({ 
        message: 'El administrador no tiene una ubicación asignada. Contacta al administrador del sistema.' 
      });
    }

    // Construir parámetros para la búsqueda
    const searchPattern = `%${search}%`;
    const params = [adminLocationId, search, searchPattern];

    const result = await db.query(UserQueries.getCondominiumUsers, params);
    res.json({ users: result.rows });
  } catch (err) {
    console.error('Error in getCondominiumUsers:', err);
    next(err);
  }
};

// Asignar rol de técnico a un usuario del mismo condominio
export const assignTechnicianRole = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const targetUser = req.targetUser;

    // Verificar que el usuario no sea ya técnico
    if (targetUser.rol === 'tecnico') {
      return res.status(400).json({ 
        message: 'El usuario ya tiene el rol de técnico' 
      });
    }

    // Solo se puede asignar rol de técnico a residentes
    if (targetUser.rol !== 'residente') {
      return res.status(400).json({ 
        message: 'Solo se puede asignar el rol de técnico a residentes' 
      });
    }

    // Actualizar el rol del usuario
    await db.query(UserQueries.assignTechnicianRole, [targetUserId]);

    // Obtener el usuario actualizado
    const updatedUserResult = await db.query(UserQueries.getUpdatedUserRole, [targetUserId]);

    res.json({ 
      message: 'Rol de técnico asignado exitosamente',
      user: updatedUserResult.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

// Quitar rol de técnico a un usuario del mismo condominio
export const removeTechnicianRole = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const targetUser = req.targetUser;

    // Verificar que el usuario sea técnico
    if (targetUser.rol !== 'tecnico') {
      return res.status(400).json({ 
        message: 'El usuario no tiene el rol de técnico' 
      });
    }

    // Actualizar el rol del usuario a residente
    await db.query(UserQueries.removeTechnicianRole, [targetUserId]);

    // Obtener el usuario actualizado
    const updatedUserResult = await db.query(UserQueries.getUpdatedUserRole, [targetUserId]);

    res.json({ 
      message: 'Rol de técnico removido exitosamente',
      user: updatedUserResult.rows[0]
    });
  } catch (err) {
    next(err);
  }
};