import { authAPI, handleAPIError } from './apiService';

export const login = async (email, password) => {
  try {
    const response = await authAPI.login({ email, password });
    const { accessToken, refreshToken, user } = response.data;
    
    // Guardar tokens en localStorage
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return {
      success: true,
      message: "Login exitoso",
      user,
      token: accessToken
    };
  } catch (error) {
    const errorMessage = handleAPIError(error);
    throw new Error(errorMessage);
  }
};

export const register = async (formData) => {
  try {
    const response = await authAPI.register(formData);
    const { accessToken, refreshToken, user } = response.data;
    
    // Guardar tokens en localStorage
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return {
      success: true,
      message: "Registro exitoso",
      user,
      token: accessToken
    };
  } catch (error) {
    const errorMessage = handleAPIError(error);
    throw new Error(errorMessage);
  }
};

// Función para obtener datos del usuario actual
export const getCurrentUser = () => {
  const userData = localStorage.getItem("user");
  if (!userData) return null;
  
  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    return null;
  }
};

// Función para cerrar sesión
export const logout = async () => {
  try {
    // Llamar al endpoint de logout del servidor
    await authAPI.logout();
  } catch (error) {
    console.error('Error en logout del servidor:', error);
  } finally {
    // Limpiar localStorage independientemente del resultado
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  }
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  return !!(token && user);
};