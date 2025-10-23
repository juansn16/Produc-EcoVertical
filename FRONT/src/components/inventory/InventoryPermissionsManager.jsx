import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  AlertCircle, 
  CheckCircle,
  X,
  Shield,
  Edit,
  TrendingDown,
  History
} from 'lucide-react';
import { 
  getInventoryPermissions,
  assignInventoryPermission,
  revokeInventoryPermission
} from '../../services/inventoryService';
import { getCondominiumUsers } from '../../services/userService';

/**
 * Componente para gestionar permisos de un item de inventario
 * Solo visible y funcional para el dueño del item
 */
export default function InventoryPermissionsManager({ inventoryId, inventoryName, currentUser, onPermissionChange, itemOwnerId }) {
  const [permissions, setPermissions] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');


  useEffect(() => {
    loadData();
  }, [inventoryId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar permisos actuales y usuarios disponibles en paralelo
      const [permissionsResponse, usersResponse] = await Promise.all([
        getInventoryPermissions(inventoryId),
        getCondominiumUsers()
      ]);

      setPermissions(permissionsResponse.data || []);
      setAvailableUsers(usersResponse.users || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPermission = async () => {
    if (!selectedUserId) return;

    try {
      await assignInventoryPermission(inventoryId, {
        userId: selectedUserId,
        permissionType: 'completo' // Permiso completo que abarca todo
      });

      // Recargar permisos
      await loadData();
      
      // Notificar cambio
      if (onPermissionChange) {
        onPermissionChange();
      }

      setShowAssignModal(false);
      setSelectedUserId('');
    } catch (error) {
      console.error('Error asignando permiso:', error);
      setError('Error al asignar permiso');
    }
  };

  const handleRevokePermission = async (userId) => {
    try {
      await revokeInventoryPermission(inventoryId, userId, 'completo');
      
      // Recargar permisos
      await loadData();
      
      // Notificar cambio
      if (onPermissionChange) {
        onPermissionChange();
      }
    } catch (error) {
      console.error('Error revocando permiso:', error);
      setError('Error al revocar permiso');
    }
  };

  const filteredUsers = availableUsers.filter(user => 
    user.id !== currentUser?.id && // Excluir al usuario actual
    user.id !== itemOwnerId && // Excluir al propietario del ítem (ya tiene permisos completos)
    user.rol !== 'administrador' && // Excluir administradores (ya tienen permisos globales)
    user.rol !== 'tecnico' // Excluir técnicos (ya tienen permisos globales)
    // No excluir por rol 'colaborador' ya que no es un rol principal
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
            <Shield className="w-5 h-5 text-blue-600" />
            Gestión de Permisos
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Gestiona quién puede editar, usar, ver historial y eliminar "{inventoryName}"
          </p>
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
        {permissions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>No hay permisos asignados</p>
            <p className="text-sm">Solo tú puedes gestionar este item</p>
          </div>
        ) : (
          permissions.map((permission) => {
            return (
              <div key={permission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{permission.usuario_nombre}</p>
                    <p className="text-sm text-gray-600">Permiso completo - Puede editar, usar, ver historial y eliminar</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRevokePermission(permission.usuario_id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Revocar permiso"
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Modal para asignar permisos */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Asignar Permiso</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Lista de usuarios */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Residentes del Condominio
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg">
                  {filteredUsers.length === 0 ? (
                    <div className="p-3 text-center text-gray-500">
                      No hay residentes disponibles para asignar permisos
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => setSelectedUserId(user.id)}
                        className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                          selectedUserId === user.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {user.nombre.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.nombre}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssignPermission}
                disabled={!selectedUserId}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Asignar Permiso Completo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}