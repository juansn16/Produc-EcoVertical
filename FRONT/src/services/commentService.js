import api from './apiService.js';

// Crear nuevo comentario
export const createComment = async (huertoId, commentData) => {
  try {
    const response = await api.post(`/comments/garden/${huertoId}`, commentData);
    return response.data;
  } catch (error) {
    console.error('Error al crear comentario:', error);
    throw new Error(error.response?.data?.message || 'Error al crear el comentario');
  }
};

// Obtener comentarios de un huerto
export const getCommentsByGarden = async (huertoId, page = 1, limit = 10) => {
  try {
    const response = await api.get(`/comments/garden/${huertoId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    throw new Error(error.response?.data?.message || 'Error al cargar comentarios');
  }
};

// Actualizar comentario
export const updateComment = async (commentId, updateData) => {
  try {
    const response = await api.put(`/comments/${commentId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar comentario:', error);
    throw new Error(error.response?.data?.message || 'Error al actualizar el comentario');
  }
};

// Eliminar comentario
export const deleteComment = async (commentId) => {
  try {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    throw new Error(error.response?.data?.message || 'Error al eliminar el comentario');
  }
};

// Obtener estadísticas de comentarios
export const getCommentStats = async (huertoId) => {
  try {
    const response = await api.get(`/comments/stats/${huertoId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas de comentarios:', error);
    throw new Error(error.response?.data?.message || 'Error al cargar estadísticas');
  }
};
