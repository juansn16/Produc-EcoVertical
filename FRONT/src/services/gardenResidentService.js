import api from './apiService.js';

/**
 * Servicio para gestionar residentes de huertos
 * Incluye funciones para administradores y residentes
 */

// ============ FUNCIONES PARA ADMINISTRADORES ============

/**
 * Obtener residentes de un huerto (solo administradores)
 * @param {string} gardenId - ID del huerto
 * @returns {Promise<Object>} Lista de residentes
 */
export const getGardenResidents = async (gardenId) => {
  try {
    const response = await api.get(`/gardens/${gardenId}/residents`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener residentes del huerto:', error);
    throw new Error(error.response?.data?.message || 'Error al cargar residentes');
  }
};

/**
 * Asignar residente a un huerto (solo administradores)
 * @param {string} gardenId - ID del huerto
 * @param {string} userId - ID del usuario a asignar
 * @returns {Promise<Object>} Resultado de la asignación
 */
export const assignResidentToGarden = async (gardenId, userId) => {
  try {
    const response = await api.post(`/gardens/${gardenId}/assign`, { userId });
    return response.data;
  } catch (error) {
    console.error('Error al asignar residente al huerto:', error);
    throw new Error(error.response?.data?.message || 'Error al asignar residente');
  }
};

/**
 * Eliminar residente de un huerto (solo administradores)
 * @param {string} gardenId - ID del huerto
 * @param {string} userId - ID del usuario a eliminar
 * @returns {Promise<Object>} Resultado de la eliminación
 */
export const removeResidentFromGarden = async (gardenId, userId) => {
  try {
    const response = await api.delete(`/gardens/${gardenId}/residents/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar residente del huerto:', error);
    throw new Error(error.response?.data?.message || 'Error al eliminar residente');
  }
};

// ============ FUNCIONES PARA RESIDENTES ============

/**
 * Darse de baja de un huerto (solo residentes)
 * @param {string} gardenId - ID del huerto
 * @returns {Promise<Object>} Resultado de la baja
 */
export const unsubscribeFromGarden = async (gardenId) => {
  try {
    const response = await api.delete(`/gardens/${gardenId}/unsubscribe`);
    return response.data;
  } catch (error) {
    console.error('Error al darse de baja del huerto:', error);
    throw new Error(error.response?.data?.message || 'Error al darse de baja');
  }
};

// ============ FUNCIONES AUXILIARES ============

/**
 * Verificar si un usuario está asignado a un huerto
 * @param {string} gardenId - ID del huerto
 * @param {string} userId - ID del usuario
 * @returns {Promise<boolean>} True si está asignado
 */
export const checkUserGardenAssignment = async (gardenId, userId) => {
  try {
    console.log('🔍 Verificando asignación usuario-huerto:', { gardenId, userId });
    const response = await api.get(`/gardens/${gardenId}/residents/${userId}/check`);
    console.log('✅ Verificación de asignación exitosa:', response.data);
    return response.data.success && response.data.data.isAssigned;
  } catch (error) {
    console.error('❌ Error al verificar asignación:', error);
    return false;
  }
};

/**
 * Obtener información de permisos de comentarios para un usuario en un huerto
 * @param {string} gardenId - ID del huerto
 * @param {Object} user - Usuario actual
 * @returns {Promise<Object>} Información de permisos
 */
export const getCommentPermissions = async (gardenId, user) => {
  try {
    console.log('🔍 getCommentPermissions - Parámetros:', { gardenId, user });
    
    if (!user) {
      console.log('❌ getCommentPermissions - No hay usuario');
      return {
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        reason: 'no_user'
      };
    }

    const userRole = user.rol || user.role;
    console.log('🔍 getCommentPermissions - Rol del usuario:', userRole);

    // Administradores y técnicos tienen acceso completo
    if (['administrador', 'tecnico'].includes(userRole)) {
      console.log('✅ getCommentPermissions - Usuario es administrador/técnico, acceso completo');
      return {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canManageResidents: userRole === 'administrador',
        canUnsubscribe: false,
        reason: userRole
      };
    }

    // Para residentes, verificar si está asignado al huerto
    if (userRole === 'residente') {
      console.log('🔍 getCommentPermissions - Usuario es residente, verificando asignación');
      const isAssigned = await checkUserGardenAssignment(gardenId, user.id);
      console.log('🔍 getCommentPermissions - Residente asignado:', isAssigned);
      return {
        canView: true,
        canCreate: isAssigned,
        canEdit: isAssigned,
        canDelete: isAssigned,
        canManageResidents: false,
        canUnsubscribe: isAssigned,
        reason: isAssigned ? 'residente_asignado' : 'residente_no_asignado'
      };
    }

    // Otros roles solo pueden ver
    console.log('❌ getCommentPermissions - Rol no reconocido:', userRole);
    return {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canManageResidents: false,
      canUnsubscribe: false,
      reason: 'sin_permisos'
    };

  } catch (error) {
    console.error('Error al obtener permisos de comentarios:', error);
    return {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canManageResidents: false,
      canUnsubscribe: false,
      reason: 'error'
    };
  }
};

export default {
  getGardenResidents,
  assignResidentToGarden,
  removeResidentFromGarden,
  unsubscribeFromGarden,
  checkUserGardenAssignment,
  getCommentPermissions
};
