import React, { useState, useEffect } from 'react';
import { Users, Wifi, WifiOff, RefreshCw, Clock, User } from 'lucide-react';
import { irrigationAlertService } from '../../services/irrigationAlertService.js';

const ConnectedUsersWidget = ({ isDarkMode = false, onUpdate = null, connectedUsers = null }) => {
  const [internalConnectedUsers, setInternalConnectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Usar los datos pasados como prop o los datos internos
  const usersToDisplay = connectedUsers || internalConnectedUsers;

  const loadConnectedUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await irrigationAlertService.getConnectedUsers();
      
      if (response.success) {
        setInternalConnectedUsers(response.data.connectedUsers);
        setLastUpdate(new Date());
        
        // Notificar al componente padre que se actualizó
        if (onUpdate) {
          onUpdate();
        }
      } else {
        setError('Error obteniendo usuarios conectados');
      }
    } catch (err) {
      console.error('Error cargando usuarios conectados:', err);
      setError('Error cargando usuarios conectados');
    } finally {
      setLoading(false);
    }
  };

  // Cargar usuarios conectados al montar el componente solo si no se pasan como prop
  useEffect(() => {
    if (!connectedUsers) {
      loadConnectedUsers();
    }
  }, [connectedUsers]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Si se pasan datos como prop, notificar al padre para que actualice
      if (connectedUsers && onUpdate) {
        onUpdate();
      } else {
        // Si no se pasan datos como prop, cargar internamente
        loadConnectedUsers();
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [autoRefresh, connectedUsers, onUpdate]);

  const formatConnectionTime = (fechaConexion) => {
    const now = new Date();
    const connectionTime = new Date(fechaConexion);
    const diffMinutes = Math.floor((now - connectionTime) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Ahora';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  };

  const getRoleColor = (rol) => {
    switch (rol) {
      case 'administrador':
        return isDarkMode ? 'text-red-400' : 'text-red-600';
      case 'tecnico':
        return isDarkMode ? 'text-blue-400' : 'text-blue-600';
      case 'residente':
        return isDarkMode ? 'text-green-400' : 'text-green-600';
      default:
        return isDarkMode ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const getRoleBadgeColor = (rol) => {
    switch (rol) {
      case 'administrador':
        return isDarkMode ? 'bg-red-900/30 text-red-300 border-red-700/50' : 'bg-red-100 text-red-800 border-red-200';
      case 'tecnico':
        return isDarkMode ? 'bg-blue-900/30 text-blue-300 border-blue-700/50' : 'bg-blue-100 text-blue-800 border-blue-200';
      case 'residente':
        return isDarkMode ? 'bg-green-900/30 text-green-300 border-green-700/50' : 'bg-green-100 text-green-800 border-green-200';
      default:
        return isDarkMode ? 'bg-gray-700/30 text-gray-300 border-gray-600/50' : 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Agrupar usuarios por ID para mostrar múltiples conexiones
  const groupedUsers = usersToDisplay.reduce((acc, user) => {
    if (!acc[user.usuario_id]) {
      acc[user.usuario_id] = {
        ...user,
        connections: []
      };
    }
    acc[user.usuario_id].connections.push(user);
    return acc;
  }, {});

  const uniqueUsers = Object.values(groupedUsers);

  return (
    <div className={`${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
          <div>
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Usuarios Activos
            </h2>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Usuarios conectados en tiempo real
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={loadConnectedUsers}
            disabled={loading}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'
            } ${loading ? 'opacity-50' : ''}`}
            title="Actualizar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              autoRefresh
                ? isDarkMode 
                  ? 'bg-green-900/30 text-green-300 border border-green-700/50' 
                  : 'bg-green-100 text-green-800 border border-green-200'
                : isDarkMode 
                  ? 'bg-gray-700/30 text-gray-300 border border-gray-600/50' 
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}
          >
            {autoRefresh ? 'Auto' : 'Manual'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6">
        <div className={`${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'} rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <Users className={`w-4 h-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Usuarios Activos
            </span>
          </div>
          <p className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            {uniqueUsers.length}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className={`${isDarkMode ? 'bg-red-900/30 border-red-700/50' : 'bg-red-50 border-red-200'} border rounded-lg p-4 mb-4`}>
          <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
            {error}
          </p>
        </div>
      )}

      {/* Users List */}
      <div className="space-y-3">
        {uniqueUsers.length === 0 ? (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <WifiOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hay usuarios conectados</p>
          </div>
        ) : (
          uniqueUsers.map((user) => (
            <div
              key={user.usuario_id}
              className={`${isDarkMode ? 'bg-slate-700/30 border-slate-600/50' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                  }`}>
                    <User className={`w-4 h-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  </div>
                  
                  <div>
                    <h3 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {user.nombre}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getRoleBadgeColor(user.rol)}`}>
                        {user.rol}
                      </span>
                      <div className="flex items-center gap-1">
                        {user.isOnline ? (
                          <Wifi className="w-3 h-3 text-green-500" />
                        ) : (
                          <WifiOff className="w-3 h-3 text-red-500" />
                        )}
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {user.isOnline ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock className={`w-3 h-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatConnectionTime(user.fecha_conexion)}
                  </span>
                </div>
              </div>
              
            </div>
          ))
        )}
      </div>

      {/* Last Update */}
      {lastUpdate && (
        <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-4 text-center`}>
          Última actualización: {lastUpdate.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default ConnectedUsersWidget;
