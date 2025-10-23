import { useState, useEffect, useContext } from "react";
import { createPortal } from "react-dom";
import { Bell, X, Check, Trash2, AlertTriangle, CheckCircle, Clock, MessageSquare, Droplets } from "lucide-react";
import notificationService from "../../services/notificationService.js";
import { alertNotificationService } from "../../services/irrigationAlertService.js";
import { useNotifications } from "../../hooks/useNotifications.js";
import useWebSocket from "../../hooks/useWebSocket.js";
import { AuthContext } from "../../contexts/AuthContext.jsx";

function UnifiedNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Obtener información del usuario actual
  const { user } = useContext(AuthContext);
  
  // Estados para notificaciones generales
  const {
    notifications: generalNotifications,
    unreadCount: generalUnreadCount,
    loading: generalLoading,
    error: generalError,
    loadNotifications: loadGeneralNotifications,
    markAsRead: markGeneralAsRead,
    markAllAsRead: markAllGeneralAsRead,
    addNotification: addGeneralNotification,
    loadUnreadCount: loadGeneralUnreadCount
  } = useNotifications();

  // Estados para notificaciones de riego
  const [irrigationNotifications, setIrrigationNotifications] = useState([]);
  const [irrigationUnreadCount, setIrrigationUnreadCount] = useState(0);
  const [irrigationLoading, setIrrigationLoading] = useState(false);
  const [irrigationError, setIrrigationError] = useState(null);

  const { lastMessage, playCommentNotificationSound, playIrrigationAlertSound } = useWebSocket();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadGeneralNotifications();
      loadIrrigationNotifications();
    }
  }, [isOpen, loadGeneralNotifications]);

  // Manejar mensajes del WebSocket para notificaciones en tiempo real
  useEffect(() => {
    if (lastMessage) {
      console.log('📢 Mensaje WebSocket recibido en notificaciones unificadas:', lastMessage);
      
      switch (lastMessage.type) {
        case 'newCommentNotification':
          console.log('💬 Nueva notificación de comentario recibida, actualizando notificaciones');
          // Actualizar contador de no leídas
          loadGeneralUnreadCount();
          
          if (lastMessage.data) {
            // Crear notificación optimista para mostrar inmediatamente
            const newNotification = {
              id: `temp-${Date.now()}`,
              titulo: `Nuevo comentario en ${lastMessage.data.huerto_nombre}`,
              mensaje: lastMessage.data.mensaje,
              tipo: 'comentario',
              huerto_id: lastMessage.data.huerto_id,
              huerto_nombre: lastMessage.data.huerto_nombre,
              huerto_creador: lastMessage.data.huerto_creador,
              autor_nombre: lastMessage.data.autor_nombre,
              autor_rol: lastMessage.data.autor_rol,
              leida: false,
              fecha_creacion: lastMessage.data.timestamp,
              datos_adicionales: {
                autor_id: lastMessage.data.autor_id,
                autor_nombre: lastMessage.data.autor_nombre,
                autor_rol: lastMessage.data.autor_rol,
                comentario_id: lastMessage.data.comentario_id
              }
            };
            
            // Agregar notificación optimista
            addGeneralNotification(newNotification);
            
            // Reproducir sonido de comentario
            playCommentNotificationSound();
          }
          break;
        case 'commentEditedNotification':
          console.log('✏️ Notificación de comentario editado recibida, actualizando notificaciones');
          // Actualizar contador de no leídas
          loadGeneralUnreadCount();
          
          if (lastMessage.data) {
            // Crear notificación optimista para mostrar inmediatamente
            const editedNotification = {
              id: `temp-edited-${Date.now()}`,
              titulo: `Comentario editado en ${lastMessage.data.huerto_nombre}`,
              mensaje: lastMessage.data.mensaje,
              tipo: 'comentario',
              huerto_id: lastMessage.data.huerto_id,
              huerto_nombre: lastMessage.data.huerto_nombre,
              huerto_creador: lastMessage.data.huerto_creador,
              autor_nombre: lastMessage.data.autor_nombre,
              autor_rol: lastMessage.data.autor_rol,
              leida: false,
              fecha_creacion: lastMessage.data.timestamp,
              datos_adicionales: {
                autor_id: lastMessage.data.autor_id,
                autor_nombre: lastMessage.data.autor_nombre,
                autor_rol: lastMessage.data.autor_rol,
                comentario_id: lastMessage.data.comentario_id,
                accion: 'editado'
              }
            };
            
            // Agregar notificación optimista
            addGeneralNotification(editedNotification);
            
            // Reproducir sonido de comentario
            playCommentNotificationSound();
          }
          break;
        case 'commentDeletedNotification':
          console.log('🗑️ Notificación de comentario eliminado recibida, actualizando notificaciones');
          // Actualizar contador de no leídas
          loadGeneralUnreadCount();
          
          if (lastMessage.data) {
            // Crear notificación optimista para mostrar inmediatamente
            const deletedNotification = {
              id: `temp-deleted-${Date.now()}`,
              titulo: `Comentario eliminado en ${lastMessage.data.huerto_nombre}`,
              mensaje: lastMessage.data.mensaje,
              tipo: 'comentario',
              huerto_id: lastMessage.data.huerto_id,
              huerto_nombre: lastMessage.data.huerto_nombre,
              huerto_creador: lastMessage.data.huerto_creador,
              autor_nombre: lastMessage.data.autor_nombre,
              autor_rol: lastMessage.data.autor_rol,
              leida: false,
              fecha_creacion: lastMessage.data.timestamp,
              datos_adicionales: {
                autor_id: lastMessage.data.autor_id,
                autor_nombre: lastMessage.data.autor_nombre,
                autor_rol: lastMessage.data.autor_rol,
                comentario_id: lastMessage.data.comentario_id,
                accion: 'eliminado'
              }
            };
            
            // Agregar notificación optimista
            addGeneralNotification(deletedNotification);
            
            // Reproducir sonido de comentario
            playCommentNotificationSound();
          }
          break;
        case 'preIrrigationAlert':
          console.log('⏰ Pre-notificación de riego recibida, actualizando notificaciones');
          // Actualizar contador de riego
          loadIrrigationUnreadCount();
          
          if (lastMessage.data) {
            // Agregar notificación optimista de pre-riego
            const newPreIrrigationNotification = {
              id: `temp-pre-irrigation-${Date.now()}`,
              mensaje: lastMessage.data.message || 'Recordatorio de riego en 10 minutos',
              tipo: 'recordatorio',
              leida: false,
              fecha_creacion: new Date().toISOString(),
              huerto_nombre: lastMessage.data.huerto_nombre
            };
            setIrrigationNotifications(prev => [newPreIrrigationNotification, ...prev]);
            
            // Solo reproducir sonido si NO es admin (los admins no necesitan escuchar pre-notificaciones)
            if (user?.role !== 'administrador') {
              console.log('🔊 Reproduciendo sonido de pre-notificación de riego para usuario no-admin');
              playIrrigationAlertSound();
            } else {
              console.log('🔇 Admin detectado - no se reproduce sonido de pre-notificación');
            }
          }
          break;
        case 'irrigationAlert':
          console.log('🚨 Alerta de riego recibida, actualizando notificaciones');
          // Actualizar contador de riego
          loadIrrigationUnreadCount();
          
          if (lastMessage.data) {
            // Agregar notificación optimista de riego
            const newIrrigationNotification = {
              id: `temp-irrigation-${Date.now()}`,
              mensaje: lastMessage.data.message || 'Alerta de riego',
              tipo: 'recordatorio',
              leida: false,
              fecha_creacion: new Date().toISOString(),
              huerto_nombre: lastMessage.data.huerto_nombre
            };
            setIrrigationNotifications(prev => [newIrrigationNotification, ...prev]);
            
            // Solo reproducir sonido si NO es admin (los admins no necesitan escuchar alertas de riego)
            if (user?.role !== 'administrador') {
              console.log('🔊 Reproduciendo sonido de alerta de riego para usuario no-admin');
              playIrrigationAlertSound();
            } else {
              console.log('🔇 Admin detectado - no se reproduce sonido de alerta de riego');
            }
          }
          break;
        case 'newAlertNotification':
          console.log('📢 Nueva notificación de alerta, actualizando contador');
          loadIrrigationUnreadCount();
          
          // Solo reproducir sonido si NO es admin (los admins no necesitan escuchar alertas de creación)
          if (user?.role !== 'administrador') {
            console.log('🔊 Reproduciendo sonido de nueva alerta de riego para usuario no-admin');
            playIrrigationAlertSound();
          } else {
            console.log('🔇 Admin detectado - no se reproduce sonido de creación de alerta');
          }
          break;
        case 'userRegistered':
          console.log('✅ Usuario registrado, cargando notificaciones iniciales');
          loadGeneralNotifications();
          loadGeneralUnreadCount();
          loadIrrigationNotifications();
          loadIrrigationUnreadCount();
          break;
        default:
          console.log('❓ Tipo de mensaje no reconocido:', lastMessage.type);
          break;
      }
    }
  }, [lastMessage, loadGeneralUnreadCount, addGeneralNotification, loadGeneralNotifications]);


  // Cargar notificaciones de riego
  const loadIrrigationNotifications = async () => {
    setIrrigationLoading(true);
    setIrrigationError(null);
    try {
      const response = await alertNotificationService.getRecentNotifications();
      setIrrigationNotifications(response.data || []);
    } catch (error) {
      setIrrigationError('Error al cargar notificaciones de riego');
      console.error('Error cargando notificaciones de riego:', error);
    } finally {
      setIrrigationLoading(false);
    }
  };

  // Cargar contador de notificaciones de riego no leídas
  const loadIrrigationUnreadCount = async () => {
    try {
      const response = await alertNotificationService.getUnreadCount();
      setIrrigationUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error cargando contador de riego:', error);
    }
  };

  // Marcar notificación de riego como leída
  const markIrrigationAsRead = async (notificationId) => {
    try {
      await alertNotificationService.markAsRead(notificationId);
      setIrrigationNotifications(prev => 
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, leida: true }
            : notification
        )
      );
      setIrrigationUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error al marcar notificación de riego como leída:', error);
    }
  };

  // Marcar todas las notificaciones de riego como leídas
  const markAllIrrigationAsRead = async () => {
    try {
      await alertNotificationService.markAllAsRead();
      setIrrigationNotifications(prev => 
        prev.map(notification => ({ ...notification, leida: true }))
      );
      setIrrigationUnreadCount(0);
    } catch (error) {
      console.error('Error al marcar todas las notificaciones de riego como leídas:', error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Función para obtener el icono de notificación
  const getNotificationIcon = (tipo, accion) => {
    // Si es un comentario con acción específica, usar icono diferente
    if (tipo === 'comentario' && accion) {
      switch (accion) {
        case 'editado':
          return <span className="text-xl">✏️</span>;
        case 'eliminado':
          return <span className="text-xl">🗑️</span>;
        default:
          return <MessageSquare className="w-5 h-5" />;
      }
    }
    
    switch (tipo) {
      case 'comentario':
        return <MessageSquare className="w-5 h-5" />;
      case 'recordatorio':
        return <Clock className="w-5 h-5" />;
      case 'creacion':
        return <CheckCircle className="w-5 h-5" />;
      case 'riego':
        return <Droplets className="w-5 h-5" />;
      case 'alerta':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  // Función para obtener el estilo de la etiqueta de rol
  const getRoleTagStyle = (role) => {
    switch (role) {
      case 'administrador':
        return 'bg-red-500/20 text-red-700 border-red-300';
      case 'tecnico':
        return 'bg-blue-500/20 text-blue-700 border-blue-300';
      case 'residente':
        return 'bg-green-500/20 text-green-700 border-green-300';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-300';
    }
  };

  // Función para obtener el texto del rol
  const getRoleText = (role) => {
    switch (role) {
      case 'administrador':
        return 'Admin';
      case 'tecnico':
        return 'Técnico';
      case 'residente':
        return 'Residente';
      default:
        return 'Usuario';
    }
  };

  // Combinar todas las notificaciones
  const allNotifications = [
    ...generalNotifications.map(n => ({ ...n, source: 'general' })),
    ...irrigationNotifications.map(n => ({ ...n, source: 'irrigation' }))
  ].sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));

  const totalUnreadCount = generalUnreadCount + irrigationUnreadCount;

  const modalContent = isOpen && (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-[slideIn_0.3s_ease] dark:bg-gray-800 dark:text-white relative mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-200 flex justify-between items-center dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notificaciones
          </h3>
          {totalUnreadCount > 0 && (
            <div className="flex gap-2">
              <button
                className="bg-transparent border-none text-blue-500 text-sm py-1 px-2 rounded transition-colors duration-200 ease-in-out hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                onClick={() => {
                  markAllGeneralAsRead();
                  markAllIrrigationAsRead();
                }}
              >
                Marcar todas como leídas
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto max-h-[400px]">
          {generalLoading || irrigationLoading ? (
            <div className="py-10 px-6 text-center text-gray-500">
              <span className="text-5xl block mb-4">⏳</span>
              <p>Cargando notificaciones...</p>
            </div>
          ) : generalError || irrigationError ? (
            <div className="py-10 px-6 text-center text-red-500">
              <span className="text-5xl block mb-4">❌</span>
              <p>{generalError || irrigationError}</p>
              <button 
                onClick={() => {
                  loadGeneralNotifications();
                  loadIrrigationNotifications();
                }}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Reintentar
              </button>
            </div>
          ) : allNotifications.length === 0 ? (
            <div className="py-10 px-6 text-center text-gray-500">
              <span className="text-5xl block mb-4">📭</span>
              <p>No tienes notificaciones</p>
            </div>
          ) : (
            allNotifications.map((notification) => (
              <div
                key={`${notification.source}-${notification.id}`}
                className={`flex px-6 py-4 border-b border-gray-100 cursor-pointer transition-colors duration-200 ease-in-out hover:bg-gray-50 relative 
                  ${
                    !notification.leida
                      ? "bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"
                      : ""
                  }
                  dark:border-gray-700 dark:hover:bg-gray-700`}
                onClick={() => {
                  if (!notification.leida) {
                    if (notification.source === 'general') {
                      markGeneralAsRead(notification.id);
                    } else {
                      markIrrigationAsRead(notification.id);
                    }
                  }
                }}
              >
                <div className="mr-3 flex-shrink-0">
                  {getNotificationIcon(notification.tipo, notification.datos_adicionales?.accion)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1 dark:text-white">
                    {notification.titulo || notification.mensaje}
                  </h4>
                  {notification.huerto_nombre && (
                    <p className="text-xs text-gray-400 mb-1 dark:text-gray-500">
                      Huerto: {notification.huerto_nombre}
                    </p>
                  )}
                  {/* Etiqueta de rol cuando el usuario que generó la notificación no es el dueño del huerto */}
                  {notification.autor_rol && notification.datos_adicionales?.autor_id !== notification.huerto_creador && (
                    <div className="mb-1">
                      <span className={`px-2 py-1 text-xs rounded-lg font-medium border ${getRoleTagStyle(notification.autor_rol)}`}>
                        {getRoleText(notification.autor_rol)}
                      </span>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mb-2 leading-snug dark:text-gray-300">
                    {notification.mensaje}
                  </p>
                  <span className="text-xs text-gray-400">
                    {notificationService.formatTimeAgo(notification.fecha_creacion)}
                  </span>
                </div>
                {!notification.leida && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1.5 flex-shrink-0"></div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        className="relative p-2 rounded-lg transition-all duration-200 ease-in-out hover:bg-gray-100 hover:scale-105 dark:hover:bg-gray-700"
        onClick={() => setIsOpen(true)}
        aria-label="Notificaciones"
      >
        <span className="text-2xl">🔔</span>
        {totalUnreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full w-5 h-5 text-xs font-semibold flex items-center justify-center animate-pulse">
            {totalUnreadCount}
          </span>
        )}
      </button>

      {mounted && isOpen && createPortal(modalContent, document.body)}
    </>
  );
}

export default UnifiedNotifications;
