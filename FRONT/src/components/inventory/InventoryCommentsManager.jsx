import React, { useState } from 'react';
import { MessageSquare, User, Calendar, Package, Shield, Users, X } from 'lucide-react';
import InventoryCommentsList from './InventoryCommentsList';

const InventoryCommentsManager = ({ comments, loading, onClose, onAssignPermissions }) => {
  const [selectedComment, setSelectedComment] = useState(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const handleAssignPermissions = (comment) => {
    setSelectedComment(comment);
    setShowPermissionModal(true);
  };

  const handleClosePermissionModal = () => {
    setShowPermissionModal(false);
    setSelectedComment(null);
  };

  const handleEditComment = (comment) => {
    console.log('Editar comentario:', comment);
    // TODO: Implementar edición de comentario
  };

  const handleDeleteComment = (comment) => {
    console.log('Eliminar comentario:', comment);
    // TODO: Implementar eliminación de comentario
  };

  const handlePermissionChange = () => {
    console.log('Permisos cambiados, recargando...');
    // TODO: Recargar comentarios
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" style={{backgroundColor: '#fffedb'}}>
          <div className="p-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
              <span className="ml-2 text-gray-700">Cargando comentarios...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden" style={{backgroundColor: '#fffedb'}}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Comentarios de Inventario</h3>
                <p className="text-sm text-gray-600">Gestiona comentarios y asigna permisos a residentes</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Lista de comentarios con permisos */}
          <div className="max-h-96 overflow-y-auto">
            <InventoryCommentsList
              comments={comments}
              loading={loading}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
              onPermissionChange={handlePermissionChange}
            />
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors border border-gray-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryCommentsManager;
