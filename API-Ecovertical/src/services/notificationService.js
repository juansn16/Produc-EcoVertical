import db from '../config/db.js';
import { sendEmail } from '../utils/sendEmail.js';
import { v4 as uuidv4 } from 'uuid';

class NotificationService {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
  }

  // Iniciar el servicio de notificaciones
  start() {
    if (this.isRunning) {
      console.log('Servicio de notificaciones ya está ejecutándose');
      return;
    }

    this.isRunning = true;
    console.log('Iniciando servicio de notificaciones de riego...');

    // Ejecutar inmediatamente
    this.checkAndSendNotifications();

    // Luego ejecutar cada minuto
    this.intervalId = setInterval(() => {
      this.checkAndSendNotifications();
    }, 60000); // 60 segundos
  }

  // Detener el servicio de notificaciones
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Servicio de notificaciones detenido');
  }

  // Verificar y enviar notificaciones
  async checkAndSendNotifications() {
    try {
      const now = new Date();
      const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

      // Obtener alertas que necesitan notificación
      const result = await db.query(
        `SELECT 
          apr.*,
          h.nombre as huerto_nombre,
          h.tipo as huerto_tipo
        FROM alertas_programadas_riego apr
        INNER JOIN huertos h ON apr.huerto_id = h.id
        WHERE apr.esta_activa = true 
          AND apr.notificacion_enviada = false
          AND apr.fecha_programada BETWEEN $1 AND $2
          AND apr.is_deleted = false`,
        [now, tenMinutesFromNow]
      );
      const alertas = result.rows;

      console.log(`Encontradas ${alertas.length} alertas que necesitan notificación`);

      for (const alerta of alertas) {
        await this.sendWateringNotification(alerta);
      }

    } catch (error) {
      // Manejo silencioso de errores de conexión
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET' || error.code === 'ENOTFOUND') {
        // No logear errores de conexión para evitar spam en consola
        return;
      }
      console.error('Error en el servicio de notificaciones:', error);
    }
  }

  // Enviar notificación de riego
  async sendWateringNotification(alerta) {
    try {
      // Obtener todos los usuarios del condominio
      const result = await db.query(
        `SELECT DISTINCT u.id, u.nombre, u.email, u.telefono 
         FROM usuarios u 
         INNER JOIN usuario_huerto uh ON u.id = uh.usuario_id 
         WHERE uh.huerto_id = $1 AND u.is_deleted = 0 AND uh.is_deleted = 0`,
        [alerta.huerto_id]
      );
      const usuarios = result.rows;

      console.log(`Enviando notificación de riego a ${usuarios.length} usuarios`);

      // Crear notificaciones para todos los usuarios
      for (const usuario of usuarios) {
        await this.createNotificationRecord(alerta, usuario);
        
        // Enviar email si el usuario tiene email
        if (usuario.email) {
          await this.sendEmailNotification(alerta, usuario);
        }
      }

      // Marcar la alerta como notificada
      await db.query(
        'UPDATE alertas_programadas_riego SET notificacion_enviada = true, fecha_notificacion_enviada = NOW() WHERE id = $1',
        [alerta.id]
      );

      console.log(`Notificación de riego enviada para alerta ${alerta.id}`);

    } catch (error) {
      console.error(`Error enviando notificación para alerta ${alerta.id}:`, error);
    }
  }

  // Crear registro de notificación en la base de datos
  async createNotificationRecord(alerta, usuario) {
    const notificacionId = uuidv4();
    
    const mensaje = `🌱 Recordatorio de Riego Programado\n\n` +
      `Huerto: ${alerta.huerto_nombre}\n` +
      `Fecha: ${alerta.fecha_programada}\n` +
      `Hora: ${alerta.hora_programada}\n` +
      `Duración: ${alerta.duracion_minutos} minutos\n\n` +
      `¡Es hora de regar el huerto comunitario! 🌿💧`;

    await db.query(
      `INSERT INTO notificaciones_alertas_riego (
        id, alerta_programada_id, usuario_id, tipo_notificacion, 
        mensaje, metodo_envio
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [notificacionId, alerta.id, usuario.id, 'recordatorio', mensaje, 'sistema']
    );
  }

  // Enviar notificación por email
  async sendEmailNotification(alerta, usuario) {
    try {
      const subject = `🌱 Recordatorio de Riego - ${alerta.huerto_nombre}`;
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🌱 Recordatorio de Riego</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Sistema EcoVertical</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
            <h2 style="color: #374151; margin-top: 0;">¡Hola ${usuario.nombre}!</h2>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
              Te recordamos que tienes programado un riego para el huerto comunitario.
            </p>
            
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #166534; margin-top: 0;">📅 Detalles del Riego</h3>
              <ul style="color: #374151; margin: 0; padding-left: 20px;">
                <li><strong>Huerto:</strong> ${alerta.huerto_nombre}</li>
                <li><strong>Fecha:</strong> ${alerta.fecha_programada}</li>
                <li><strong>Hora:</strong> ${alerta.hora_programada}</li>
                <li><strong>Duración:</strong> ${alerta.duracion_minutos} minutos</li>
                ${alerta.descripcion ? `<li><strong>Descripción:</strong> ${alerta.descripcion}</li>` : ''}
              </ul>
            </div>
            
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">💡 Consejos para el Riego</h3>
              <ul style="color: #374151; margin: 0; padding-left: 20px;">
                <li>Riega temprano en la mañana o al final del día</li>
                <li>Verifica que el suelo esté seco antes de regar</li>
                <li>Riega de manera uniforme en toda el área</li>
                <li>Evita mojar las hojas para prevenir enfermedades</li>
              </ul>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
              Este es un recordatorio automático del sistema EcoVertical. 
              Si no puedes asistir al riego, por favor coordina con otros miembros del condominio.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
            <p>© 2024 EcoVertical - Sistema de Gestión de Huertos Verticales</p>
          </div>
        </div>
      `;

      await sendEmail(usuario.email, subject, htmlContent);
      console.log(`Email enviado a ${usuario.email} para alerta ${alerta.id}`);

    } catch (error) {
      console.error(`Error enviando email a ${usuario.email}:`, error);
    }
  }

  // Obtener estadísticas del servicio
  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalId: this.intervalId ? 'active' : 'inactive'
    };
  }
}

// Crear instancia singleton
const notificationService = new NotificationService();

export default notificationService;
