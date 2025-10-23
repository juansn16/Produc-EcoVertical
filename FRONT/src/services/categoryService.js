import apiService from './apiService';

export const categoryAPI = {
  // Obtener todas las categorías
  getAll: async () => {
    try {
      const response = await apiService.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw error;
    }
  },

  // Obtener una categoría por ID
  getById: async (id) => {
    try {
      const response = await apiService.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener categoría:', error);
      throw error;
    }
  }
};

// También mantener la exportación por defecto para compatibilidad
export default categoryAPI;