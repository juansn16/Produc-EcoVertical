import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requiredPermission = null,
  fallback = '/auth',
  showUnauthorized = false 
}) => {
  const { user, loading, isAuthenticated, hasRole, canAccess } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eco-mountain-meadow"></div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to={fallback} state={{ from: location }} replace />;
  }

  // Si se requiere un rol específico
  if (requiredRole && !hasRole(requiredRole)) {
    if (showUnauthorized) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Acceso No Autorizado
            </h1>
            <p className="text-gray-600 mb-6">
              No tienes permisos para acceder a esta página.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-eco-mountain-meadow text-white rounded-lg hover:bg-eco-mountain-meadow-dark transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      );
    }
    return <Navigate to="/unauthorized" replace />;
  }

  // Si se requiere un permiso específico
  if (requiredPermission && !canAccess(requiredPermission)) {
    if (showUnauthorized) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Permiso Insuficiente
            </h1>
            <p className="text-gray-600 mb-6">
              No tienes los permisos necesarios para realizar esta acción.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-eco-mountain-meadow text-white rounded-lg hover:bg-eco-mountain-meadow-dark transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      );
    }
    return <Navigate to="/unauthorized" replace />;
  }

  // Si pasa todas las verificaciones, mostrar el contenido
  return children;
};

export default ProtectedRoute; 