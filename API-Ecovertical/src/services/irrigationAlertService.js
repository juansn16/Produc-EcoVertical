import { Server } from 'socket.io';
import db from '../config/db.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { v4 as uuidv4 } from 'uuid';

class IrrigationAlertService {
  constructor() {
    this.io = null;
    this.onlineUsers = new Map(); // Map<userId, socketId>
    this.alertInterval = null;
    this.cleanerInterval = null; // Intervalo del limpiador de conexiones
  }

  /**
   * Inicializa el servidor WebSocket
   * @param {http.Server} server - Servidor HTTP de Express
   */
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: [
          "http://localhost:5173", 
          "http://localhost:5174", 
          "http://127.0.0.1:5173",
          "http://127.0.0.1:5174",
          "https://ecovertical-frontend.onrender.com",
          process.env.FRONTEND_URL
        ].filter(Boolean),
        methods: ["GET", "POST"],
        credentials: true
      },
      // Configuración optimizada para Render
      transports: ['polling', 'websocket'], // Polling primero para mejor compatibilidad
      allowEIO3: true,
      pingTimeout: 20000, // Reducido para detectar desconexiones más rápido
      pingInterval: 10000, // Ping más frecuente para mantener conexión activa
      upgradeTimeout: 10000, // Timeout más corto para upgrades
      maxHttpBufferSize: 1e6, // Buffer más pequeño para mejor rendimiento
      // Configuración específica para Render
      serveClient: false, // No servir cliente para reducir carga
      allowUpgrades: true,
      perMessageDeflate: false // Deshabilitar compresión para mejor rendimiento
    });

    // Middleware de autenticación (temporalmente deshabilitado para debugging)
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        console.log('🔍 Token recibido:', token ? 'Presente' : 'Ausente');
        
        if (!token) {
          console.log('⚠️ No hay token, permitiendo conexión sin autenticación');
          socket.userId = null;
          socket.userRole = null;
          return next();
        }

        try {
          const decoded = verifyAccessToken(token);
          socket.userId = decoded.id;
          socket.userRole = decoded.role;
          console.log('✅ Token válido para usuario:', decoded.id);
          next();
        } catch (tokenError) {
          console.error('❌ Token inválido:', tokenError.message);
          // Permitir conexión sin autenticación para debugging
          socket.userId = null;
          socket.userRole = null;
          next();
        }
      } catch (error) {
        console.error('❌ Error en middleware WebSocket:', error);
        // Permitir conexión sin autenticación para debugging
        socket.userId = null;
        socket.userRole = null;
        next();
      }
    });

    this.setupEventHandlers();
    this.startAlertScheduler();
    
    console.log('🔌 Servidor WebSocket de alertas de riego inicializado');
    console.log('📡 Configuración Socket.IO:', {
      cors: this.io.engine.opts.cors,
      transports: this.io.engine.opts.transports,
      allowEIO3: this.io.engine.opts.allowEIO3
    });
  }

  /**
   * Configura los manejadores de eventos del WebSocket
   */
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Nueva conexión WebSocket: ${socket.id}`);
      
      // Configurar heartbeat para mantener conexión activa en Render
      socket.heartbeatInterval = setInterval(() => {
        if (socket.connected) {
          socket.emit('ping');
          console.log(`💓 Heartbeat enviado a ${socket.id}`);
        }
      }, 30000); // Cada 30 segundos

      // Registrar usuario automáticamente cuando se conecta
      if (socket.userId) {
        console.log(`🔐 Usuario autenticado conectándose: ${socket.userId} (socket: ${socket.id})`);
        this.onlineUsers.set(socket.userId, socket.id);
        this.saveUserConnection(socket.userId, socket.id)
          .then(() => {
            console.log(`✅ Usuario registrado en línea: ${socket.userId}`);
            socket.emit('userRegistered', { success: true, userId: socket.userId });
          })
          .catch(error => {
            console.error('Error registrando usuario:', error);
            socket.emit('userRegistered', { success: false, error: error.message });
          });
      } else {
        console.log(`🔓 Conexión sin autenticación: ${socket.id}`);
      }

      // Registrar usuario cuando se conecta (método manual)
      socket.on('registerUser', async (userId) => {
        try {
          // Verificar que el usuario autenticado coincida con el que se está registrando
          if (socket.userId !== userId) {
            socket.emit('userRegistered', { success: false, error: 'No autorizado' });
            return;
          }

          this.onlineUsers.set(userId, socket.id);
          
          // Guardar en base de datos
          await this.saveUserConnection(userId, socket.id);
          
          // Usuario registrado en línea
          
          // Enviar confirmación al cliente
          socket.emit('userRegistered', { success: true, userId });
        } catch (error) {
          console.error('Error registrando usuario:', error);
          socket.emit('userRegistered', { success: false, error: error.message });
        }
      });

      // Manejar pong del cliente
      socket.on('pong', () => {
        console.log(`💓 Pong recibido de ${socket.id}`);
      });

      // Manejar desconexión
      socket.on('disconnect', async () => {
        try {
          console.log(`🔌 Desconexión WebSocket: ${socket.id}`);
          
          // Limpiar heartbeat
          if (socket.heartbeatInterval) {
            clearInterval(socket.heartbeatInterval);
            socket.heartbeatInterval = null;
          }
          
          // Encontrar y remover usuario desconectado
          for (const [userId, socketId] of this.onlineUsers.entries()) {
            if (socketId === socket.id) {
              this.onlineUsers.delete(userId);
              await this.removeUserConnection(userId);
              console.log(`🗑️ Usuario desconectado: ${userId}`);
              break;
            }
          }
        } catch (error) {
          console.error('Error manejando desconexión:', error);
        }
      });

      // Manejar errores de conexión
      socket.on('error', (error) => {
        console.error('Error en WebSocket:', error);
      });
    });
  }

  /**
   * Guarda la conexión del usuario en la base de datos
   * Usa ON CONFLICT para manejar conexiones duplicadas de manera atómica
   */
  async saveUserConnection(userId, socketId) {
    try {
      // Usar ON CONFLICT para manejar duplicados de manera atómica
      await db.query(
        `INSERT INTO usuarios_conectados (id, usuario_id, socket_id, fecha_conexion, ultima_actividad) 
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT (usuario_id) DO UPDATE SET 
           socket_id = EXCLUDED.socket_id,
           fecha_conexion = NOW(),
           ultima_actividad = NOW()`,
        [uuidv4(), userId, socketId]
      );
      console.log(`✅ Conexión guardada para usuario: ${userId}`);
    } catch (error) {
      console.error('Error guardando conexión de usuario:', error);
      // Si aún falla, solo logear el error pero no lanzar excepción
      console.log(`⚠️ No se pudo guardar conexión para usuario ${userId}, continuando...`);
    }
  }

  /**
   * Remueve la conexión del usuario de la base de datos
   */
  async removeUserConnection(userId) {
    try {
      await db.query(
        'DELETE FROM usuarios_conectados WHERE usuario_id = $1',
        [userId]
      );
      console.log(`🗑️ Conexión removida para usuario: ${userId}`);
    } catch (error) {
      console.error('Error removiendo conexión de usuario:', error);
    }
  }

  /**
   * Limpia conexiones inactivas de la base de datos
   * Ejecuta cada 5 minutos para mantener la tabla limpia
   */
  async cleanInactiveConnections() {
    try {
      const result = await db.query(
        `DELETE FROM usuarios_conectados 
         WHERE fecha_conexion < NOW() - INTERVAL '1 HOUR'`
      );
      
      if (result.rowCount > 0) {
        console.log(`🧹 Conexiones inactivas limpiadas: ${result.rowCount} registros eliminados`);
      }
    } catch (error) {
      console.error('Error en limpieza de conexiones:', error);
    }
  }

  /**
   * Inicia el limpiador automático de conexiones inactivas
   */
  startConnectionCleaner() {
    // Ejecutar limpieza cada 5 minutos
    this.cleanerInterval = setInterval(() => {
      this.cleanInactiveConnections();
    }, 5 * 60 * 1000); // 5 minutos
    
    console.log('🧹 Limpiador automático de conexiones iniciado (cada 5 minutos)');
  }

  /**
   * Detiene el limpiador automático
   */
  stopConnectionCleaner() {
    if (this.cleanerInterval) {
      clearInterval(this.cleanerInterval);
      this.cleanerInterval = null;
      console.log('🛑 Limpiador automático de conexiones detenido');
    }
  }

  /**
   * Inicia el planificador de alertas
   */
  startAlertScheduler() {
    if (this.alertInterval) {
      console.log('⚠️ El planificador de alertas ya está ejecutándose');
      return;
    }

    // Verificar alertas cada minuto
    this.alertInterval = setInterval(async () => {
      try {
        await this.checkAndSendAlerts();
      } catch (error) {
        console.error('Error en el planificador de alertas:', error);
      }
    }, 60000); // Cada minuto

    console.log('⏰ Planificador de alertas de riego iniciado (cada minuto)');
  }

  /**
   * Detiene el planificador de alertas
   */
  stopAlertScheduler() {
    if (this.alertInterval) {
      clearInterval(this.alertInterval);
      this.alertInterval = null;
      console.log('🛑 Planificador de alertas de riego detenido');
    }
  }

  /**
   * Verifica y envía alertas de riego pendientes
   */
  async checkAndSendAlerts() {
    try {
      const now = new Date();
      
      // Verificar alertas que necesitan notificación (10 minutos antes)
      await this.checkPreAlerts(now);
      
      // Verificar alertas que deben completarse (hora exacta)
      await this.checkDueAlerts(now);

    } catch (error) {
      console.error('Error verificando alertas de riego:', error);
    }
  }

  /**
   * Verifica alertas que deben notificarse 10 minutos antes
   */
  async checkPreAlerts(now) {
    try {
      // Calcular 10 minutos después de ahora
      const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);
      const targetDate = tenMinutesLater.toISOString().split('T')[0]; // YYYY-MM-DD
      const targetTime = tenMinutesLater.toTimeString().split(' ')[0].substring(0, 5); // HH:MM

      // Verificando pre-alertas

      // Buscar alertas que necesitan pre-notificación
      const result = await db.query(
        `SELECT ar.id, ar.huerto_id, ar.descripcion, ar.fecha_alerta, ar.hora_alerta,
                h.nombre as huerto_nombre, h.usuario_creador as propietario_id
         FROM alertas_riego ar
         JOIN huertos h ON ar.huerto_id = h.id
         WHERE ar.fecha_alerta = $1 
         AND ar.hora_alerta = $2
         AND ar.estado = 'activa'`,
        [targetDate, targetTime]
      );
      const preAlerts = result.rows;

      if (preAlerts.length > 0) {
        console.log(`📢 Enviando ${preAlerts.length} pre-notificaciones de riego`);
        
        for (const alert of preAlerts) {
          await this.sendPreNotification(alert);
        }
      }
    } catch (error) {
      // Manejo silencioso de errores de conexión
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET' || error.code === 'ENOTFOUND') {
        // No logear errores de conexión para evitar spam en consola
        return;
      }
      console.error('Error verificando pre-alertas:', error);
    }
  }

  /**
   * Verifica alertas que deben completarse a la hora exacta
   */
  async checkDueAlerts(now) {
    try {
      const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM

      console.log(`🔍 Verificando alertas vencidas para ${currentDate} a las ${currentTime}`);

      // Buscar alertas que deben completarse ahora
      const result = await db.query(
        `SELECT ar.id, ar.huerto_id, ar.descripcion, ar.fecha_alerta, ar.hora_alerta,
                h.nombre as huerto_nombre, h.usuario_creador as propietario_id
         FROM alertas_riego ar
         JOIN huertos h ON ar.huerto_id = h.id
         WHERE ar.fecha_alerta = $1 
         AND ar.hora_alerta = $2
         AND ar.estado = 'activa'`,
        [currentDate, currentTime]
      );
      const dueAlerts = result.rows;

      if (dueAlerts.length > 0) {
        console.log(`⏰ Procesando ${dueAlerts.length} alertas vencidas`);
        
        for (const alert of dueAlerts) {
          await this.processIrrigationAlert(alert);
        }
      }
    } catch (error) {
      // Manejo silencioso de errores de conexión
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET' || error.code === 'ENOTFOUND') {
        // No logear errores de conexión para evitar spam en consola
        return;
      }
      console.error('Error verificando alertas vencidas:', error);
    }
  }

  /**
   * Envía pre-notificación 10 minutos antes de la hora de riego
   */
  async sendPreNotification(alert) {
    try {
      const { id: alertId, huerto_id, huerto_nombre, propietario_id, descripcion, fecha_alerta, hora_alerta } = alert;

      console.log(`📢 Enviando pre-notificación para alerta ${alertId}: ${huerto_nombre} - ${descripcion}`);

      // 1. Notificar al propietario del huerto
      await this.sendPreNotificationToUser(propietario_id, alertId, huerto_id, huerto_nombre, descripcion, fecha_alerta, hora_alerta, 'propietario');

      // 2. Obtener y notificar colaboradores del huerto
      const result = await db.query(
        `SELECT uh.usuario_id, u.nombre
         FROM usuario_huerto uh
         JOIN usuarios u ON uh.usuario_id = u.id
         WHERE uh.huerto_id = $1 AND uh.rol = 'colaborador' AND uh.is_deleted = false AND u.is_deleted = false`,
        [huerto_id]
      );
      const colaboradores = result.rows;

      console.log(`👥 Enviando pre-notificación a ${colaboradores.length} colaboradores del huerto ${huerto_nombre}`);

      // Notificar cada colaborador
      for (const colaborador of colaboradores) {
        await this.sendPreNotificationToUser(
          colaborador.usuario_id, 
          alertId, 
          huerto_id, 
          huerto_nombre, 
          descripcion, 
          fecha_alerta, 
          hora_alerta, 
          'colaborador'
        );
      }

      console.log(`✅ Pre-notificación enviada para alerta ${alertId}`);

    } catch (error) {
      console.error(`❌ Error enviando pre-notificación para alerta ${alert.id}:`, error);
    }
  }

  /**
   * Envía pre-notificación a un usuario específico
   */
  async sendPreNotificationToUser(userId, alertId, huerto_id, huerto_nombre, descripcion, fecha_alerta, hora_alerta, userRole) {
    try {
      const message = userRole === 'propietario' 
        ? `⏰ Recordatorio: En 10 minutos debes regar tu huerto "${huerto_nombre}" - ${descripcion}`
        : `⏰ Recordatorio: En 10 minutos se debe regar el huerto "${huerto_nombre}" - ${descripcion}`;

      // Crear notificación en el buzón
      await this.createNotification(userId, alertId, 'recordatorio', message);

      // Enviar notificación en tiempo real si está conectado
      const isUserOnline = this.onlineUsers.has(userId);
      if (isUserOnline) {
        const socketId = this.onlineUsers.get(userId);
        
        const alertData = {
          type: 'pre_irrigation_alert',
          alertId,
          huerto_id,
          huerto_nombre,
          descripcion,
          fecha_alerta,
          hora_alerta,
          message,
          playSound: true, // Con sonido para pre-notificaciones
          timestamp: new Date().toISOString(),
          userRole,
          minutesUntilIrrigation: 10
        };

        console.log(`📡 Enviando pre-notificación WebSocket a ${userRole} ${userId}`);
        this.io.to(socketId).emit('preIrrigationAlert', alertData);
      }

      console.log(`📬 Pre-notificación enviada a ${userRole} ${userId} (${huerto_nombre})`);

    } catch (error) {
      console.error(`❌ Error enviando pre-notificación a ${userRole} ${userId}:`, error);
    }
  }

  /**
   * Procesa una alerta de riego para un usuario específico (propietario o colaborador)
   */
  async processUserIrrigationAlert(userId, alertId, huerto_id, huerto_nombre, descripcion, userRole) {
    try {
      // Verificar si el usuario está en línea
      const isUserOnline = this.onlineUsers.has(userId);
      console.log(`👤 Usuario ${userId} (${userRole}) está en línea:`, isUserOnline);

      if (isUserOnline) {
        // Usuario en línea: enviar notificación en tiempo real con sonido
        const socketId = this.onlineUsers.get(userId);
        
        const alertData = {
          type: 'irrigation_time',
          alertId,
          huerto_id,
          huerto_nombre,
          descripcion,
          message: userRole === 'propietario' 
            ? `¡Hora de regar tu huerto: ${huerto_nombre}!`
            : `¡Hora de regar el huerto: ${huerto_nombre}!`,
          playSound: true,
          timestamp: new Date().toISOString(),
          userRole
        };

        console.log(`📡 Enviando alerta WebSocket a ${userRole} ${userId} (socket: ${socketId}):`, alertData);
        
        this.io.to(socketId).emit('irrigationAlert', alertData);

        console.log(`🔔 Alerta de riego enviada en tiempo real a ${userRole} ${userId} (${huerto_nombre})`);

        // Crear notificación en el buzón
        await this.createNotification(userId, alertId, 'recordatorio', 
          `Alerta de riego: ${huerto_nombre} - ${descripcion}`);

      } else {
        // Usuario desconectado: solo crear notificación en el buzón
        await this.createNotification(userId, alertId, 'vencida',
          `Alerta de riego vencida para el huerto: ${huerto_nombre} - ${descripcion}`);

        console.log(`📬 Notificación de alerta vencida creada para ${userRole} ${userId} (${huerto_nombre})`);
      }

    } catch (error) {
      console.error(`❌ Error procesando alerta para ${userRole} ${userId}:`, error);
    }
  }

  /**
   * Procesa una alerta de riego individual
   */
  async processIrrigationAlert(alert) {
    try {
      const { id: alertId, huerto_id, huerto_nombre, propietario_id, descripcion } = alert;

      console.log(`🔄 Procesando alerta ${alertId}:`, {
        huerto_id,
        huerto_nombre,
        propietario_id,
        descripcion
      });

      // 1. Procesar propietario del huerto
      await this.processUserIrrigationAlert(propietario_id, alertId, huerto_id, huerto_nombre, descripcion, 'propietario');

      // 2. Obtener y procesar colaboradores del huerto
      const result = await db.query(
        `SELECT uh.usuario_id, u.nombre
         FROM usuario_huerto uh
         JOIN usuarios u ON uh.usuario_id = u.id
         WHERE uh.huerto_id = $1 AND uh.rol = 'colaborador' AND uh.is_deleted = false AND u.is_deleted = false`,
        [huerto_id]
      );
      const colaboradores = result.rows;

      console.log(`👥 Procesando ${colaboradores.length} colaboradores del huerto ${huerto_nombre}`);

      // Procesar cada colaborador
      for (const colaborador of colaboradores) {
        await this.processUserIrrigationAlert(
          colaborador.usuario_id, 
          alertId, 
          huerto_id, 
          huerto_nombre, 
          descripcion, 
          'colaborador'
        );
      }

      // Marcar alerta como completada
      await db.query(
        'UPDATE alertas_riego SET estado = $1 WHERE id = $2',
        ['completada', alertId]
      );

      // Verificar si hay usuarios conectados o colaboradores antes de notificar completado
      const hasConnectedUsers = await this.checkIfUsersAreConnected(huerto_id);
      
      if (hasConnectedUsers) {
        // Notificar a los residentes que la alerta se ha completado automáticamente
        await this.notifyAlertCompletion(
          alertId,
          huerto_id,
          huerto_nombre,
          descripcion,
          'Sistema automático'
        );
        console.log(`📢 Notificación de completado enviada para alerta ${alertId} - hay usuarios conectados`);
      } else {
        console.log(`⏭️ No se envió notificación de completado para alerta ${alertId} - no hay usuarios conectados ni colaboradores`);
      }

      console.log(`✅ Alerta ${alertId} procesada y marcada como completada`);

    } catch (error) {
      console.error(`❌ Error procesando alerta ${alert.id}:`, error);
    }
  }

  /**
   * Verifica si hay usuarios conectados o colaboradores para un huerto específico
   */
  async checkIfUsersAreConnected(huertoId) {
    try {
      // 1. Obtener el propietario del huerto
      const result = await db.query(
        'SELECT usuario_creador FROM huertos WHERE id = $1',
        [huertoId]
      );
      const huertoInfo = result.rows;

      if (huertoInfo.length === 0) {
        return false;
      }

      const propietarioId = huertoInfo[0].usuario_creador;

      // 2. Verificar si el propietario está conectado
      const isPropietarioOnline = this.onlineUsers.has(propietarioId);
      if (isPropietarioOnline) {
        console.log(`👤 Propietario ${propietarioId} está conectado`);
        return true;
      }

      // 3. Obtener colaboradores del huerto
      const result2 = await db.query(
        `SELECT uh.usuario_id, u.nombre
         FROM usuario_huerto uh
         JOIN usuarios u ON uh.usuario_id = u.id
         WHERE uh.huerto_id = $1 AND uh.rol = 'colaborador' AND uh.is_deleted = false AND u.is_deleted = false`,
        [huertoId]
      );
      const colaboradores = result2.rows;

      // 4. Verificar si algún colaborador está conectado
      for (const colaborador of colaboradores) {
        const isColaboradorOnline = this.onlineUsers.has(colaborador.usuario_id);
        if (isColaboradorOnline) {
          console.log(`👥 Colaborador ${colaborador.nombre} (${colaborador.usuario_id}) está conectado`);
          return true;
        }
      }

      console.log(`❌ No hay usuarios conectados para el huerto ${huertoId} (propietario + ${colaboradores.length} colaboradores)`);
      return false;

    } catch (error) {
      console.error('Error verificando usuarios conectados:', error);
      return false;
    }
  }

  /**
   * Crea una notificación en el buzón del usuario
   */
  async createNotification(userId, alertId, tipo, mensaje) {
    try {
      await db.query(
        `INSERT INTO notificaciones_alertas (usuario_id, alerta_id, tipo, mensaje) 
         VALUES ($1, $2, $3, $4)`,
        [userId, alertId, tipo, mensaje]
      );
    } catch (error) {
      console.error('Error creando notificación:', error);
      throw error;
    }
  }

  /**
   * Envía notificación a los usuarios autorizados del huerto (propietario, colaboradores, admins/técnicos)
   */
  async notifyGardenResidents(alertId, huertoId, huertoNombre, descripcion, creadoPor) {
    try {
      // 1. Obtener el propietario del huerto (siempre recibe notificación)
      const result = await db.query(
        'SELECT usuario_creador FROM huertos WHERE id = $1',
        [huertoId]
      );
      const huertoInfo = result.rows;

      if (huertoInfo.length > 0) {
        const propietarioId = huertoInfo[0].usuario_creador;
        
        // Notificar al propietario
        const message = `Nueva alerta de riego programada para tu huerto: ${huertoNombre} - ${descripcion}`;
        await this.createNotification(propietarioId, alertId, 'creacion', message);
        
        await this.sendRealtimeNotification(
          propietarioId,
          'newAlertNotification',
          {
            type: 'alert_created',
            alertId,
            huertoNombre,
            message: `Nueva alerta de riego programada para tu huerto: ${huertoNombre}`,
            descripcion,
            createdBy: creadoPor,
            userRole: 'propietario'
          }
        );

        console.log(`📬 Notificación enviada al propietario del huerto: ${huertoNombre}`);
      }

      // 2. Obtener colaboradores del huerto (residentes con permisos otorgados por el propietario)
      const result2 = await db.query(
        `SELECT uh.usuario_id, u.nombre
         FROM usuario_huerto uh
         JOIN usuarios u ON uh.usuario_id = u.id
         WHERE uh.huerto_id = $1 AND uh.rol = 'colaborador' AND uh.is_deleted = false AND u.is_deleted = false`,
        [huertoId]
      );
      const colaboradores = result2.rows;

      console.log(`📢 Encontrados ${colaboradores.length} colaboradores en el huerto ${huertoNombre}`);

      // Crear notificaciones para cada colaborador
      for (const colaborador of colaboradores) {
        const message = `Nueva alerta de riego programada para el huerto: ${huertoNombre} - ${descripcion}`;
        
        // Crear notificación en el buzón
        await this.createNotification(colaborador.usuario_id, alertId, 'creacion', message);

        // Enviar notificación WebSocket en tiempo real si está en línea
        await this.sendRealtimeNotification(
          colaborador.usuario_id,
          'newAlertNotification',
          {
            type: 'alert_created',
            alertId,
            huertoNombre,
            message: `Nueva alerta de riego programada para el huerto: ${huertoNombre}`,
            descripcion,
            createdBy: creadoPor,
            userRole: 'colaborador'
          }
        );

        console.log(`📬 Notificación enviada a colaborador: ${colaborador.nombre}`);
      }

      console.log(`✅ Notificaciones enviadas a 1 propietario y ${colaboradores.length} colaboradores del huerto ${huertoNombre}`);

    } catch (error) {
      console.error('Error notificando residentes del huerto:', error);
    }
  }

  /**
   * Envía notificación a administradores y técnicos cuando se crea una alerta
   */
  async notifyAdminsAndTechnicians(alertId, huertoNombre, creadoPor, creadoPorId) {
    try {
      // Obtener la ubicación del usuario que creó la alerta
      const result = await db.query(
        'SELECT ubicacion_id FROM usuarios WHERE id = $1',
        [creadoPorId]
      );
      const creatorLocation = result.rows;

      if (!creatorLocation.length || !creatorLocation[0].ubicacion_id) {
        console.log('❌ No se pudo obtener la ubicación del creador de la alerta');
        return;
      }

      const condominioId = creatorLocation[0].ubicacion_id;

      // Obtener administradores y técnicos del mismo condominio
      const result2 = await db.query(
        'SELECT id, nombre FROM usuarios WHERE rol IN ($1, $2) AND ubicacion_id = $3',
        ['administrador', 'tecnico', condominioId]
      );
      const users = result2.rows;

      const message = `Nueva alerta de riego creada para el huerto: ${huertoNombre}`;

      // Crear notificaciones para cada admin/técnico del mismo condominio
      for (const user of users) {
        await this.createNotification(user.id, alertId, 'creacion', message);

        // Si están en línea, enviar notificación en tiempo real
        if (this.onlineUsers.has(user.id)) {
          const socketId = this.onlineUsers.get(user.id);
          this.io.to(socketId).emit('newAlertNotification', {
            type: 'alert_created',
            alertId,
            huertoNombre,
            message: `Nueva alerta de riego: ${huertoNombre}`,
            createdBy: creadoPor
          });
        }
      }

      console.log(`📢 Notificaciones enviadas a ${users.length} administradores/técnicos del condominio ${condominioId}`);

    } catch (error) {
      console.error('Error notificando administradores y técnicos:', error);
    }
  }

  /**
   * Notifica a los usuarios autorizados del huerto cuando se completa una alerta
   */
  async notifyAlertCompletion(alertId, huertoId, huertoNombre, descripcion, completadoPor) {
    try {
      // 1. Obtener el propietario del huerto
      const result = await db.query(
        `SELECT h.usuario_creador, u.nombre as propietario_nombre
         FROM huertos h
         JOIN usuarios u ON h.usuario_creador = u.id
         WHERE h.id = $1`,
        [huertoId]
      );
      const huertoInfo = result.rows;

      if (huertoInfo.length === 0) {
        console.log('❌ Huerto no encontrado para notificación de completado');
        return;
      }

      const propietarioId = huertoInfo[0].usuario_creador;
      const propietarioNombre = huertoInfo[0].propietario_nombre;

      // 2. Obtener colaboradores del huerto
      const result2 = await db.query(
        `SELECT uh.usuario_id, u.nombre
         FROM usuario_huerto uh
         JOIN usuarios u ON uh.usuario_id = u.id
         WHERE uh.huerto_id = $1 AND uh.rol = 'colaborador' AND uh.is_deleted = false AND u.is_deleted = false`,
        [huertoId]
      );
      const colaboradores = result2.rows;

      // 3. Determinar quién está conectado y quién no
      const isPropietarioOnline = this.onlineUsers.has(propietarioId);
      const connectedUsers = [];
      const disconnectedUsers = [];

      // Verificar propietario
      if (isPropietarioOnline) {
        connectedUsers.push({ id: propietarioId, nombre: propietarioNombre, role: 'propietario' });
      } else {
        disconnectedUsers.push({ id: propietarioId, nombre: propietarioNombre, role: 'propietario' });
      }

      // Verificar colaboradores
      for (const colaborador of colaboradores) {
        const isColaboradorOnline = this.onlineUsers.has(colaborador.usuario_id);
        if (isColaboradorOnline) {
          connectedUsers.push({ id: colaborador.usuario_id, nombre: colaborador.nombre, role: 'colaborador' });
        } else {
          disconnectedUsers.push({ id: colaborador.usuario_id, nombre: colaborador.nombre, role: 'colaborador' });
        }
      }

      console.log(`🔍 Estado de conexión para huerto ${huertoNombre}:`, {
        conectados: connectedUsers.length,
        desconectados: disconnectedUsers.length,
        conectados: connectedUsers.map(u => u.nombre),
        desconectados: disconnectedUsers.map(u => u.nombre)
      });

      // 4. Enviar notificaciones personalizadas
      // A usuarios conectados: notificación normal
      for (const user of connectedUsers) {
        const message = `Alerta de riego completada para tu huerto: ${huertoNombre} - ${descripcion}`;
        
        // Crear notificación en el buzón
        await this.createNotification(user.id, alertId, 'completada', message);

        // Enviar notificación WebSocket en tiempo real
        await this.sendRealtimeNotification(
          user.id,
          'irrigationAlert',
          {
            type: 'alert_completed',
            alertId,
            huerto_id: huertoId,
            huerto_nombre: huertoNombre,
            descripcion,
            message: `¡Alerta de riego completada para tu huerto: ${huertoNombre}!`,
            completedBy: completadoPor,
            userRole: user.role,
            playSound: true,
            timestamp: new Date().toISOString()
          }
        );

        console.log(`✅ Notificación normal enviada a usuario conectado: ${user.nombre}`);
      }

      // A usuarios desconectados: notificación personalizada con información de quién estaba conectado
      if (connectedUsers.length > 0) {
        const connectedNames = connectedUsers.map(u => u.nombre).join(', ');
        
        for (const user of disconnectedUsers) {
          const personalizedMessage = `Alerta de riego completada para tu huerto: ${huertoNombre} - ${descripcion} por el usuario ${connectedNames}`;
          
          // Crear notificación personalizada en el buzón
          await this.createNotification(user.id, alertId, 'completada', personalizedMessage);

          console.log(`✅ Notificación personalizada enviada a usuario desconectado: ${user.nombre} (completado por: ${connectedNames})`);
        }
      } else {
        // Si nadie estaba conectado, enviar notificación de alerta vencida a todos
        for (const user of disconnectedUsers) {
          const message = `Alerta de riego vencida para tu huerto: ${huertoNombre} - ${descripcion}`;
          await this.createNotification(user.id, alertId, 'vencida', message);
          console.log(`✅ Notificación de alerta vencida enviada a usuario desconectado: ${user.nombre} (nadie estaba conectado)`);
        }
      }

      console.log(`🎉 Notificaciones de completado enviadas: ${connectedUsers.length} conectados, ${disconnectedUsers.length} desconectados`);

    } catch (error) {
      console.error('Error notificando completado de alerta:', error);
    }
  }

  /**
   * Envía notificación en tiempo real a un usuario específico
   */
  async sendRealtimeNotification(userId, eventType, data) {
    try {
      const isUserOnline = this.onlineUsers.has(userId);
      
      if (!isUserOnline) {
        console.log(`❌ Usuario ${userId} no está en línea, no se puede enviar notificación en tiempo real`);
        return false;
      }

      const socketId = this.onlineUsers.get(userId);
      console.log(`📡 Enviando notificación en tiempo real a usuario ${userId} (socket: ${socketId}):`, data);
      
      this.io.to(socketId).emit(eventType, data);
      
      console.log(`✅ Notificación en tiempo real enviada exitosamente`);
      return true;
    } catch (error) {
      console.error(`❌ Error enviando notificación en tiempo real:`, error);
      return false;
    }
  }

  /**
   * Obtiene estadísticas del servicio
   */
  getStats() {
    return {
      onlineUsers: this.onlineUsers.size,
      isSchedulerRunning: !!this.alertInterval,
      connectedSockets: this.io ? this.io.engine.clientsCount : 0
    };
  }

  /**
   * Obtiene la lista de usuarios conectados con información detallada
   * @param {string} userLocationId - ID de ubicación para filtrar por condominio (opcional)
   */
  async getConnectedUsers(userLocationId = null) {
    try {
      console.log(`🔍 Obteniendo usuarios conectados para condominio: ${userLocationId}`);
      console.log(`📊 Usuarios en memoria: ${this.onlineUsers.size}`);
      
      const connectedUsers = [];
      
      // Construir la consulta base
      let query = `
        SELECT uc.usuario_id, uc.socket_id, uc.fecha_conexion,
               u.nombre, u.rol, u.email, u.ubicacion_id
        FROM usuarios_conectados uc
        JOIN usuarios u ON uc.usuario_id = u.id
        WHERE uc.fecha_conexion >= NOW() - INTERVAL '1 HOUR'
      `;
      
      const params = [];
      
      // Agregar filtro por condominio si se proporciona
      if (userLocationId) {
        query += ` AND u.ubicacion_id = $${params.length + 1}`;
        params.push(userLocationId);
      }
      
      query += ` ORDER BY uc.fecha_conexion DESC`;
      
      console.log(`📝 Query ejecutada:`, query);
      console.log(`📝 Parámetros:`, params);
      
      // Obtener información de usuarios conectados desde la base de datos
      const result = await db.query(query, params);
      const users = result.rows;

      console.log(`📊 Usuarios encontrados en BD: ${users.length}`);
      users.forEach(user => {
        console.log(`  - ${user.nombre} (${user.usuario_id}) - ${user.fecha_conexion}`);
      });

      // Agregar información adicional de cada usuario
      for (const user of users) {
        const isOnline = this.onlineUsers.has(user.usuario_id);
        const socketId = this.onlineUsers.get(user.usuario_id);
        
        console.log(`👤 Usuario ${user.nombre}: isOnline=${isOnline}, socketId=${socketId}`);
        
        connectedUsers.push({
          usuario_id: user.usuario_id,
          nombre: user.nombre,
          rol: user.rol,
          email: user.email,
          ubicacion_id: user.ubicacion_id,
          socket_id: user.socket_id,
          fecha_conexion: user.fecha_conexion,
          isOnline: isOnline,
          currentSocketId: socketId,
          connectionStatus: isOnline ? 'active' : 'inactive'
        });
      }

      console.log(`✅ Total usuarios conectados retornados: ${connectedUsers.length}`);
      return connectedUsers;
    } catch (error) {
      console.error('Error obteniendo usuarios conectados:', error);
      return [];
    }
  }

  /**
   * Prueba el envío de una notificación WebSocket (para debugging)
   */
  async testWebSocketNotification(userId, message = 'Prueba de notificación WebSocket') {
    try {
      const isUserOnline = this.onlineUsers.has(userId);
      
      if (!isUserOnline) {
        console.log(`❌ Usuario ${userId} no está en línea`);
        return false;
      }

      const socketId = this.onlineUsers.get(userId);
      const testData = {
        type: 'test',
        message,
        timestamp: new Date().toISOString(),
        playSound: true
      };

      console.log(`🧪 Enviando notificación de prueba a usuario ${userId} (socket: ${socketId}):`, testData);
      
      this.io.to(socketId).emit('irrigationAlert', testData);
      
      console.log(`✅ Notificación de prueba enviada exitosamente`);
      return true;
    } catch (error) {
      console.error(`❌ Error enviando notificación de prueba:`, error);
      return false;
    }
  }

  /**
   * Detiene el servicio
   */
  stop() {
    this.stopAlertScheduler();
    if (this.io) {
      this.io.close();
      console.log('🔌 Servidor WebSocket cerrado');
    }
  }
}

// Crear instancia singleton
const irrigationAlertService = new IrrigationAlertService();

export default irrigationAlertService;
