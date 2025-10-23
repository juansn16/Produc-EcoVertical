import bcryptjs from "bcryptjs";
import db from "../config/db.js"; // conexión mysql2 pool

// Helper para no enviar contraseña
const safeUser = (u) => {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
};

export const getMyProfile = async (req, res, next) => {
  try {
    const [rows] = await db.query("SELECT id, nombre, email, rol, telefono, ubicacion_id, imagen_url FROM usuarios WHERE id = ? AND is_deleted = 0", [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const { nombre, email, telefono, imagen_url } = req.body;

    // Verificar si el email ya existe para otro usuario
    if (email) {
      const [exists] = await db.query("SELECT id FROM usuarios WHERE email = ? AND id <> ? AND is_deleted = 0", [email, req.user.id]);
      if (exists.length) return res.status(409).json({ message: "El email ya está en uso" });
    }

    // Actualizar todos los campos incluyendo imagen_url
    await db.query(
      "UPDATE usuarios SET nombre = COALESCE(?, nombre), email = COALESCE(?, email), telefono = COALESCE(?, telefono), imagen_url = COALESCE(?, imagen_url) WHERE id = ? AND is_deleted = 0",
      [nombre, email, telefono, imagen_url, req.user.id]
    );

    // Obtener usuario actualizado con imagen_url
    const [updated] = await db.query("SELECT id, nombre, email, rol, telefono, ubicacion_id, imagen_url FROM usuarios WHERE id = ? AND is_deleted = 0", [req.user.id]);
    res.json({ message: "Perfil actualizado", user: updated[0] });
  } catch (err) {
    next(err);
  }
};

export const changeMyPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const [rows] = await db.query("SELECT password FROM usuarios WHERE id = ? AND is_deleted = 0", [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: "Usuario no encontrado" });

    const ok = await bcryptjs.compare(currentPassword, rows[0].password);
    if (!ok) return res.status(400).json({ message: "Contraseña actual incorrecta" });

    const hashed = await bcryptjs.hash(newPassword, 10);
    await db.query("UPDATE usuarios SET password = ? WHERE id = ? AND is_deleted = 0", [hashed, req.user.id]);

    res.json({ message: "Contraseña actualizada" });
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { search = "" } = req.query;
    let query = "SELECT id, name, email, role, status, avatar FROM users";
    let params = [];

    if (search) {
      query += " WHERE name LIKE ? OR email LIKE ?";
      params.push(`%${search}%`, `%${search}%`);
    }

    const [rows] = await db.query(query, params);
    res.json({ users: rows });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, role, status, avatar FROM users WHERE id = ?",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    const { name, email, role, status } = req.body;

    // Verificar si existe
    const [exists] = await db.query("SELECT id FROM users WHERE id = ?", [req.params.id]);
    if (!exists.length) return res.status(404).json({ message: "Usuario no encontrado" });

    // Validar email único
    if (email) {
      const [emailExists] = await db.query("SELECT id FROM users WHERE email = ? AND id <> ?", [email, req.params.id]);
      if (emailExists.length) return res.status(409).json({ message: "El email ya está en uso" });
    }

    await db.query(
      "UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), role = COALESCE(?, role), status = COALESCE(?, status) WHERE id = ?",
      [name, email, role, status, req.params.id]
    );

    const [updated] = await db.query("SELECT id, name, email, role, status, avatar FROM users WHERE id = ?", [req.params.id]);
    res.json({ message: "Usuario actualizado", user: updated[0] });
  } catch (err) {
    next(err);
  }
};

export const deleteUserById = async (req, res, next) => {
  try {
    const [exists] = await db.query("SELECT id FROM users WHERE id = ?", [req.params.id]);
    if (!exists.length) return res.status(404).json({ message: "Usuario no encontrado" });

    await db.query("DELETE FROM users WHERE id = ?", [req.params.id]);
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
    const [adminLocation] = await db.query(
      "SELECT ubicacion_id FROM usuarios WHERE id = ? AND is_deleted = 0",
      [adminId]
    );

    if (!adminLocation.length) {
      return res.status(404).json({ message: 'Administrador no encontrado' });
    }

    const adminLocationId = adminLocation[0].ubicacion_id;

    if (!adminLocationId) {
      return res.status(400).json({ 
        message: 'El administrador no tiene una ubicación asignada. Contacta al administrador del sistema.' 
      });
    }

    // Buscar usuarios del mismo condominio
    let query = `
      SELECT u.id, u.nombre, u.cedula, u.telefono, u.email, u.rol, u.created_at
      FROM usuarios u 
      WHERE u.ubicacion_id = ? AND u.is_deleted = 0
    `;
    let params = [adminLocationId];

    if (search) {
      query += " AND (u.nombre LIKE ? OR u.email LIKE ? OR u.cedula LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += " ORDER BY u.nombre ASC";

    const [rows] = await db.query(query, params);
    res.json({ users: rows });
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
    await db.query(
      "UPDATE usuarios SET rol = 'tecnico' WHERE id = ?",
      [targetUserId]
    );

    // Obtener el usuario actualizado
    const [updatedUser] = await db.query(
      "SELECT id, nombre, email, rol FROM usuarios WHERE id = ?",
      [targetUserId]
    );

    res.json({ 
      message: 'Rol de técnico asignado exitosamente',
      user: updatedUser[0]
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
    await db.query(
      "UPDATE usuarios SET rol = 'residente' WHERE id = ?",
      [targetUserId]
    );

    // Obtener el usuario actualizado
    const [updatedUser] = await db.query(
      "SELECT id, nombre, email, rol FROM usuarios WHERE id = ?",
      [targetUserId]
    );

    res.json({ 
      message: 'Rol de técnico removido exitosamente',
      user: updatedUser[0]
    });
  } catch (err) {
    next(err);
  }
};