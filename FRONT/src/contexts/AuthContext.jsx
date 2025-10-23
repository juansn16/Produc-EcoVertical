import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import logger from '../utils/logger';

const AuthContext = createContext();

export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar token al cargar la aplicación
    const storedToken = localStorage.getItem('token');
    logger.log('Verificando token almacenado:', { 
      hasToken: !!storedToken, 
      tokenLength: storedToken?.length 
    });
    
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        const currentTime = Date.now() / 1000;
        
        logger.log('Token decodificado:', { 
          id: decoded.id, 
          role: decoded.role, 
          exp: decoded.exp, 
          currentTime,
          isExpired: decoded.exp <= currentTime
        });
        
        if (decoded.exp > currentTime) {
          setToken(storedToken);
          setUser(decoded);
          logger.log('Usuario autenticado:', decoded);
        } else {
          // Token expirado
          logger.log('Token expirado, limpiando localStorage');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error decodificando token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      console.log('No se encontró token en localStorage');
    }
    
    // Escuchar cambios en el usuario
    const handleUserUpdate = (event) => {
      console.log('🔄 Usuario actualizado en AuthContext:', event.detail);
      setUser(event.detail);
    };
    
    window.addEventListener('userUpdated', handleUserUpdate);
    
    setLoading(false);
    
    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);

  const login = (token, userData) => {
    try {
      const decoded = jwtDecode(token);
      setToken(token);
      setUser(decoded);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(decoded));
    } catch (error) {
      console.error('Error al procesar login:', error);
      throw new Error('Token inválido');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (updatedUserData) => {
    console.log('🔄 Actualizando usuario en AuthContext:', {
      updatedUserData,
      currentUser: user,
      willUpdate: true
    });
    
    setUser(prevUser => {
      const newUser = {
        ...prevUser,
        ...updatedUserData
      };
      console.log('🔄 Usuario actualizado en estado:', newUser);
      return newUser;
    });
    
    // También actualizar el localStorage si existe
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const currentUser = JSON.parse(storedUser);
        const updatedUser = { ...currentUser, ...updatedUserData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        logger.log('Usuario actualizado en localStorage:', updatedUser);
      } catch (error) {
        console.error('Error actualizando usuario en localStorage:', error);
      }
    } else {
      logger.log('⚠️ No hay usuario almacenado en localStorage');
    }
  };

  const hasRole = (requiredRole) => {
    if (!user) return false;
    
    // Usar tanto 'role' como 'rol' para compatibilidad
    const userRole = user.role || user.rol;
    
    // Verificar si el usuario tiene el rol requerido
    if (userRole === requiredRole) {
      return true;
    }
    
    // El administrador tiene acceso a todo
    if (userRole === 'administrador') {
      return true;
    }
    
    return false;
  };

  const canAccess = (permission) => {
    if (!user) {
      return false;
    }
    
    // Usar tanto 'role' como 'rol' para compatibilidad
    const userRole = user.role || user.rol;
    
    const permissions = {
      // Residente - Solo puede ver y usar, no crear ni modificar
      'view_public_info': ['residente', 'tecnico', 'administrador'],
      'add_comments': ['residente', 'tecnico', 'administrador'],
      'edit_comments': ['residente', 'tecnico', 'administrador'],
      'delete_comments': ['residente', 'tecnico', 'administrador'],
      'view_inventory': ['residente', 'tecnico', 'administrador'],
      'update_stock': ['residente', 'tecnico', 'administrador'], // Solo modificar stock existente
      'record_usage': ['residente', 'tecnico', 'administrador'], // Registrar uso de items
      'view_providers': ['residente', 'tecnico', 'administrador'],
      'download_reports': ['residente', 'tecnico', 'administrador'],
      'view_statistics': ['residente', 'tecnico', 'administrador'], // Agregado para residentes
      
      // Técnico - Puede hacer todo excepto gestión de roles
      'create_inventory': ['residente', 'tecnico', 'administrador'],
      'edit_inventory': ['residente', 'tecnico', 'administrador'], // Los residentes pueden editar sus propios ítems
      'delete_inventory': ['residente', 'tecnico', 'administrador'], // Los residentes pueden eliminar sus propios ítems
      'manage_inventory': ['tecnico', 'administrador'],
      'create_providers': ['tecnico', 'administrador'],
      'edit_providers': ['tecnico', 'administrador'],
      'delete_providers': ['tecnico', 'administrador'],
      'create_alerts': ['tecnico', 'administrador'],
      'manage_gardens': ['tecnico', 'administrador'],
      'manage_irrigation_alerts': ['tecnico', 'administrador'],
      'view_private_gardens': ['tecnico', 'administrador'], // Ver huertos privados del condominio
      'comment_private_gardens': ['tecnico', 'administrador'], // Comentar en huertos privados
      
      // Administrador - Acceso completo
      'manage_users': ['administrador'],
      'assign_technician_role': ['administrador'],
      'remove_technician_role': ['administrador'],
      'system_config': ['administrador'],
      'financial_reports': ['administrador'],
      'manage_residents': ['administrador'], // Solo admins pueden gestionar residentes
      'modify_private_gardens': ['administrador'], // Solo admins pueden modificar huertos privados
      'assign_garden_permissions': ['administrador'], // Solo admins pueden otorgar permisos
      'all_permissions': ['administrador']
    };
    
    return permissions[permission]?.includes(userRole) || false;
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    hasRole,
    canAccess,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 