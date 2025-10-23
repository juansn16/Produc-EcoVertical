import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Trash2, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { alertNotificationService } from '../../services/irrigationAlertService';
import useWebSocket from '../../hooks/useWebSocket';

const IrrigationAlertNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { lastMessage } = useWebSocket();

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
    
    // Configurar un intervalo para actualizar notificaciones periódicamente
    // como respaldo en caso de que el WebSocket falle
    const interval = setInterval(() => {
      console.log('🔄 Actualización periódica de notificaciones');
      loadNotifications();
      loadUnreadCount();
    }, 15000); // Cada 15 segundos

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Manejar mensajes del WebSocket
  useEffect(() => {
    if (lastMessage) {
      console.log('📢 Mensaje WebSocket recibido en notificaciones:', lastMessage);
      
      switch (lastMessage.type) {
        case 'irrigationAlert':
          console.log('🚨 Alerta de riego recibida, actualizando notificaciones');
          // Actualizar solo el contador y agregar notificación optimista
          loadUnreadCount();
          if (lastMessage.data) {
            // Agregar notificación optimista sin recargar toda la lista
            const newNotification = {
              id: `temp-${Date.now()}`,
              mensaje: lastMessage.data.message || 'Alerta de riego',
              tipo: 'recordatorio',
              leida: false,
              fecha_creacion: new Date().toISOString(),
              huerto_nombre: lastMessage.data.huerto_nombre
            };
            setNotifications(prev => [newNotification, ...prev]);
          }
          break;
        case 'preIrrigationAlert':
          console.log('⏰ Pre-notificación de riego recibida, actualizando notificaciones');
          // Actualizar solo el contador y agregar notificación optimista
          loadUnreadCount();
          if (lastMessage.data) {
            // Agregar notificación optimista sin recargar toda la lista
            const newNotification = {
              id: `temp-pre-${Date.now()}`,
              mensaje: lastMessage.data.message || 'Recordatorio de riego en 10 minutos',
              tipo: 'recordatorio',
              leida: false,
              fecha_creacion: new Date().toISOString(),
              huerto_nombre: lastMessage.data.huerto_nombre
            };
            setNotifications(prev => [newNotification, ...prev]);
          }
          break;
        case 'newAlertNotification':
          console.log('📢 Nueva notificación de alerta, actualizando lista');
          // Actualizar solo el contador y agregar notificación optimista
          loadUnreadCount();
          if (lastMessage.data) {
            const newNotification = {
              id: `temp-${Date.now()}`,
              mensaje: lastMessage.data.message || 'Nueva alerta de riego',
              tipo: 'creacion',
              leida: false,
              fecha_creacion: new Date().toISOString(),
              huerto_nombre: lastMessage.data.huertoNombre
            };
            setNotifications(prev => [newNotification, ...prev]);
          }
          break;
        case 'newCommentNotification':
          console.log('💬 Nueva notificación de comentario recibida en alertas de riego');
          // Actualizar contador de no leídas
          loadUnreadCount();
          break;
        case 'userRegistered':
          console.log('✅ Usuario registrado, cargando notificaciones iniciales');
          loadNotifications();
          loadUnreadCount();
          break;
        default:
          console.log('❓ Tipo de mensaje no reconocido:', lastMessage.type);
          break;
      }
    }
  }, [lastMessage]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      console.log('📥 Cargando notificaciones...');
      const response = await alertNotificationService.getRecentNotifications();
      if (response.success) {
        console.log('✅ Notificaciones cargadas:', response.data);
        setNotifications(response.data);
      } else {
        console.error('❌ Error en respuesta de notificaciones:', response);
      }
    } catch (error) {
      console.error('❌ Error cargando notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      console.log('📊 Cargando contador de no leídas...');
      const response = await alertNotificationService.getUnreadCount();
      if (response.success) {
        console.log('✅ Contador actualizado:', response.data.unreadCount);
        setUnreadCount(response.data.unreadCount);
      } else {
        console.error('❌ Error en respuesta del contador:', response);
      }
    } catch (error) {
      console.error('❌ Error cargando contador:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      // Solo hacer la petición si no es una notificación temporal
      if (!id.startsWith('temp-')) {
        await alertNotificationService.markAsRead(id);
      }
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, leida: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marcando como leída:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await alertNotificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, leida: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      // Solo hacer la petición si no es una notificación temporal
      if (!id.startsWith('temp-')) {
        await alertNotificationService.deleteNotification(id);
      }
      
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error eliminando notificación:', error);
    }
  };

  const getNotificationIcon = (tipo) => {
    switch (tipo) {
      case 'creacion':
        return <AlertTriangle className="w-4 h-4 text-blue-500" />;
      case 'recordatorio':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'vencida':
        return <CheckCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (tipo) => {
    switch (tipo) {
      case 'creacion':
        return 'bg-blue-50 border-blue-200';
      case 'recordatorio':
        return 'bg-orange-50 border-orange-200';
      case 'vencida':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString('es-ES');
  };

  return (
    <div className="relative">
      {/* Botón de notificaciones */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown de notificaciones */}
      {showDropdown && (
        <>
          {/* Overlay para cerrar al hacer click fuera */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notificaciones
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Marcar todas como leídas
                  </button>
                )}
              </div>
            </div>

            {/* Lista de notificaciones */}
            <div className="max-h-64 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Cargando...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center">
                  <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No hay notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.leida ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.tipo)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 mb-1">
                            {notification.mensaje}
                          </p>
                          
                          {notification.huerto_nombre && (
                            <p className="text-xs text-gray-500 mb-1">
                              Huerto: {notification.huerto_nombre}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              {formatTime(notification.fecha_creacion)}
                            </span>
                            
                            <div className="flex items-center gap-1">
                              {!notification.leida && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                  title="Marcar como leída"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              )}
                              
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    // Aquí podrías navegar a una página de notificaciones completa
                  }}
                  className="w-full text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Ver todas las notificaciones
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default IrrigationAlertNotifications;
