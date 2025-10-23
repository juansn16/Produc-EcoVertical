import React from 'react';
import { BarChart3, Users, AlertTriangle, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const IrrigationAlertStats = ({ stats, isDarkMode = false }) => {
  if (!stats) return null;

  const { alerts, notifications, onlineUsers, serviceStats, alertasVencidas } = stats;

  // Calcular totales
  const totalAlerts = alerts.reduce((sum, alert) => sum + alert.cantidad, 0);
  const totalNotifications = notifications.reduce((sum, notif) => sum + notif.cantidad, 0);

  // Encontrar alertas activas
  const activeAlerts = alerts.find(alert => alert.estado === 'activa')?.cantidad || 0;
  const completedAlerts = alerts.find(alert => alert.estado === 'completada')?.cantidad || 0;
  const cancelledAlerts = alerts.find(alert => alert.estado === 'cancelada')?.cantidad || 0;

  const statCards = [
    {
      title: 'Alertas Activas',
      value: activeAlerts,
      icon: AlertTriangle,
      color: 'blue',
      bgColor: isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50',
      iconColor: 'text-blue-600',
      textColor: isDarkMode ? 'text-blue-200' : 'text-blue-900',
      borderColor: isDarkMode ? 'border-blue-700/50' : 'border-gray-200'
    },
    {
      title: 'Alertas Completadas',
      value: completedAlerts,
      icon: CheckCircle,
      color: 'green',
      bgColor: isDarkMode ? 'bg-green-900/30' : 'bg-green-50',
      iconColor: 'text-green-600',
      textColor: isDarkMode ? 'text-green-200' : 'text-green-900',
      borderColor: isDarkMode ? 'border-green-700/50' : 'border-gray-200'
    },
    {
      title: 'Alertas Canceladas',
      value: cancelledAlerts,
      icon: Clock,
      color: 'red',
      bgColor: isDarkMode ? 'bg-red-900/30' : 'bg-red-50',
      iconColor: 'text-red-600',
      textColor: isDarkMode ? 'text-red-200' : 'text-red-900',
      borderColor: isDarkMode ? 'border-red-700/50' : 'border-gray-200'
    },
    {
      title: 'Alertas Vencidas',
      value: alertasVencidas || 0,
      icon: AlertCircle,
      color: 'orange',
      bgColor: isDarkMode ? 'bg-orange-900/30' : 'bg-orange-50',
      iconColor: 'text-orange-600',
      textColor: isDarkMode ? 'text-orange-200' : 'text-orange-900',
      borderColor: isDarkMode ? 'border-orange-700/50' : 'border-gray-200'
    },
    {
      title: 'Usuarios Activos',
      value: onlineUsers,
      icon: Users,
      color: 'purple',
      bgColor: isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50',
      iconColor: 'text-purple-600',
      textColor: isDarkMode ? 'text-purple-200' : 'text-purple-900',
      borderColor: isDarkMode ? 'border-purple-700/50' : 'border-gray-200'
    }
  ];

  return (
    <div className={`${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6`}>
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
        <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Estadísticas del Sistema
        </h2>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {statCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div
              key={index}
              className={`${card.bgColor} rounded-lg p-4 border ${card.borderColor}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${card.textColor} mb-1`}>
                    {card.title}
                  </p>
                  <p className={`text-2xl font-bold ${card.textColor}`}>
                    {card.value}
                  </p>
                </div>
                <IconComponent className={`w-8 h-8 ${card.iconColor}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Detalles adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Estado de las alertas */}
        <div>
          <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-3`}>
            Distribución de Alertas
          </h3>
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} capitalize`}>
                  {alert.estado}
                </span>
                <div className="flex items-center gap-2">
                  <div className={`w-20 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                    <div
                      className={`h-2 rounded-full ${
                        alert.estado === 'activa' ? 'bg-blue-500' :
                        alert.estado === 'completada' ? 'bg-green-500' :
                        'bg-red-500'
                      }`}
                      style={{
                        width: `${totalAlerts > 0 ? (alert.cantidad / totalAlerts) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} w-8 text-right`}>
                    {alert.cantidad}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estado del servicio */}
        <div>
          <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-3`}>
            Estado del Servicio
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Planificador activo</span>
              <span className={`text-sm font-medium ${
                serviceStats?.isSchedulerRunning ? 'text-green-600' : 'text-red-600'
              }`}>
                {serviceStats?.isSchedulerRunning ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Conexiones WebSocket</span>
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {serviceStats?.connectedSockets || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total de notificaciones</span>
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {totalNotifications}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IrrigationAlertStats;
