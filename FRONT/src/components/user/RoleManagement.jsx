import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  UserMinus, 
  Shield, 
  Wrench, 
  User,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import { usersAPI, handleAPIError } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function RoleManagement() {
  const { user, updateUser } = useAuth();
  const { isDarkMode } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersAPI.getCondominiumUsers(searchTerm);
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Error loading users:', err);
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      
      // Si no hay usuarios, mostrar mensaje específico
      if (err.response?.status === 400 && err.response?.data?.message?.includes('ubicación')) {
        setError('El administrador no tiene una ubicación asignada. Contacta al administrador del sistema.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadUsers();
  };

  const handleAssignTechnician = async (userId, userName) => {
    if (!confirm(`¿Estás seguro de que quieres asignar el rol de técnico a ${userName}?`)) {
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      setError(null);
      
      const response = await usersAPI.assignTechnicianRole(userId);
      
      setSuccess(`Rol de técnico asignado exitosamente a ${userName}`);
      setTimeout(() => setSuccess(null), 3000);
      
      // Si el usuario actual es el que se está modificando, actualizar el contexto
      console.log('🔍 Verificando si es el usuario actual:', {
        currentUserId: user?.id,
        targetUserId: userId,
        isCurrentUser: user && user.id === userId,
        user: user
      });
      
      if (user && user.id === userId) {
        console.log('🔄 Actualizando rol del usuario actual a técnico');
        updateUser({ rol: 'tecnico', role: 'tecnico' });
      } else {
        console.log('ℹ️ No es el usuario actual, no se actualiza el contexto');
      }
      
      // Recargar la lista de usuarios
      loadUsers();
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };


  const handleRemoveTechnician = async (userId, userName) => {
    if (!confirm(`¿Estás seguro de que quieres quitar el rol de técnico a ${userName}?`)) {
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      setError(null);
      
      const response = await usersAPI.removeTechnicianRole(userId);
      
      setSuccess(`Rol de técnico removido exitosamente de ${userName}`);
      setTimeout(() => setSuccess(null), 3000);
      
      // Si el usuario actual es el que se está modificando, actualizar el contexto
      console.log('🔍 Verificando si es el usuario actual (remove):', {
        currentUserId: user?.id,
        targetUserId: userId,
        isCurrentUser: user && user.id === userId,
        user: user
      });
      
      if (user && user.id === userId) {
        console.log('🔄 Actualizando rol del usuario actual a residente');
        updateUser({ rol: 'residente', role: 'residente' });
      } else {
        console.log('ℹ️ No es el usuario actual, no se actualiza el contexto');
      }
      
      // Recargar la lista de usuarios
      loadUsers();
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const getRoleIcon = (role) => {
    const icons = {
      administrador: <Shield size={16} className={isDarkMode ? "text-red-400" : "text-red-600"} />,
      tecnico: <Wrench size={16} className={isDarkMode ? "text-blue-400" : "text-blue-600"} />,
      residente: <User size={16} className={isDarkMode ? "text-green-400" : "text-green-600"} />
    };
    return icons[role] || icons.residente;
  };

  const getRoleColor = (role) => {
    const colors = {
      administrador: isDarkMode 
        ? 'bg-red-900/20 text-red-300 border-red-700' 
        : 'bg-red-100 text-red-800 border-red-200',
      tecnico: isDarkMode 
        ? 'bg-blue-900/20 text-blue-300 border-blue-700' 
        : 'bg-blue-100 text-blue-800 border-blue-200',
      residente: isDarkMode 
        ? 'bg-green-900/20 text-green-300 border-green-700' 
        : 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[role] || colors.residente;
  };

  const getRoleName = (role) => {
    const names = {
      administrador: 'Administrador',
      tecnico: 'Técnico',
      residente: 'Residente'
    };
    return names[role] || role;
  };

  const canManageUser = (user) => {
    // Solo se pueden gestionar residentes y técnicos, no otros administradores
    return user.rol !== 'administrador';
  };

  const canAssignTechnician = (user) => {
    return user.rol === 'residente';
  };

  const canRemoveTechnician = (user) => {
    return user.rol === 'tecnico';
  };

  if (loading) {
    return (
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-sm border p-8`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="animate-spin h-8 w-8 text-[#2E8B57] mx-auto mb-4" />
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>Cargando usuarios del condominio...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-sm border p-8`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#2E8B57] rounded-full flex items-center justify-center text-white">
            <Users size={24} />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Gestión de Roles</h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Administra los roles de los usuarios de tu condominio</p>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} size={20} />
          <input
            type="text"
            placeholder="Buscar usuarios por nombre, email o cédula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E8B57] focus:border-transparent ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'border-gray-300'
            }`}
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#2E8B57] text-white px-4 py-2 rounded-lg hover:bg-[#1f6b3f] transition-colors"
          >
            Buscar
          </button>
        </div>
      </form>

      {/* Mensajes de estado */}
      {error && (
        <div className={`mb-6 p-4 border rounded-xl flex items-center gap-3 ${
          isDarkMode 
            ? 'bg-red-900/20 border-red-700' 
            : 'bg-red-50 border-red-200'
        }`}>
          <AlertCircle className={isDarkMode ? "text-red-400" : "text-red-600"} size={20} />
          <p className={`${isDarkMode ? 'text-red-300' : 'text-red-800'} font-medium`}>{error}</p>
        </div>
      )}

      {success && (
        <div className={`mb-6 p-4 border rounded-xl flex items-center gap-3 ${
          isDarkMode 
            ? 'bg-green-900/20 border-green-700' 
            : 'bg-green-50 border-green-200'
        }`}>
          <CheckCircle className={isDarkMode ? "text-green-400" : "text-green-600"} size={20} />
          <p className={`${isDarkMode ? 'text-green-300' : 'text-green-800'} font-medium`}>{success}</p>
        </div>
      )}


      {/* Lista de usuarios */}
      <div className="space-y-4">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <Users className={`mx-auto ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mb-4`} size={48} />
            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>No se encontraron usuarios</h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {searchTerm ? 'No hay usuarios que coincidan con tu búsqueda' : 'No hay usuarios en tu condominio'}
            </p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className={`flex items-center justify-between p-6 rounded-xl border transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 hover:border-gray-500' 
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                  isDarkMode 
                    ? 'bg-gray-600 border-gray-500' 
                    : 'bg-white border-gray-200'
                }`}>
                  {getRoleIcon(user.rol)}
                </div>
                <div>
                  <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.nombre}</h3>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>{user.email}</p>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>Cédula: {user.cedula}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-lg font-medium text-sm border ${getRoleColor(user.rol)}`}>
                  {getRoleIcon(user.rol)}
                  <span className="ml-1">{getRoleName(user.rol)}</span>
                </span>

                {canManageUser(user) && (
                  <div className="flex gap-2">
                    {canAssignTechnician(user) && (
                      <button
                        onClick={() => handleAssignTechnician(user.id, user.nombre)}
                        disabled={actionLoading[user.id]}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading[user.id] ? (
                          <Loader className="animate-spin" size={16} />
                        ) : (
                          <UserPlus size={16} />
                        )}
                        <span>Hacer Técnico</span>
                      </button>
                    )}

                    {canRemoveTechnician(user) && (
                      <button
                        onClick={() => handleRemoveTechnician(user.id, user.nombre)}
                        disabled={actionLoading[user.id]}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading[user.id] ? (
                          <Loader className="animate-spin" size={16} />
                        ) : (
                          <UserMinus size={16} />
                        )}
                        <span>Quitar Técnico</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Información adicional */}
      <div className={`mt-8 p-4 border rounded-xl ${
        isDarkMode 
          ? 'bg-blue-900/20 border-blue-700' 
          : 'bg-blue-50 border-blue-200'
      }`}>
        <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>Información sobre la gestión de roles</h4>
        <ul className={`${isDarkMode ? 'text-blue-400' : 'text-blue-800'} text-sm space-y-1`}>
          <li>• Solo puedes gestionar usuarios de tu mismo condominio</li>
          <li>• Los residentes pueden ser promovidos a técnicos</li>
          <li>• Los técnicos pueden ser degradados a residentes</li>
          <li>• No puedes modificar el rol de otros administradores</li>
        </ul>
      </div>
    </div>
  );
}
