import axios from 'axios';

// Configuración base de axios
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
console.log('API_BASE_URL:', API_BASE_URL);

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Aumentar timeout a 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token JWT a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    console.log('🔐 Interceptor de request:', {
      url: config.url,
      hasToken: !!token,
      tokenLength: token?.length,
      method: config.method
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Token agregado a la petición');
    } else {
      console.log('❌ No hay token disponible');
    }
    return config;
  },
  (error) => {
    console.error('❌ Error en interceptor de request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    console.log('✅ Respuesta exitosa de la API:', response.config.url, response.status);
    return response;
  },
  async (error) => {
    console.error('❌ Error en la API:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      hasToken: !!localStorage.getItem('token')
    });
    
    const originalRequest = error.config;

    // Si el token expiró (401) y no hemos intentado renovarlo
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('🔄 Intentando renovar token...');
      originalRequest._retry = true;

      try {
        // Intentar renovar el token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          console.log('🔄 Refresh token encontrado, intentando renovar...');
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          });
          
          const { accessToken: newToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('token', newToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          console.log('✅ Token renovado exitosamente');
          
          // Reintentar la petición original con el nuevo token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          console.log('❌ No hay refresh token disponible');
        }
      } catch (refreshError) {
        console.error('❌ Error al renovar token:', refreshError.message);
        // Si falla la renovación, limpiar tokens y redirigir al login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        console.log('🔄 Redirigiendo al login...');
        
        // Solo redirigir si no estamos en una operación de login/registro
        const isAuthOperation = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register');
        if (!isAuthOperation) {
          window.location.href = '/auth';
        }
      }
    } else if (error.response?.status === 401) {
      console.log('❌ Error 401 - Token inválido o expirado');
      // Solo redirigir si no estamos en una operación de login/registro
      const isAuthOperation = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register');
      
      if (!isAuthOperation) {
        // Si es un error 401 y ya intentamos renovar, limpiar tokens
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/auth';
      }
    }

    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
};

// Servicios de usuarios
export const usersAPI = {
  getProfile: () => {
    console.log('Llamando a getProfile...');
    return api.get('/users/profile');
  },
  updateProfile: (userData) => api.put('/users/profile', userData),
  changePassword: (passwords) => api.put('/users/change-password', passwords),
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  // Servicios de gestión de roles por condominio
  getCondominiumUsers: (search = '') => {
    console.log('Llamando a getCondominiumUsers con search:', search);
    const params = search ? { search } : {};
    return api.get('/users/condominium/users', { params });
  },
  assignTechnicianRole: (userId) => {
    console.log('Llamando a assignTechnicianRole con userId:', userId);
    return api.put(`/users/${userId}/assign-technician`);
  },
  removeTechnicianRole: (userId) => {
    console.log('Llamando a removeTechnicianRole con userId:', userId);
    return api.put(`/users/${userId}/remove-technician`);
  },
};

// Servicios de huertos
export const gardensAPI = {
  getAllGardens: () => api.get('/gardens'),
  getGardenById: (id) => api.get(`/gardens/${id}`),
  createGarden: (gardenData) => api.post('/gardens', gardenData),
  updateGarden: (id, gardenData) => api.put(`/gardens/${id}`, gardenData),
  deleteGarden: (id) => api.delete(`/gardens/${id}`),
  getUserGardens: () => api.get('/gardens/user'),
  assignGarden: (gardenId, userId) => api.post(`/gardens/${gardenId}/assign`, { userId }),
};

// Servicios de inventario
export const inventoryAPI = {
  getAllItems: (filters = {}) => api.get('/inventory', { params: filters }),
  getItemById: (id) => api.get(`/inventory/${id}`),
  createItem: (itemData) => api.post('/inventory', itemData),
  updateItem: (id, itemData) => api.put(`/inventory/${id}`, itemData),
  deleteItem: (id) => api.delete(`/inventory/${id}`),
  getLowStockItems: () => api.get('/inventory/low-stock'),
  updateItemStock: (id, stockData) => api.patch(`/inventory/${id}/stock`, stockData),
  recordItemUsage: (id, usageData) => api.post(`/inventory/${id}/usage`, usageData),
  getItemHistory: (id) => api.get(`/inventory/${id}/history`),
  searchItems: (query) => api.get('/inventory/search', { params: { q: query } }),
};


// Servicios de comentarios
export const commentsAPI = {
  getComments: (resourceType, resourceId) => api.get(`/comments/${resourceType}/${resourceId}`),
  createComment: (commentData) => api.post('/comments', commentData),
  updateComment: (id, commentData) => api.put(`/comments/${id}`, commentData),
  deleteComment: (id) => api.delete(`/comments/${id}`),
  likeComment: (id) => api.post(`/comments/${id}/like`),
  unlikeComment: (id) => api.delete(`/comments/${id}/like`),
};

