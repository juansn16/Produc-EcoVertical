import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import notificationService from "../../services/notificationService.js";
import { useNotifications } from "../../hooks/useNotifications.js";
import useWebSocket from "../../hooks/useWebSocket.js";

function Notifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    loadUnreadCount
  } = useNotifications();

  const { lastMessage, playCommentNotificationSound } = useWebSocket();


  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, loadNotifications]);

  // Manejar mensajes del WebSocket para notificaciones en tiempo real
  useEffect(() => {
    if (lastMessage) {
      console.log('📢 Mensaje WebSocket recibido en notificaciones:', lastMessage);
      
      switch (lastMessage.type) {
        case 'newCommentNotification':
          console.log('💬 Nueva notificación de comentario recibida, actualizando notificaciones');
          // Actualizar contador de no leídas
          loadUnreadCount();
          
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
            addNotification(newNotification);
            
            // Reproducir sonido de comentario
            playCommentNotificationSound();
          }
          break;
        case 'newAlertNotification':
          console.log('📢 Nueva notificación de alerta, actualizando contador');
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
  }, [lastMessage, loadUnreadCount, addNotification, loadNotifications]);



  const handleClose = () => {
    setIsOpen(false);
  };


  const getNotificationIcon = (tipo) => {
    return notificationService.getNotificationIcon(tipo);
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

  const modalContent = isOpen && (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col animate-[slideIn_0.3s_ease] dark:bg-gray-800 dark:text-white relative mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-200 flex justify-between items-center dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notificaciones
          </h3>
          {unreadCount > 0 && (
            <button
              className="bg-transparent border-none text-blue-500 text-sm py-1 px-2 rounded transition-colors duration-200 ease-in-out hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
              onClick={markAllAsRead}
            >
              Marcar todas como leídas
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto max-h-[400px]">
          {loading ? (
            <div className="py-10 px-6 text-center text-gray-500">
              <span className="text-5xl block mb-4">⏳</span>
              <p>Cargando notificaciones...</p>
            </div>
          ) : error ? (
            <div className="py-10 px-6 text-center text-red-500">
              <span className="text-5xl block mb-4">❌</span>
              <p>{error}</p>
              <button 
                onClick={loadNotifications}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Reintentar
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-10 px-6 text-center text-gray-500">
              <span className="text-5xl block mb-4">📭</span>
              <p>No tienes notificaciones</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex px-6 py-4 border-b border-gray-100 cursor-pointer transition-colors duration-200 ease-in-out hover:bg-gray-50 relative 
                  ${
                    !notification.leida
                      ? "bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"
                      : ""
                  }
                  dark:border-gray-700 dark:hover:bg-gray-700`}
                onClick={() => !notification.leida && markAsRead(notification.id)}
              >
                <div className="mr-3 flex-shrink-0">
                  <span className="text-xl">
                    {getNotificationIcon(notification.tipo)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1 dark:text-white">
                    {notification.titulo}
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
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full w-5 h-5 text-xs font-semibold flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {mounted && isOpen && createPortal(modalContent, document.body)}
    </>
  );
}

export default Notifications;
