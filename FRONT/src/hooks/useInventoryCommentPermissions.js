import { useState, useEffect } from 'react';
import { getCurrentUser } from '../services/authService';

/**
 * Hook personalizado para manejar permisos de comentarios de inventario
 * Determina qué acciones puede realizar un usuario en base a su rol
 */
export const useInventoryCommentPermissions = (currentUser = null) => {
  const [permissions, setPermissions] = useState({
    canView: true,      // Todos pueden ver comentarios
    canCreate: true,    // Todos pueden crear comentarios de inventario
    canEdit: false,     // Solo el autor del comentario, técnicos y administradores
    canDelete: false,   // Solo el autor del comentario, técnicos y administradores
    reason: 'loading'   // Razón del permiso para debugging
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const determinePermissions = async () => {
      try {
        setLoading(true);
        
        // Si no hay usuario, solo puede ver
        if (!currentUser) {
          setPermissions({
            canView: true,
            canCreate: false,
            canEdit: false,
            canDelete: false,
            reason: 'no_user'
          });
          setLoading(false);
          return;
        }

        // Obtener el rol del usuario (manejar tanto 'rol' como 'role')
        const userRole = currentUser.rol || currentUser.role;
        
        // Todos los usuarios autenticados pueden crear comentarios de inventario
        setPermissions({
          canView: true,
          canCreate: true,
          canEdit: false, // Se determinará por comentario individual
          canDelete: false, // Se determinará por comentario individual
          reason: 'authenticated_user'
        });

      } catch (error) {
        console.error('Error determinando permisos de comentarios de inventario:', error);
        setPermissions({
          canView: true,
          canCreate: false,
          canEdit: false,
          canDelete: false,
          reason: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    determinePermissions();
  }, [currentUser]);

  /**
   * Verifica si el usuario puede editar un comentario específico
   * @param {Object} comment - El comentario a verificar
   * @returns {boolean}
   */
  const canEditComment = (comment) => {
    if (!comment || !currentUser) return false;
    
    // Obtener el rol del usuario (manejar tanto 'rol' como 'role')
    const userRole = currentUser.rol || currentUser.role;
    
    // Administradores y técnicos pueden editar cualquier comentario
    if (['administrador', 'tecnico'].includes(userRole)) {
      return true;
    }
    
    // Residentes solo pueden editar sus propios comentarios
    if (userRole === 'residente' && comment.usuario_id === currentUser.id) {
      return true;
    }
    
    return false;
  };

  /**
   * Verifica si el usuario puede eliminar un comentario específico
   * @param {Object} comment - El comentario a verificar
   * @returns {boolean}
   */
  const canDeleteComment = (comment) => {
    if (!comment || !currentUser) return false;
    
    // Obtener el rol del usuario (manejar tanto 'rol' como 'role')
    const userRole = currentUser.rol || currentUser.role;
    
    // Administradores y técnicos pueden eliminar cualquier comentario
    if (['administrador', 'tecnico'].includes(userRole)) {
      return true;
    }
    
    // Residentes solo pueden eliminar sus propios comentarios
    if (userRole === 'residente' && comment.usuario_id === currentUser.id) {
      return true;
    }
    
    return false;
  };

  return {
    permissions,
    loading,
    canEditComment,
    canDeleteComment
  };
};
