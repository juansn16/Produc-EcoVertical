import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const disableTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    if (isDisabled) {
      console.log('🔌 WebSocket temporalmente deshabilitado');
      return;
    }

    if (socketRef.current?.connected) {
      console.log('🔌 WebSocket ya está conectado');
      return;
    }

    try {
      // Obtener token de autenticación
      const token = localStorage.getItem('token');
      console.log('🔍 Token encontrado:', token ? 'Sí' : 'No');
      
      // Crear conexión WebSocket (configuración robusta)
      const connectionOptions = {
        transports: ['polling', 'websocket'],
        timeout: 60000, // 60 segundos para conexión inicial
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5, // Reducir intentos para evitar spam
        reconnectionDelay: 5000, // 5 segundos entre intentos
        reconnectionDelayMax: 20000, // Máximo 20 segundos
        autoConnect: true,
        upgrade: true,
        rememberUpgrade: false
      };
      
      // Solo agregar auth si hay token
      if (token) {
        connectionOptions.auth = { token: token };
        console.log('🔐 Conectando con token de autenticación');
      } else {
        console.log('🔓 Conectando sin token de autenticación');
      }
      
      console.log('🔌 Configuración de conexión:', connectionOptions);
      
      // Usar variable de entorno específica para Socket.IO
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'https://api-ecovertical.onrender.com';
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      
      console.log('🔌 API URL:', apiUrl);
      console.log('🔌 Socket URL:', socketUrl);
      socketRef.current = io(socketUrl, connectionOptions);

      // Eventos de conexión
      socketRef.current.on('connect', () => {
        console.log('🔌 WebSocket conectado:', socketRef.current.id);
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        
        // Registrar usuario si está autenticado
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.id) {
          socketRef.current.emit('registerUser', user.id);
        }
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('🔌 WebSocket desconectado:', reason);
        setIsConnected(false);
        
        // Intentar reconectar si no fue una desconexión manual
        if (reason !== 'io client disconnect' && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`🔄 Intentando reconectar en ${delay}ms (intento ${reconnectAttempts.current + 1})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      });

      socketRef.current.on('connect_error', (err) => {
        console.warn('⚠️ Error de conexión WebSocket:', err.message);
        setError(err.message);
        setIsConnected(false);
        
        // Deshabilitar temporalmente después de muchos intentos fallidos
        if (reconnectAttempts.current >= maxReconnectAttempts) {
          console.log('🔌 Deshabilitando WebSocket temporalmente debido a múltiples fallos');
          setIsDisabled(true);
          
          // Rehabilitar después de 5 minutos
          disableTimeoutRef.current = setTimeout(() => {
            console.log('🔌 Rehabilitando WebSocket');
            setIsDisabled(false);
            reconnectAttempts.current = 0;
          }, 300000); // 5 minutos
        }
        
        // Solo mostrar error si no es un timeout de reconexión
        if (!err.message.includes('timeout') || reconnectAttempts.current === 0) {
          console.error('❌ Error de conexión WebSocket:', err);
        }
      });

      // Eventos específicos del sistema de alertas
      socketRef.current.on('irrigationAlert', (data) => {
        console.log('🚨 Alerta de riego recibida:', data);
        console.log('🔊 playSound en datos:', data.playSound);
        console.log('🔊 Tipo de alerta:', data.type);
        setLastMessage({ type: 'irrigationAlert', data });
        
        // Solo reproducir sonido si está explícitamente habilitado en los datos
        if (data.playSound === true) {
          console.log('🔊 Reproduciendo sonido de alerta de riego');
          playIrrigationAlertSound();
        } else {
          console.log('🔇 Sonido deshabilitado para esta alerta');
        }
      });

      socketRef.current.on('preIrrigationAlert', (data) => {
        console.log('⏰ Pre-notificación de riego recibida:', data);
        setLastMessage({ type: 'preIrrigationAlert', data });
        
        // Solo reproducir sonido si está explícitamente habilitado en los datos
        if (data.playSound === true) {
          console.log('🔊 Reproduciendo sonido de pre-notificación de riego');
          playIrrigationAlertSound();
        } else {
          console.log('🔇 Sonido deshabilitado para esta pre-notificación');
        }
      });

      socketRef.current.on('newAlertNotification', (data) => {
        console.log('📢 Nueva notificación de alerta:', data);
        setLastMessage({ type: 'newAlertNotification', data });
        
        // No reproducir sonido automáticamente - dejar que los componentes decidan
      });

      socketRef.current.on('newCommentNotification', (data) => {
        console.log('💬 Nueva notificación de comentario:', data);
        setLastMessage({ type: 'newCommentNotification', data });
        
        // Reproducir sonido suave para comentarios
        console.log('🔊 Reproduciendo sonido de comentario');
        playCommentNotificationSound();
      });

      socketRef.current.on('commentEditedNotification', (data) => {
        console.log('✏️ Notificación de comentario editado:', data);
        setLastMessage({ type: 'commentEditedNotification', data });
        
        // Reproducir sonido suave para comentarios editados
        console.log('🔊 Reproduciendo sonido de comentario editado');
        playCommentNotificationSound();
      });

      socketRef.current.on('commentDeletedNotification', (data) => {
        console.log('🗑️ Notificación de comentario eliminado:', data);
        setLastMessage({ type: 'commentDeletedNotification', data });
        
        // Reproducir sonido suave para comentarios eliminados
        console.log('🔊 Reproduciendo sonido de comentario eliminado');
        playCommentNotificationSound();
      });

      socketRef.current.on('userRegistered', (data) => {
        console.log('✅ Usuario registrado en WebSocket:', data);
        setLastMessage({ type: 'userRegistered', data });
      });

      // Manejar errores
      socketRef.current.on('error', (err) => {
        console.error('❌ Error en WebSocket:', err);
        setError(err.message);
      });

    } catch (err) {
      console.error('❌ Error inicializando WebSocket:', err);
      setError(err.message);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (disableTimeoutRef.current) {
      clearTimeout(disableTimeoutRef.current);
      disableTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    setIsConnected(false);
    setError(null);
    console.log('🔌 WebSocket desconectado manualmente');
  }, []);

  const sendMessage = useCallback((message) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('message', message);
        } else {
      console.warn('⚠️ WebSocket no está conectado, no se puede enviar mensaje');
    }
  }, []);

  // Función para reproducir sonido suave de comentarios
  const playCommentNotificationSound = useCallback(() => {
    try {
      console.log('🔊 Iniciando reproducción de sonido de comentario suave');
      
      // Crear un sonido suave usando Web Audio API - más apropiado para comentarios de huertos
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Sonido más suave y musical - como un "ding" suave
      oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // Do5
      oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // Mi5
      oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // Sol5
      
      // Volumen más bajo y transición más suave
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
      
      console.log('✅ Sonido de comentario suave reproducido exitosamente');
      
      } catch (error) {
      console.warn('⚠️ No se pudo reproducir sonido de comentario:', error);
    }
  }, []);

  // Función para reproducir sonido distintivo de alertas de riego
  const playIrrigationAlertSound = useCallback(() => {
    try {
      console.log('🔊 Iniciando reproducción de sonido de alerta de riego');
      
      // Crear un sonido completamente diferente para alertas de riego
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Sonido distintivo de alerta - como un "beep-beep-beep" de emergencia
      // Secuencia: Re-Fa-La-Re (más aguda y distintiva)
      oscillator.frequency.setValueAtTime(587, audioContext.currentTime); // Re5
      oscillator.frequency.setValueAtTime(698, audioContext.currentTime + 0.2); // Fa5
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.4); // La5
      oscillator.frequency.setValueAtTime(1175, audioContext.currentTime + 0.6); // Re6
      
      // Volumen más alto y duración más larga para ser más notorio
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.8);
      
      console.log('✅ Sonido de alerta de riego reproducido exitosamente');
      
      } catch (error) {
      console.warn('⚠️ No se pudo reproducir sonido de alerta de riego:', error);
    }
  }, []);

  // Conectar automáticamente cuando el componente se monta
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (disableTimeoutRef.current) {
        clearTimeout(disableTimeoutRef.current);
      }
    };
  }, []);

  return {
    isConnected,
    lastMessage,
    error,
    isDisabled,
    connect,
    disconnect,
    sendMessage,
    playCommentNotificationSound,
    playIrrigationAlertSound
  };
};

export default useWebSocket;
