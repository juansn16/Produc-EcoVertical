import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserMinus, Shield, Users, AlertTriangle } from 'lucide-react';
import { getInventoryPermissions, assignInventoryPermission, revokeInventoryPermission } from '@/services/inventoryService';
import { getCondominiumUsers } from '@/services/userService';

const InventoryPermissionsModal = ({ isVisible, onClose, inventoryId, inventoryName }) => {
  const [permissions, setPermissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedPermission, setSelectedPermission] = useState('editar');
  const [showAddForm, setShowAddForm] = useState(false);

  const permissionTypes = [
    { value: 'editar', label: 'Editar', icon: '✏️', color: 'blue' },
    { value: 'usar', label: 'Usar', icon: '📦', color: 'orange' },
    { value: 'ver_historial', label: 'Ver Historial', icon: '📊', color: 'purple' }
  ];

  useEffect(() => {
    if (isVisible && inventoryId) {
      loadPermissions();
      loadUsers();
    }
  }, [isVisible, inventoryId]);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const response = await getInventoryPermissions(inventoryId);
      setPermissions(response.data || []);
    } catch (error) {
      console.error('Error al cargar permisos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await getCondominiumUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

  const handleAssignPermission = async () => {
    if (!selectedUser || !selectedPermission) return;

    try {
      setLoading(true);
      await assignInventoryPermission(inventoryId, selectedUser, selectedPermission);
      await loadPermissions();
      setSelectedUser('');
      setSelectedPermission('editar');
      setShowAddForm(false);
    } catch (error) {
      console.error('Error al asignar permiso:', error);
      alert('Error al asignar permiso: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokePermission = async (userId, permissionType) => {
    if (!confirm('¿Estás seguro de que quieres revocar este permiso?')) return;

    try {
      setLoading(true);
      await revokeInventoryPermission(inventoryId, userId, permissionType);
      await loadPermissions();
    } catch (error) {
      console.error('Error al revocar permiso:', error);
      alert('Error al revocar permiso: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getPermissionInfo = (type) => {
    return permissionTypes.find(p => p.value === type) || { label: type, icon: '❓', color: 'gray' };
  };

  const getPermissionColor = (type) => {
    const info = getPermissionInfo(type);
    const colors = {
      blue: 'bg-blue-100 text-blue-800',
      orange: 'bg-orange-100 text-orange-800',
      purple: 'bg-purple-100 text-purple-800',
      gray: 'bg-gray-100 text-gray-800'
    };
    return colors[info.color] || colors.gray;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Shield className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Gestión de Permisos</h2>
              <p className="text-sm text-gray-600">{inventoryName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Add Permission Form */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Asignar Permisos</h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                {showAddForm ? 'Cancelar' : 'Nuevo Permiso'}
              </button>
            </div>

            {showAddForm && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Usuario
                    </label>
                    <select
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Seleccionar usuario</option>
                      {users.map(user => (
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
                      value={selectedPermission}
                      onChange={(e) => setSelectedPermission(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {permissionTypes.map(permission => (
                        <option key={permission.value} value={permission.value}>
                          {permission.icon} {permission.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleAssignPermission}
                      disabled={!selectedUser || loading}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Asignando...' : 'Asignar'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Permissions List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Permisos Asignados</h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600">Cargando permisos...</span>
              </div>
            ) : permissions.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No hay permisos asignados</p>
                <p className="text-sm text-gray-400">Solo el dueño puede gestionar este item</p>
              </div>
            ) : (
              <div className="space-y-3">
                {permissions.map((permission) => {
                  const permissionInfo = getPermissionInfo(permission.permiso_tipo);
                  return (
                    <div
                      key={`${permission.usuario_id}-${permission.permiso_tipo}`}
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getPermissionColor(permission.permiso_tipo)}`}>
                          <span className="text-lg">{permissionInfo.icon}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{permission.usuario_nombre}</p>
                          <p className="text-sm text-gray-600">{permission.usuario_email}</p>
                          <p className="text-xs text-gray-500">
                            Asignado el {new Date(permission.fecha_asignacion).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPermissionColor(permission.permiso_tipo)}`}>
                          {permissionInfo.label}
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
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <AlertTriangle className="w-4 h-4" />
            <span>Solo el dueño del item puede gestionar permisos</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryPermissionsModal;
