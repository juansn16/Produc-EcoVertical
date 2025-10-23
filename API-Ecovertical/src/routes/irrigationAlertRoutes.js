import express from 'express';
import { authenticateJWT } from '../middleware/authMiddleware.js';
import {
  createIrrigationAlert,
  getAllIrrigationAlerts,
  getUserIrrigationAlerts,
  getIrrigationAlertById,
  updateIrrigationAlertStatus,
  deleteIrrigationAlert,
  getIrrigationAlertStats,
  testWebSocketNotification,
  getConnectedUsers
} from '../controllers/irrigationAlertController.js';

import {
  getUserAlertNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationCount,
  getRecentNotifications
} from '../controllers/alertNotificationController.js';

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateJWT);

// Rutas para alertas de riego
router.post('/', createIrrigationAlert);
router.get('/', getAllIrrigationAlerts);
router.get('/user', getUserIrrigationAlerts);
router.get('/stats', getIrrigationAlertStats);
router.get('/connected-users', getConnectedUsers);
router.post('/test-websocket', testWebSocketNotification);
router.get('/:id', getIrrigationAlertById);
router.patch('/:id/status', updateIrrigationAlertStatus);
router.delete('/:id', deleteIrrigationAlert);

// Rutas para notificaciones de alertas
router.get('/notifications/all', getUserAlertNotifications);
router.get('/notifications/recent', getRecentNotifications);
router.get('/notifications/unread-count', getUnreadNotificationCount);
router.patch('/notifications/:id/read', markNotificationAsRead);
router.patch('/notifications/mark-all-read', markAllNotificationsAsRead);
router.delete('/notifications/:id', deleteNotification);

export default router;
