import api from './apiService';

// Obtener todos los items de inventario
export const getInventoryItems = async (params = {}) => {
  try {
    const response = await api.get('/inventory', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener items de inventario:', error);
    throw error;
  }
};

// Obtener un item de inventario por ID
export const getInventoryItem = async (id) => {
  try {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener item de inventario:', error);
    throw error;
  }
};

// Crear un nuevo item de inventario
export const createInventoryItem = async (itemData) => {
  try {
    const response = await api.post('/inventory', itemData);
    return response.data;
  } catch (error) {
    console.error('Error al crear item de inventario:', error);
    throw error;
  }
};

// Actualizar un item de inventario
export const updateInventoryItem = async (id, itemData) => {
  try {
    const response = await api.put(`/inventory/${id}`, itemData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar item de inventario:', error);
    throw error;
  }
};

// Eliminar un item de inventario
export const deleteInventoryItem = async (id) => {
  try {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar item de inventario:', error);
    throw error;
  }
};

// Actualizar stock de un item
export const updateItemStock = async (id, stockData) => {
  try {
    const response = await api.patch(`/inventory/${id}/stock`, stockData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar stock:', error);
    throw error;
  }
};

// Registrar uso de un item
export const recordItemUsage = async (id, usageData) => {
  try {
    const response = await api.post(`/inventory/${id}/usage`, usageData);
    return response.data;
  } catch (error) {
    console.error('Error al registrar uso:', error);
    throw error;
  }
};

// Obtener historial de un item
export const getItemHistory = async (id) => {
  try {
    const response = await api.get(`/inventory/${id}/history`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener historial:', error);
    throw error;
  }
};

// Obtener items con bajo stock
export const getLowStockItems = async () => {
  try {
    const response = await api.get('/inventory/low-stock');
    return response.data;
  } catch (error) {
    console.error('Error al obtener items con bajo stock:', error);
    throw error;
  }
};

// Obtener comentarios de uso de un item de inventario
export const getInventoryUsageComments = async (inventoryId, page = 1, limit = 10) => {
  try {
    const response = await api.get(`/comments/inventory/${inventoryId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener comentarios de uso:', error);
    throw error;
  }
};

// Verificar permiso de usuario para un item de inventario
export const checkInventoryPermission = async (inventoryId, permissionType) => {
  try {
    const response = await api.get(`/inventory/${inventoryId}/permissions/check`, {
      params: { permissionType }
    });
    return response.data;
  } catch (error) {
    console.error('Error al verificar permiso:', error);
    throw error;
  }
};

// Obtener permisos de un item de inventario
export const getInventoryPermissions = async (inventoryId) => {
  try {
    const response = await api.get(`/inventory/${inventoryId}/permissions`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener permisos:', error);
    throw error;
  }
};

// Asignar permiso a un usuario para un item de inventario
export const assignInventoryPermission = async (inventoryId, permissionData) => {
  try {
    const response = await api.post(`/inventory/${inventoryId}/permissions`, permissionData);
    return response.data;
  } catch (error) {
    console.error('Error al asignar permiso:', error);
    throw error;
  }
};

// Revocar permiso de un usuario para un item de inventario
export const revokeInventoryPermission = async (inventoryId, userId, permissionType) => {
  try {
    const response = await api.delete(`/inventory/${inventoryId}/permissions/${userId}/${permissionType}`);
    return response.data;
  } catch (error) {
    console.error('Error al revocar permiso:', error);
    throw error;
  }
};

// ==================== FUNCIONES PARA COMENTARIOS DE INVENTARIO ====================

// Obtener comentarios de un item de inventario
export const getInventoryComments = async (inventoryId) => {
  try {
    const response = await api.get(`/inventory/${inventoryId}/comments`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    throw error;
  }
};

// Obtener TODOS los comentarios de inventario (solo admin/tecnico)
export const getAllInventoryComments = async () => {
  try {
    const response = await api.get(`/inventory/comments/all`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener todos los comentarios:', error);
    throw error;
  }
};

// Obtener todos los comentarios de inventario del usuario (NO automáticos)
export const getUserInventoryComments = async () => {
  try {
    const response = await api.get(`/inventory/user/comments`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener comentarios del usuario:', error);
    throw error;
  }
};

// Crear comentario de inventario
export const createInventoryComment = async (commentData) => {
  try {
    const response = await api.post(`/inventory/comments`, commentData);
    return response.data;
  } catch (error) {
    console.error('Error al crear comentario de inventario:', error);
    throw error;
  }
};

// Verificar permiso de comentario
export const checkCommentPermission = async (commentId, permissionType) => {
  try {
    const response = await api.get(`/inventory/comments/${commentId}/permissions/check?permissionType=${permissionType}`);
    return response.data;
  } catch (error) {
    console.error('Error al verificar permiso de comentario:', error);
    throw error;
  }
};

// Obtener permisos de un comentario
export const getCommentPermissions = async (commentId) => {
  try {
    const response = await api.get(`/inventory/comments/${commentId}/permissions`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener permisos de comentario:', error);
    throw error;
  }
};

// Asignar permiso a un comentario
export const assignCommentPermission = async (commentId, permissionData) => {
  try {
    const response = await api.post(`/inventory/comments/${commentId}/permissions`, permissionData);
    return response.data;
  } catch (error) {
    console.error('Error al asignar permiso de comentario:', error);
    throw error;
  }
};

// Revocar permiso de un comentario
export const revokeCommentPermission = async (commentId, userId, permissionType) => {
  try {
    const response = await api.delete(`/inventory/comments/${commentId}/permissions/${userId}/${permissionType}`);
    return response.data;
  } catch (error) {
    console.error('Error al revocar permiso de comentario:', error);
    throw error;
  }
};

