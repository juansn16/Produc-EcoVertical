import { usersAPI } from './apiService.js';

/**
 * Servicio para gestión de usuarios
 * Funciones relacionadas con usuarios del condominio y gestión de roles
 */

/**
 * Obtener usuarios del mismo condominio (solo para administradores)
 * @param {string} search - Término de búsqueda opcional
 * @returns {Promise<Object>} Lista de usuarios del condominio
 */
export const getCondominiumUsers = async (search = '') => {
  try {
    const response = await usersAPI.getCondominiumUsers(search);
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios del condominio:', error);
    throw new Error(error.response?.data?.message || 'Error al cargar usuarios');
  }
};

/**
 * Asignar rol de técnico a un usuario (solo administradores)
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Resultado de la asignación
 */
export const assignTechnicianRole = async (userId) => {
  try {
    const response = await usersAPI.assignTechnicianRole(userId);
    return response.data;
  } catch (error) {
    console.error('Error al asignar rol de técnico:', error);
    throw new Error(error.response?.data?.message || 'Error al asignar rol de técnico');
  }
};

/**
 * Quitar rol de técnico a un usuario (solo administradores)
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Resultado de la remoción
 */
export const removeTechnicianRole = async (userId) => {
  try {
    const response = await usersAPI.removeTechnicianRole(userId);
    return response.data;
  } catch (error) {
    console.error('Error al quitar rol de técnico:', error);
    throw new Error(error.response?.data?.message || 'Error al quitar rol de técnico');
  }
};

/**
 * Obtener perfil del usuario actual
 * @returns {Promise<Object>} Perfil del usuario
 */
export const getCurrentUserProfile = async () => {
  try {
    const response = await usersAPI.getProfile();
    return response.data;
  } catch (error) {
    console.error('Error al obtener perfil del usuario:', error);
    throw new Error(error.response?.data?.message || 'Error al cargar perfil');
  }
};

/**
 * Actualizar perfil del usuario actual
 * @param {Object} userData - Datos del usuario a actualizar
 * @returns {Promise<Object>} Perfil actualizado
 */
export const updateUserProfile = async (userData) => {
  try {
    const response = await usersAPI.updateProfile(userData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    throw new Error(error.response?.data?.message || 'Error al actualizar perfil');
  }
};

/**
 * Cambiar contraseña del usuario actual
 * @param {Object} passwords - Objeto con currentPassword y newPassword
 * @returns {Promise<Object>} Resultado del cambio
 */
export const changeUserPassword = async (passwords) => {
  try {
    const response = await usersAPI.changePassword(passwords);
    return response.data;
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    throw new Error(error.response?.data?.message || 'Error al cambiar contraseña');
  }
};

export default {
  getCondominiumUsers,
  assignTechnicianRole,
  removeTechnicianRole,
  getCurrentUserProfile,
  updateUserProfile,
  changeUserPassword
};
