import { jwtDecode } from 'jwt-decode';

/**
 * Utilidades para manejo de autenticación
 */

/**
 * Obtiene el ID del usuario desde el token almacenado
 * @returns {string|null} - ID del usuario o null si no está disponible
 */
export const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const decoded = jwtDecode(token);
    return decoded.id || decoded.userId || null;
  } catch (error) {
    console.error('Error decodificando token:', error);
    return null;
  }
};

/**
 * Obtiene información completa del usuario desde el token
 * @returns {Object|null} - Información del usuario o null si no está disponible
 */
export const getUserFromToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const decoded = jwtDecode(token);
    return {
      id: decoded.id || decoded.userId,
      nombre: decoded.nombre || decoded.name,
      email: decoded.email,
      rol: decoded.rol || decoded.role
    };
  } catch (error) {
    console.error('Error decodificando token:', error);
    return null;
  }
};

/**
 * Verifica si el token está expirado
 * @returns {boolean} - true si está expirado, false si es válido
 */
export const isTokenExpired = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return true;
    
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp <= currentTime;
  } catch (error) {
    console.error('Error verificando expiración del token:', error);
    return true;
  }
};

/**
 * Verifica si el usuario está autenticado (token válido y no expirado)
 * @returns {boolean} - true si está autenticado, false en caso contrario
 */
export const isUserAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (!token || !user) return false;
  
  return !isTokenExpired();
};