// Servicios de estadísticas
export const statisticsAPI = {
  getGardenStats: (gardenId) => api.get(`/statistics/gardens/${gardenId}`),
  getUserStats: () => api.get('/statistics/user'),
  getSystemStats: () => api.get('/statistics/system'),
  getGrowthData: (gardenId, plantId) => api.get(`/statistics/growth/${gardenId}/${plantId}`),
  getHarvestData: (gardenId) => api.get(`/statistics/harvest/${gardenId}`),
  getWateringData: (gardenId) => api.get(`/statistics/watering/${gardenId}`),
  // Nuevas funciones para estadísticas específicas con nombre_siembra
  getFertilizerData: (gardenId) => api.get(`/statistics/fertilizer/${gardenId}`),
  getPestData: (gardenId) => api.get(`/statistics/pests/${gardenId}`),
  getWaterData: (gardenId) => api.get(`/statistics/water/${gardenId}`),
};

// Servicios de alertas
export const alertsAPI = {
  getAllAlerts: () => api.get('/alerts'),
  getAlertById: (id) => api.get(`/alerts/${id}`),
  createAlert: (alertData) => api.post('/alerts', alertData),
  updateAlert: (id, alertData) => api.put(`/alerts/${id}`, alertData),
  deleteAlert: (id) => api.delete(`/alerts/${id}`),
  markAsRead: (id) => api.put(`/alerts/${id}/read`),
  getUserAlerts: () => api.get('/alerts/user'),
};

// Servicios de reportes
export const reportsAPI = {
  generateReport: (reportType, params) => api.post('/reports/generate', { type: reportType, params }),
  downloadReport: (reportId) => api.get(`/reports/${reportId}/download`),
  getReportHistory: () => api.get('/reports/history'),
  deleteReport: (id) => api.delete(`/reports/${id}`),
  testAnalyze: (payload) => api.post('/reports/test-analyze', payload, { timeout: 5000 }), // Test rápido
  analyzeReport: (payload) => api.post('/reports/analyze', payload, { timeout: 30000 }), // 30 segundos para análisis IA
};

// Servicios de plantas
export const plantsAPI = {
  getAllPlants: () => api.get('/plants'),
  getPlantById: (id) => api.get(`/plants/${id}`),
  getPlantsByCategory: (category) => api.get(`/plants/category/${category}`),
  searchPlants: (query) => api.get('/plants/search', { params: { q: query } }),
  getPlantGuide: (plantId) => api.get(`/plants/${plantId}/guide`),
};

// Servicios de proveedores
export const providersAPI = {
  getAllProviders: () => {
    console.log('Llamando a getAllProviders...');
    return api.get('/providers');
  },
  getProviderById: (id) => {
    console.log('Llamando a getProviderById con ID:', id);
    return api.get(`/providers/${id}`);
  },
  getProvidersByCategory: (categoryId) => {
    console.log('Llamando a getProvidersByCategory con categoría:', categoryId);
    return api.get(`/providers/category/${categoryId}`);
  },
  createProvider: (providerData) => {
    console.log('Llamando a createProvider con datos:', providerData);
    
    // Estructurar los datos como espera el backend
    const structuredData = {
      nombre_empresa: providerData.nombre_empresa,
      contacto_principal: providerData.contacto_principal,
      telefono: providerData.telefono,
      email: providerData.email || '',
      categorias: providerData.categorias || [], // Enviar categorías directamente
      descripcion: providerData.descripcion || '',
      // Datos de ubicación en el formato que espera el backend
      ubicacion: {
        nombre: providerData.ubicacion?.nombre || '',
        calle: providerData.ubicacion?.calle || '',
        ciudad: providerData.ubicacion?.ciudad || '',
        estado: providerData.ubicacion?.estado || '',
        pais: providerData.ubicacion?.pais || 'Venezuela',
        descripcion: providerData.ubicacion?.descripcion || ''
      }
    };
    
    console.log('Datos estructurados para enviar:', structuredData);
    console.log('Categorías específicas:', {
      categorias: structuredData.categorias,
      tipo: typeof structuredData.categorias,
      esArray: Array.isArray(structuredData.categorias),
      longitud: structuredData.categorias?.length
    });
    console.log('URL de la API:', `${api.defaults.baseURL}/providers`);
    return api.post('/providers', structuredData);
  },
  updateProvider: (id, providerData) => {
    console.log('Llamando a updateProvider con ID:', id, 'y datos:', providerData);
    
    // Estructurar los datos como espera el backend
    const structuredData = {
      nombre_empresa: providerData.nombre_empresa,
      contacto_principal: providerData.contacto_principal,
      telefono: providerData.telefono,
      email: providerData.email || '',
      categorias: providerData.categorias || [], // Enviar categorías directamente
      descripcion: providerData.descripcion || '',
      // Datos de ubicación en el formato que espera el backend
      ubicacion: {
        nombre: providerData.ubicacion?.nombre || '',
        calle: providerData.ubicacion?.calle || '',
        ciudad: providerData.ubicacion?.ciudad || '',
        estado: providerData.ubicacion?.estado || '',
        pais: providerData.ubicacion?.pais || 'Venezuela',
        descripcion: providerData.ubicacion?.descripcion || ''
      }
    };
    
    console.log('Datos estructurados para enviar:', structuredData);
    console.log('Categorías específicas:', {
      categorias: structuredData.categorias,
      tipo: typeof structuredData.categorias,
      esArray: Array.isArray(structuredData.categorias),
      longitud: structuredData.categorias?.length
    });
    return api.put(`/providers/${id}`, structuredData);
  },
  deleteProvider: (id) => {
    console.log('Llamando a deleteProvider con ID:', id);
    return api.delete(`/providers/${id}`);
  },
  searchProviders: (query) => {
    console.log('Llamando a searchProviders con query:', query);
    return api.get('/providers/search', { params: { q: query } });
  },
};

