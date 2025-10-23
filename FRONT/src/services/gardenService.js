import api from './apiService.js';

// Obtener todos los huertos del dominio del administrador
export const getAllGardensForAdmin = async () => {
  try {
    const response = await api.get('/gardens/user');
    return {
      success: true,
      data: {
        gardens: response.data.data || []
      }
    };
  } catch (error) {
    console.error('Error al obtener todos los huertos:', error);
    throw new Error(error.response?.data?.message || 'Error al cargar huertos');
  }
};

// Obtener jardines públicos
export const getPublicGardens = async () => {
  try {
    const response = await api.get('/gardens', {
      params: { type: 'publico' }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener jardines públicos:', error);
    throw new Error(error.response?.data?.message || 'Error al cargar jardines públicos');
  }
};

// Obtener jardines privados del usuario
export const getPrivateGardens = async (userId) => {
  try {
    console.log('🔍 getPrivateGardens - Solicitando huertos privados...');
    const response = await api.get('/gardens', {
      params: { type: 'privado' }
    });
    console.log('✅ getPrivateGardens - Respuesta:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener jardines privados:', error);
    throw new Error(error.response?.data?.message || 'Error al cargar jardines privados');
  }
};

// Crear nuevo jardín (privado o público)
export const createPrivateGarden = async (gardenData) => {
  try {
    // Obtener el usuario actual para usar su ubicación
    const userResponse = await api.get('/users/profile');
    const currentUser = userResponse.data.user;
    
    console.log('👤 Usuario actual:', currentUser);
    
    let locationId;
    
    // Si el usuario tiene ubicación asignada, usarla
    if (currentUser.ubicacion_id) {
      locationId = currentUser.ubicacion_id;
      console.log('✅ Usando ubicación asignada del usuario:', locationId);
    } else {
      // Si no tiene ubicación, crear una nueva (fallback)
      console.log('⚠️ Usuario sin ubicación asignada, creando nueva ubicación');
      const locationData = {
        nombre: gardenData.ubicacion || 'Ubicación por defecto',
        calle: gardenData.ubicacion || 'Calle no especificada',
        ciudad: 'Bogotá',
        estado: 'Cundinamarca',
        pais: 'Colombia'
      };

      const locationResponse = await api.post('/locations', locationData);
      locationId = locationResponse.data.data.id;
      console.log('📍 Nueva ubicación creada:', locationResponse.data);
    }

    // Crear el jardín con la ubicación
    const gardenPayload = {
      name: gardenData.nombre,
      location: locationId,
      type: gardenData.tipo || 'privado', // Usar el tipo especificado o privado por defecto
      dimensions: gardenData.superficie,
      plantCapacity: gardenData.capacidad || 10, // Usar la capacidad especificada o 10 por defecto
      description: gardenData.descripcion,
      ...(gardenData.imagen_url && { imageUrl: gardenData.imagen_url }) // Incluir imagen si se proporciona
    };

    console.log('🌱 Creando huerto con payload:', gardenPayload);

    const response = await api.post('/gardens', gardenPayload);
    return {
      success: true,
      garden: response.data.data,
      message: `Jardín ${gardenData.tipo || 'privado'} creado exitosamente`
    };
  } catch (error) {
    console.error('Error al crear jardín:', error);
    if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Datos inválidos para crear el jardín');
    }
    throw new Error(error.response?.data?.message || 'Error al crear el jardín');
  }
};

// Unirse a un jardín público (solo para residentes)
export const joinPublicGarden = async (gardenId, userId) => {
  try {
    const response = await api.post(`/gardens/${gardenId}/assign`, {
      userId: userId
    });
    return {
      success: true,
      message: `Te has unido exitosamente al jardín`,
      garden: response.data.data
    };
  } catch (error) {
    console.error('Error al unirse al jardín:', error);
    throw new Error(error.response?.data?.message || 'Error al unirse al jardín');
  }
};

// Acceder directamente a un jardín (para administradores y técnicos)
export const accessGarden = async (gardenId) => {
  try {
    // Para administradores y técnicos, solo necesitamos obtener los detalles del jardín
    // No necesitamos asignarlos como residentes
    const response = await api.get(`/gardens/${gardenId}`);
    return {
      success: true,
      message: `Acceso al jardín autorizado`,
      garden: response.data.data
    };
  } catch (error) {
    console.error('Error al acceder al jardín:', error);
    throw new Error(error.response?.data?.message || 'Error al acceder al jardín');
  }
};

// Obtener detalles de un jardín específico
export const getGardenDetails = async (gardenId) => {
  try {
    const response = await api.get(`/gardens/${gardenId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener detalles del jardín:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener detalles del jardín');
  }
};

// Obtener plantas/datos del jardín
export const getGardenPlants = async (gardenId) => {
  try {
    const response = await api.get(`/gardens/${gardenId}/plants`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener plantas del jardín:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener plantas del jardín');
  }
};

// Registrar datos del jardín (agua, siembra, cosecha, etc.)
export const recordGardenData = async (gardenId, data) => {
  try {
    const response = await api.post(`/gardens/${gardenId}/data`, data);
    return response.data;
  } catch (error) {
    console.error('Error al registrar datos del jardín:', error);
    throw new Error(error.response?.data?.message || 'Error al registrar datos del jardín');
  }
};

// Obtener historial de mantenimiento
export const getMaintenanceHistory = async (gardenId, startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await api.get(`/gardens/${gardenId}/maintenance`, { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener historial de mantenimiento:', error);
    throw new Error(error.response?.data?.message || 'Error al obtener historial de mantenimiento');
  }
};

// Registrar mantenimiento
export const recordMaintenance = async (gardenId, maintenanceData) => {
  try {
    const response = await api.post(`/gardens/${gardenId}/maintenance`, maintenanceData);
    return response.data;
  } catch (error) {
    console.error('Error al registrar mantenimiento:', error);
    throw new Error(error.response?.data?.message || 'Error al registrar mantenimiento');
  }
};

// Actualizar jardín
export const updateGarden = async (gardenId, updateData) => {
  try {
    const response = await api.put(`/gardens/${gardenId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar jardín:', error);
    throw new Error(error.response?.data?.message || 'Error al actualizar jardín');
  }
};

// Actualizar imagen del huerto
export const updateGardenImage = async (gardenId, imageUrl) => {
  try {
    const response = await api.put(`/gardens/${gardenId}`, {
      imageUrl: imageUrl
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar imagen del huerto:', error);
    throw new Error(error.response?.data?.message || 'Error al actualizar imagen del huerto');
  }
};

// Eliminar jardín
export const deleteGarden = async (gardenId) => {
  try {
    const response = await api.delete(`/gardens/${gardenId}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar jardín:', error);
    throw new Error(error.response?.data?.message || 'Error al eliminar jardín');
  }
};