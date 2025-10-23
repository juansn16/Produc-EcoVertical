import React, { useState, useEffect } from 'react';
import { Users, UserPlus, UserMinus, Shield, X, Check, AlertCircle } from 'lucide-react';

const CommentPermissionsManager = ({ 
  comment, 
  isVisible, 
  onClose, 
  onPermissionAssigned, 
  onPermissionRevoked 
}) => {
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedPermission, setSelectedPermission] = useState('editar');
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Cargar usuarios y permisos cuando se abre el modal
  useEffect(() => {
    if (isVisible && comment) {
      loadUsers();
      loadPermissions();
    }
  }, [isVisible, comment]);

  const loadUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/inventory/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  const loadPermissions = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/inventory/comments/${comment.id}/permissions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setPermissions(data.data);
      }
    } catch (error) {
      console.error('Error cargando permisos:', error);
    }
  };

  const handleAssignPermission = async () => {
    if (!selectedUser || !selectedPermission) return;

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/inventory/comments/${comment.id}/assign-permission`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: selectedUser,
          permissionType: selectedPermission
        })
      });

      const data = await response.json();
      if (data.success) {
        await loadPermissions(); // Recargar permisos
        setShowAssignModal(false);
        setSelectedUser('');
        setSelectedPermission('editar');
        if (onPermissionAssigned) {
          onPermissionAssigned(data.data);
        }
      } else {
        alert('Error al asignar permiso: ' + data.message);
      }
    } catch (error) {
      console.error('Error asignando permiso:', error);
      alert('Error al asignar permiso');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokePermission = async (userId, permissionType) => {
    if (!confirm('¿Estás seguro de que quieres revocar este permiso?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/inventory/comments/${comment.id}/revoke-permission/${userId}/${permissionType}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        await loadPermissions(); // Recargar permisos
        if (onPermissionRevoked) {
          onPermissionRevoked({ userId, permissionType });
        }
      } else {
        alert('Error al revocar permiso: ' + data.message);
      }
    } catch (error) {
      console.error('Error revocando permiso:', error);
      alert('Error al revocar permiso');
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible || !comment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Gestionar Permisos</h3>
                <p className="text-sm text-gray-500">
                  Comentario: "{comment.contenido?.substring(0, 50)}..."
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Contenido */}
          <div className="space-y-6">
            {/* Botón para asignar nuevo permiso */}
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-medium text-gray-900">Permisos Asignados</h4>
              <button
                onClick={() => setShowAssignModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Asignar Permiso
              </button>
            </div>

            {/* Lista de permisos */}
            {permissions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No hay permisos asignados para este comentario</p>
              </div>
            ) : (
              <div className="space-y-3">
                {permissions.map((permission) => (
                  <div key={permission.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{permission.usuario_nombre}</p>
                        <p className="text-sm text-gray-500">{permission.usuario_email}</p>
                        <p className="text-xs text-gray-400">
                          {permission.permiso_tipo === 'editar' ? 'Puede editar' : 'Puede eliminar'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {new Date(permission.fecha_asignacion).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleRevokePermission(permission.usuario_id, permission.permiso_tipo)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Revocar permiso"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Modal para asignar permiso */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Asignar Permiso</h4>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Usuario
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Seleccionar usuario...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.nombre} ({user.email}) - {user.rol}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Permiso
                </label>
                <select
                  value={selectedPermission}
                  onChange={(e) => setSelectedPermission(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="editar">Editar</option>
                  <option value="eliminar">Eliminar</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAssignPermission}
                  disabled={!selectedUser || loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Asignando...' : 'Asignar Permiso'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentPermissionsManager;
