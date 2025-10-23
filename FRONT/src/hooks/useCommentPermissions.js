import { useState, useEffect } from 'react';
import { getCurrentUser } from '../services/authService';
import { getCommentPermissions } from '../services/gardenResidentService';

/**
 * Hook personalizado para manejar permisos de comentarios
 * Determina qué acciones puede realizar un usuario en base a su rol y asignación al huerto
 */
export const useCommentPermissions = (gardenId, currentUser = null) => {
  const [permissions, setPermissions] = useState({
    canView: true,      // Todos pueden ver comentarios
    canCreate: false,   // Solo residentes asignados, técnicos y administradores
    canEdit: false,     // Solo el autor del comentario, técnicos y administradores
    canDelete: false,   // Solo el autor del comentario, técnicos y administradores
    canManageResidents: false, // Solo administradores
    canUnsubscribe: false,     // Solo residentes asignados
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
            canManageResidents: false,
            canUnsubscribe: false,
            reason: 'no_user'
          });
          setLoading(false);
          return;
        }

        // Usar el servicio para obtener permisos reales
        const permissions = await getCommentPermissions(gardenId, currentUser);
        setPermissions(permissions);

      } catch (error) {
        console.error('Error determinando permisos de comentarios:', error);
        setPermissions({
          canView: true,
          canCreate: false,
          canEdit: false,
          canDelete: false,
          canManageResidents: false,
          canUnsubscribe: false,
          reason: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    determinePermissions();
  }, [gardenId, currentUser]);

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
    
    // Residentes solo pueden editar sus propios comentarios SI tienen permisos para comentar
    if (userRole === 'residente' && comment.usuario_id === currentUser.id) {
      // Verificar que tenga permisos para comentar en este huerto
      return permissions.canEdit;
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
    
    // Residentes solo pueden eliminar sus propios comentarios SI tienen permisos para comentar
    if (userRole === 'residente' && comment.usuario_id === currentUser.id) {
      // Verificar que tenga permisos para comentar en este huerto
      return permissions.canDelete;
    }
    
    return false;
  };

  /**
   * Obtiene el mensaje de error apropiado para mostrar al usuario
   * @param {string} action - La acción que se intentó realizar
   * @returns {string}
   */
  const getErrorMessage = (action) => {
    const messages = {
      create: 'No tienes permisos para crear comentarios en este huerto',
      edit: 'No tienes permisos para editar este comentario',
      delete: 'No tienes permisos para eliminar este comentario',
      manage: 'Solo los administradores pueden gestionar residentes'
    };

    return messages[action] || 'No tienes permisos para realizar esta acción';
  };

  return {
    permissions,
    loading,
    canEditComment,
    canDeleteComment,
    getErrorMessage
  };
};

export default useCommentPermissions;