// Función para manejar errores de API de manera consistente
export const handleAPIError = (error) => {
  if (error.response) {
    // El servidor respondió con un código de estado fuera del rango 2xx
    const { status, data } = error.response;
    
    // Manejo específico para errores de autenticación
    if (status === 401) {
      // Verificar si es un error de login específico
      if (data.message) {
        const message = data.message.toLowerCase();
        if (message.includes('credenciales') || message.includes('invalid') || message.includes('incorrect')) {
          return '❌ Credenciales incorrectas. Verifica tu email y contraseña.';
        }
        if (message.includes('email') && message.includes('not found')) {
          return '❌ No existe una cuenta con este email. Verifica el email o regístrate.';
        }
        if (message.includes('password') && message.includes('incorrect')) {
          return '❌ Contraseña incorrecta. Intenta nuevamente.';
        }
        if (message.includes('account') && message.includes('disabled')) {
          return '❌ Tu cuenta está deshabilitada. Contacta al administrador.';
        }
        if (message.includes('email') && message.includes('not verified')) {
          return '❌ Tu email no está verificado. Revisa tu bandeja de entrada.';
        }
        return data.message || '❌ Error de autenticación. Verifica tus credenciales.';
      }
      return '❌ Sesión expirada. Por favor, inicia sesión nuevamente.';
    }
    
    // Manejo específico para errores de registro
    if (status === 400) {
      if (data.message) {
        const message = data.message.toLowerCase();
        if (message.includes('email') && message.includes('already exists')) {
          return '❌ Ya existe una cuenta con este email. Intenta iniciar sesión.';
        }
        if (message.includes('email') && message.includes('invalid')) {
          return '❌ El formato del email no es válido.';
        }
        if (message.includes('password') && message.includes('weak')) {
          return '❌ La contraseña es muy débil. Debe tener al menos 6 caracteres.';
        }
        if (message.includes('password') && message.includes('required')) {
          return '❌ La contraseña es requerida.';
        }
        if (message.includes('name') && message.includes('required')) {
          return '❌ El nombre es requerido.';
        }
        if (message.includes('validation')) {
          return '❌ Datos inválidos. Revisa todos los campos.';
        }
        return data.message || '❌ Datos inválidos enviados al servidor.';
      }
      return '❌ Datos inválidos enviados al servidor.';
    }
    
    switch (status) {
      case 403:
        return '❌ No tienes permisos para realizar esta acción.';
      case 404:
        return '❌ Recurso no encontrado.';
      case 409:
        return '❌ Conflicto: El recurso ya existe.';
      case 422:
        return '❌ Datos de entrada inválidos. Revisa los campos.';
      case 429:
        return '❌ Demasiados intentos. Espera un momento antes de intentar nuevamente.';
      case 500:
        return '❌ Error interno del servidor. Intenta más tarde.';
      case 502:
        return '❌ Servidor no disponible. Intenta más tarde.';
      case 503:
        return '❌ Servicio temporalmente no disponible.';
      default:
        return data.message || `❌ Error del servidor (${status})`;
    }
  } else if (error.request) {
    // La petición fue hecha pero no se recibió respuesta
    return '❌ No se pudo conectar con el servidor. Verifica tu conexión a internet.';
  } else {
    // Algo pasó al configurar la petición
    return '❌ Error al procesar la petición.';
  }
};


export default api;