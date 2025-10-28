import cron from 'node-cron';
import db from '../config/db.js';
import { createNotification } from '../controllers/notificationController.js';

class NotificationScheduler {
  constructor() {
    this.isRunning = false;
    this.task = null;
  }

  // Iniciar el programador de notificaciones
  start() {
    if (this.isRunning) {
      console.log('⚠️ El programador de notificaciones ya está ejecutándose');
      return;
    }

    // Ejecutar cada minuto para verificar alertas pendientes
    this.task = cron.schedule('* * * * *', async () => {
      try {
        await this.checkPendingNotifications();
      } catch (error) {
        console.error('Error en el programador de notificaciones:', error);
      }
    });

    this.isRunning = true;
    console.log('✅ Programador de notificaciones iniciado');
  }

  // Detener el programador de notificaciones
  stop() {
    if (this.task) {
      this.task.stop();
      this.task = null;
    }
    this.isRunning = false;
    console.log('⏹️ Programador de notificaciones detenido');
  }

  // Verificar notificaciones pendientes
  async checkPendingNotifications() {
    try {
      const now = new Date();
      
      // Buscar alertas que necesitan notificación (10 minutos antes)
      const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);
      
      const result = await db.query(
        `SELECT 
          apr.*,
          h.nombre as huerto_nombre,
          h.tipo as huerto_tipo
        FROM alertas_programadas_riego apr
        INNER JOIN huertos h ON apr.huerto_id = h.id
        WHERE apr.esta_activa = true 
          AND apr.notificacion_enviada = false
          AND apr.is_deleted = false
          AND CONCAT(apr.fecha_programada, ' ', apr.hora_programada) BETWEEN $1 AND $2`,
        [now, tenMinutesFromNow]
      );
      const alerts = result.rows;

      console.log(`🔍 Verificando notificaciones: ${alerts.length} alertas encontradas`);

      for (const alert of alerts) {
        try {
          await this.sendWateringNotification(alert);
          
          // Marcar como notificada
          await db.query(
            'UPDATE alertas_programadas_riego SET notificacion_enviada = true, fecha_notificacion_enviada = NOW() WHERE id = $1',
            [alert.id]
          );
          
          console.log(`✅ Notificación enviada para alerta ${alert.id}`);
        } catch (error) {
          console.error(`❌ Error enviando notificación para alerta ${alert.id}:`, error);
        }
      }
    } catch (error) {
      // Manejo silencioso de errores de conexión
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET' || error.code === 'ENOTFOUND') {
        // No logear errores de conexión para evitar spam en consola
        return;
      }
      throw error;
    }
  }

  // Enviar notificación de riego
  async sendWateringNotification(alert) {
    // Obtener todos los usuarios del huerto
    const result = await db.query(
      `SELECT DISTINCT u.id, u.nombre, u.email, u.telefono 
       FROM usuarios u 
       INNER JOIN usuario_huerto uh ON u.id = uh.usuario_id 
       WHERE uh.huerto_id = $1 AND u.is_deleted = 0 AND uh.is_deleted = 0`,
      [alert.huerto_id]
    );
    const usuarios = result.rows;

    const fechaHora = new Date(`${alert.fecha_programada} ${alert.hora_programada}`);
    const fechaFormateada = fechaHora.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const horaFormateada = alert.hora_programada.substring(0, 5);

    for (const usuario of usuarios) {
      try {
        const tituloNotificacion = `🌱 Recordatorio de Riego - ${alert.huerto_nombre}`;
        const mensajeNotificacion = `¡Es hora de regar! La alerta programada para el huerto "${alert.huerto_nombre}" está programada para el ${fechaFormateada} a las ${horaFormateada}.`;
        
        const datosAdicionales = {
          alerta_id: alert.id,
          huerto_id: alert.huerto_id,
          huerto_nombre: alert.huerto_nombre,
          tipo_alerta: 'riego_programado',
          fecha_programada: alert.fecha_programada,
          hora_programada: alert.hora_programada,
          duracion_minutos: alert.duracion_minutos
        };
        
        await createNotification(
          usuario.id,
          tituloNotificacion,
          mensajeNotificacion,
          'riego_programado',
          datosAdicionales
        );
      } catch (error) {
        console.error(`Error creando notificación para usuario ${usuario.id}:`, error);
      }
    }
  }

  // Verificar alertas vencidas y marcarlas como tales
  async checkOverdueAlerts() {
    const now = new Date();
    
    const result = await db.query(
      `SELECT id, titulo, huerto_nombre 
       FROM alertas_programadas_riego apr
       INNER JOIN huertos h ON apr.huerto_id = h.id
       WHERE apr.esta_activa = true 
         AND apr.is_deleted = false
         AND CONCAT(apr.fecha_programada, ' ', apr.hora_programada) < $1`,
      [now]
    );
    const overdueAlerts = result.rows;

    if (overdueAlerts.length > 0) {
      console.log(`⏰ ${overdueAlerts.length} alertas vencidas encontradas`);
      
      // Aquí podrías agregar lógica adicional para manejar alertas vencidas
      // Por ejemplo, enviar notificaciones de que la alerta ha vencido
      for (const alert of overdueAlerts) {
        console.log(`⚠️ Alerta vencida: ${alert.titulo} - ${alert.huerto_nombre}`);
      }
    }
  }
}

// Crear instancia singleton
const notificationScheduler = new NotificationScheduler();

export default notificationScheduler;
