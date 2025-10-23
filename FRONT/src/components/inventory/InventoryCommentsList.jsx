import React, { useState, useEffect } from 'react';
import { MessageSquare, Edit, Trash2, Shield, User, Calendar, AlertCircle, Check } from 'lucide-react';
import CommentPermissionsManager from './CommentPermissionsManager';

const InventoryCommentsList = ({ 
  comments, 
  loading, 
  onEdit, 
  onDelete, 
  onPermissionChange 
}) => {
  const [permissions, setPermissions] = useState({});
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);

  // Verificar permisos para cada comentario
  useEffect(() => {
    if (comments && comments.length > 0) {
      checkAllPermissions();
    }
  }, [comments]);

  const checkAllPermissions = async () => {
    const permissionPromises = comments.map(comment => 
      checkCommentPermission(comment.id)
    );
    
    try {
      const results = await Promise.all(permissionPromises);
      const permissionMap = {};
      
      results.forEach((result, index) => {
        if (result) {
          permissionMap[comments[index].id] = result;
        }
      });
      
      setPermissions(permissionMap);
    } catch (error) {
      console.error('Error verificando permisos:', error);
    }
  };

  const checkCommentPermission = async (commentId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/inventory/comments/${commentId}/check-permission?action=editar`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      return data.success ? data : null;
    } catch (error) {
      console.error('Error verificando permiso:', error);
      return null;
    }
  };

  const handleEditComment = (comment) => {
    if (permissions[comment.id]?.canEdit) {
      onEdit(comment);
    } else {
      alert('No tienes permisos para editar este comentario');
    }
  };

  const handleDeleteComment = (comment) => {
    if (permissions[comment.id]?.canEdit) {
      if (confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
        onDelete(comment);
      }
    } else {
      alert('No tienes permisos para eliminar este comentario');
    }
  };

  const handleManagePermissions = (comment) => {
    setSelectedComment(comment);
    setShowPermissionsModal(true);
  };

  const handlePermissionAssigned = (data) => {
    console.log('Permiso asignado:', data);
    if (onPermissionChange) {
      onPermissionChange();
    }
  };

  const handlePermissionRevoked = (data) => {
    console.log('Permiso revocado:', data);
    if (onPermissionChange) {
      onPermissionChange();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-gray-600">Cargando comentarios...</span>
      </div>
    );
  }

  console.log('🔍 InventoryCommentsList - comments:', comments);
  console.log('🔍 InventoryCommentsList - comments length:', comments?.length);
  console.log('🔍 InventoryCommentsList - loading:', loading);

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay comentarios</h3>
        <p className="text-gray-500">Aún no se han agregado comentarios para este inventario.</p>
        <p className="text-xs text-gray-400 mt-2">Debug: comments = {JSON.stringify(comments)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {comments.map((comment) => (
        <div key={comment.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{comment.usuario_nombre}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{comment.usuario_email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(comment.fecha_creacion)}
              </span>
              {permissions[comment.id]?.canEdit && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditComment(comment)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    title="Editar comentario"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Eliminar comentario"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleManagePermissions(comment)}
                    className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                    title="Gestionar permisos"
                  >
                    <Shield className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mb-3">
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{comment.contenido}</p>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                {comment.tipo_comentario}
              </span>
              {comment.cantidad_usada && (
                <span className="text-gray-600 dark:text-gray-400">
                  Cantidad: {comment.cantidad_usada} {comment.unidad_medida}
                </span>
              )}
            </div>
            
            {permissions[comment.id] && (
              <div className="flex items-center gap-1 text-xs">
                {permissions[comment.id].canEdit ? (
                  <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Puedes editar
                  </span>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Solo lectura
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Modal de gestión de permisos */}
      <CommentPermissionsManager
        comment={selectedComment}
        isVisible={showPermissionsModal}
        onClose={() => {
          setShowPermissionsModal(false);
          setSelectedComment(null);
        }}
        onPermissionAssigned={handlePermissionAssigned}
        onPermissionRevoked={handlePermissionRevoked}
      />
    </div>
  );
};

export default InventoryCommentsList;
