import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  AlertCircle, 
  CheckCircle,
  X,
  Search,
  Shield,
  MessageSquare,
  Edit,
  Trash2
} from 'lucide-react';
import { getCondominiumUsers } from '../../services/userService';
import { 
  getCommentPermissions,
  assignCommentPermission,
  revokeCommentPermission
} from '../../services/inventoryService';

/**
 * Componente para gestionar permisos de comentarios de inventario
 * Permite al dueño de un comentario asignar permisos a otros usuarios
 */
export default function InventoryCommentPermissionsManager({ 
  commentId, 
  commentContent, 
  currentUser, 
  onPermissionChange 
}) {
  const [permissions, setPermissions] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedPermissionType, setSelectedPermissionType] = useState('editar');

  const permissionTypes = [
    { value: 'editar', label: 'Editar', icon: Edit, description: 'Puede modificar este comentario' },
    { value: 'eliminar', label: 'Eliminar', icon: Trash2, description: 'Puede eliminar este comentario' }
  ];

  useEffect(() => {
    loadData();
  }, [commentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar usuarios disponibles y permisos en paralelo
      const [usersResponse, permissionsResponse] = await Promise.all([
        getCondominiumUsers(),
        getCommentPermissions(commentId)
      ]);
      
      setAvailableUsers(usersResponse.data || []);
      setPermissions(permissionsResponse.data || []);

      console.log('📝 Comentario seleccionado:', commentId);
      console.log('👥 Usuarios disponibles:', usersResponse.data?.length || 0);
      console.log('🔐 Permisos actuales:', permissionsResponse.data?.length || 0);

    } catch (err) {
      console.error('❌ Error cargando datos:', err);
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPermission = async (userId, permissionType) => {
    try {
      setError(null);
      
      // Asignar permiso usando el backend
      await assignCommentPermission(commentId, { userId, permissionType });
      
      // Recargar permisos
      await loadData();
      
      setShowAssignModal(false);
      setSelectedUserId('');
      setSelectedPermissionType('editar');
      
      if (onPermissionChange) {
        onPermissionChange({ action: 'assign', userId, permissionType });
      }
      
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al asignar permiso');
    }
  };

  const handleRevokePermission = async (permission) => {
    try {
      setError(null);
      
      // Revocar permiso usando el backend
      await revokeCommentPermission(commentId, permission.usuario_id, permission.permiso_tipo);
      
      // Recargar permisos
      await loadData();
      
      if (onPermissionChange) {
        onPermissionChange({ action: 'revoke', permission });
      }
      
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al revocar permiso');
    }
  };

  const filteredUsers = availableUsers.filter(user => 
    user.id !== currentUser?.id && 
    user.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando permisos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Gestión de Permisos de Comentario
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Gestiona quién puede editar y eliminar este comentario
          </p>
          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Comentario:</strong> {commentContent}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAssignModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Asignar Permiso
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Lista de permisos actuales */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Permisos Asignados</h4>
        {permissions.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay permisos asignados para este comentario.</p>
        ) : (
          permissions.map(permission => (
            <div key={permission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">{permission.usuario_nombre}</p>
                  <p className="text-sm text-gray-600">
                    Permiso: <span className="font-semibold">{permission.permiso_tipo}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRevokePermission(permission)}
                className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                title="Revocar permiso"
              >
                <UserMinus className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal para asignar permisos */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Asignar Permiso</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar Usuario
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Usuario
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  <option value="">Seleccionar usuario</option>
                  {filteredUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.nombre} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Permiso
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={selectedPermissionType}
                  onChange={(e) => setSelectedPermissionType(e.target.value)}
                >
                  {permissionTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleAssignPermission(selectedUserId, selectedPermissionType)}
                disabled={!selectedUserId}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Asignar Permiso
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
