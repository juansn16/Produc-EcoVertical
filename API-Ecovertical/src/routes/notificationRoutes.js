import express from 'express';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
  deleteNotification
} from '../controllers/notificationController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateJWT);

// Obtener notificaciones del usuario
router.get('/', getUserNotifications);

// Obtener contador de notificaciones no leídas
router.get('/unread-count', getUnreadCount);

// Marcar notificación específica como leída
router.patch('/:notificationId/read', markNotificationAsRead);

// Marcar todas las notificaciones como leídas
router.patch('/mark-all-read', markAllNotificationsAsRead);

// Eliminar notificación
router.delete('/:notificationId', deleteNotification);

export default router;
