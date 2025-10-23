import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEventContext } from '../contexts/EventContext';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/layout/Header';
import CreateIrrigationAlertModal from '../components/irrigation/CreateIrrigationAlertModal';
import IrrigationAlertsList from '../components/irrigation/IrrigationAlertsList';
import IrrigationAlertStats from '../components/irrigation/IrrigationAlertStats';
import ConnectedUsersWidget from '../components/irrigation/ConnectedUsersWidget';
import useWebSocket from '../hooks/useWebSocket';
import { irrigationAlertService } from '../services/irrigationAlertService';
import { Plus, AlertTriangle, Calendar, Clock, Users, Eye, EyeOff } from 'lucide-react';

const IrrigationAlertsPage = () => {
  const { user, hasRole } = useAuth();
  const { gardenRefreshTrigger } = useEventContext();
  const { isConnected, lastMessage } = useWebSocket();
  const { isDarkMode } = useTheme();
  
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [stats, setStats] = useState(null);
  const [showConnectedUsers, setShowConnectedUsers] = useState(false);
  const [connectedUsersData, setConnectedUsersData] = useState([]);

  // Verificar permisos
  const canManageAlerts = hasRole('administrador') || hasRole('tecnico');
  const canViewStats = hasRole('administrador');

  useEffect(() => {
    if (!canManageAlerts) {
      setError('No tienes permisos para acceder a esta página');
      setLoading(false);
      return;
    }

    loadAlerts();
    if (canViewStats) {
      loadStats().then(() => {
        // Después de cargar las estadísticas, actualizar el conteo de usuarios
        loadConnectedUsersCount();
      });
    }
  }, [canManageAlerts, canViewStats]);

  // Manejar mensajes del WebSocket
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'irrigationAlert':
          console.log('🚨 Alerta de riego recibida:', lastMessage.data);
          // Recargar alertas para mostrar cambios
          loadAlerts();
          break;
        case 'preIrrigationAlert':
          console.log('⏰ Pre-notificación de riego recibida:', lastMessage.data);
          // Recargar alertas para mostrar cambios
          loadAlerts();
          break;
        case 'newAlertNotification':
          console.log('📢 Nueva notificación de alerta:', lastMessage.data);
          loadAlerts();
          break;
        default:
          break;
      }
    }
  }, [lastMessage]);

  const loadAlerts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await irrigationAlertService.getAllAlerts({
        page,
        limit: pagination.limit
      });

      if (response.success) {
        setAlerts(response.data.alerts);
        setPagination(response.data.pagination);
      } else {
        setError('Error cargando alertas');
      }
    } catch (err) {
      console.error('Error cargando alertas:', err);
      setError('Error cargando alertas');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await irrigationAlertService.getAlertStats();
      if (response.success) {
        setStats(response.data);
        return response.data;
      }
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  };

  const loadConnectedUsersCount = async () => {
    try {
      const response = await irrigationAlertService.getConnectedUsers();
      if (response.success) {
        // Guardar los datos de usuarios conectados
        setConnectedUsersData(response.data.connectedUsers);
        
        // Agrupar usuarios por ID para contar usuarios únicos
        const groupedUsers = response.data.connectedUsers.reduce((acc, user) => {
          if (!acc[user.usuario_id]) {
            acc[user.usuario_id] = user;
          }
          return acc;
        }, {});
        
        const uniqueUsersCount = Object.keys(groupedUsers).length;
        
        // Actualizar las estadísticas con el conteo correcto
        setStats(prevStats => {
          if (prevStats) {
            return {
              ...prevStats,
              onlineUsers: uniqueUsersCount
            };
          }
          return prevStats;
        });
      }
    } catch (err) {
      console.error('Error cargando conteo de usuarios conectados:', err);
    }
  };

  const handleCreateAlert = async (alertData) => {
    try {
      const response = await irrigationAlertService.createAlert(alertData);
      if (response.success) {
        setShowCreateModal(false);
        loadAlerts(); // Recargar lista
        if (canViewStats) {
          loadStats().then(() => {
            loadConnectedUsersCount();
          });
        }
        return { success: true, message: 'Alerta creada exitosamente' };
      } else {
        return { success: false, message: response.message || 'Error creando alerta' };
      }
    } catch (err) {
      console.error('Error creando alerta:', err);
      return { success: false, message: err.response?.data?.message || 'Error creando alerta' };
    }
  };

  const handleUpdateAlertStatus = async (alertId, newStatus) => {
    try {
      const response = await irrigationAlertService.updateAlertStatus(alertId, newStatus);
      if (response.success) {
        loadAlerts(pagination.page); // Recargar página actual
        if (canViewStats) {
          loadStats().then(() => {
            loadConnectedUsersCount();
          });
        }
        return { success: true, message: 'Estado actualizado exitosamente' };
      } else {
        return { success: false, message: response.message || 'Error actualizando estado' };
      }
    } catch (err) {
      console.error('Error actualizando estado:', err);
      return { success: false, message: err.response?.data?.message || 'Error actualizando estado' };
    }
  };

  const handleDeleteAlert = async (alertId) => {
    try {
      const response = await irrigationAlertService.deleteAlert(alertId);
      if (response.success) {
        loadAlerts(pagination.page);
        if (canViewStats) {
          loadStats().then(() => {
            loadConnectedUsersCount();
          });
        }
        return { success: true, message: 'Alerta eliminada exitosamente' };
      } else {
        return { success: false, message: response.message || 'Error eliminando alerta' };
      }
    } catch (err) {
      console.error('Error eliminando alerta:', err);
      return { success: false, message: err.response?.data?.message || 'Error eliminando alerta' };
    }
  };

  const handlePageChange = (newPage) => {
    loadAlerts(newPage);
  };

  if (!canManageAlerts) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-eco-scotch-mist via-white to-eco-pear/10'}`}>
        <Header type="Alertas de Riego" />
        <div className="pt-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className={`${isDarkMode ? 'bg-gradient-to-br from-red-900/30 to-red-800/20 border-2 border-red-700/50' : 'bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200'} rounded-3xl p-8 text-center shadow-lg`}>
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-red-300' : 'text-red-800'} mb-4`}>
                Acceso Denegado
              </h2>
              <p className={`${isDarkMode ? 'text-red-200' : 'text-red-700'} mb-4 text-lg font-medium`}>
                No tienes permisos para acceder a la gestión de alertas de riego.
              </p>
              <p className={`${isDarkMode ? 'text-red-300' : 'text-red-600'} font-medium`}>
                Solo los administradores y técnicos pueden gestionar las alertas de riego.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-eco-scotch-mist via-white to-eco-pear/10'}`}>
      <Header type="Alertas de Riego" />
      
      <div className="pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header de la página con diseño EcoVertical */}
          <div className="bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald rounded-3xl shadow-strong p-8 mb-8 text-white relative overflow-hidden">
            {/* Patrón decorativo de fondo */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
              <div className="absolute top-40 right-20 w-24 h-24 bg-white rounded-full"></div>
              <div className="absolute bottom-20 left-20 w-16 h-16 bg-white rounded-full"></div>
              <div className="absolute bottom-40 right-10 w-20 h-20 bg-white rounded-full"></div>
            </div>
            
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-lg flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                    <AlertTriangle className="w-8 h-8 text-white" />
                  </div>
                  Alertas de Riego
                </h1>
                <p className="text-white/90 text-xl font-medium">
                  Gestiona las alertas de riego para todos los huertos
                </p>
              </div>
              
              <div className="flex items-center gap-4 mt-6 sm:mt-0">
                {/* Estado de conexión WebSocket */}
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className="text-sm text-white font-medium">
                    {isConnected ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>
                
                {/* Botón para mostrar/ocultar usuarios conectados */}
                {canViewStats && (
                  <button
                    onClick={() => setShowConnectedUsers(!showConnectedUsers)}
                    className={`backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-300 font-medium flex items-center gap-2 shadow-lg hover:shadow-xl border border-white/30 hover:scale-105 ${
                      showConnectedUsers ? 'bg-white/30' : 'bg-white/20'
                    }`}
                    title={showConnectedUsers ? 'Ocultar usuarios activos' : 'Mostrar usuarios activos'}
                  >
                    <Users className="w-5 h-5" />
                    {showConnectedUsers ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Ocultar
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        Ver Usuarios Activos
                      </>
                    )}
                  </button>
                )}
                
                {/* Botón para crear alerta */}
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl hover:bg-white/30 transition-all duration-300 font-bold flex items-center gap-3 shadow-lg hover:shadow-xl border border-white/30 hover:scale-105"
                >
                  <Plus className="w-6 h-6" />
                  Nueva Alerta
                </button>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          {canViewStats && stats && (
            <div className="mb-8">
              <IrrigationAlertStats stats={stats} isDarkMode={isDarkMode} />
            </div>
          )}

          {/* Usuarios Activos */}
          {canViewStats && showConnectedUsers && (
            <div className="mb-8">
              <ConnectedUsersWidget 
                isDarkMode={isDarkMode}
                connectedUsers={connectedUsersData}
                onUpdate={() => {
                  loadStats().then(() => {
                    loadConnectedUsersCount();
                  });
                }}
              />
            </div>
          )}

          {/* Lista de alertas */}
          <div className={`${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600' : 'bg-gradient-to-br from-white to-eco-scotch-mist/30 border-eco-pear/20'} rounded-3xl shadow-strong border backdrop-blur-sm`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-slate-600' : 'border-eco-pear/20'}`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-eco-mountain-meadow to-eco-emerald rounded-2xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-eco-cape-cod'}`}>
                  Alertas Programadas
                </h2>
              </div>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-mountain-meadow"></div>
                  <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-eco-cape-cod'} font-medium`}>Cargando alertas...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className={`${isDarkMode ? 'text-white' : 'text-red-600'} mb-4 font-medium`}>{error}</p>
                  <button
                    onClick={() => loadAlerts()}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Reintentar
                  </button>
                </div>
              ) : (
                <IrrigationAlertsList
                  alerts={alerts}
                  pagination={pagination}
                  onUpdateStatus={handleUpdateAlertStatus}
                  onDelete={handleDeleteAlert}
                  onPageChange={handlePageChange}
                  canDelete={hasRole('administrador')}
                  isDarkMode={isDarkMode}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para crear alerta */}
      {showCreateModal && (
        <CreateIrrigationAlertModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateAlert}
          refreshTrigger={gardenRefreshTrigger}
        />
      )}
    </div>
  );
};

export default IrrigationAlertsPage;
