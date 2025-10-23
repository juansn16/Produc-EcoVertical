import express from 'express';
import * as alertController from '../controllers/alertController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware.js';
import { zodValidate } from '../middleware/validationMiddleware.js';
// Esquemas: src/validators/alertValidators.js
import { paramsAlertId, paramsGardenId, createAlertSchema, updateAlertSchema, upcomingQuerySchema, gardenAlertsQuerySchema, updateAlertStatusSchema } from '../validators/alertValidators.js';

const router = express.Router();

// Fin esquemas

// POST /api/alerts - Crear alerta (Técnico/Admin para públicos, Propietario para privados) (HU-0008)
router.post('/', [authenticateJWT, zodValidate(createAlertSchema)], alertController.createAlert);

// GET /api/alerts/upcoming - Próximas alertas (HU-0008)
router.get('/upcoming', [authenticateJWT, authorizeRoles(['administrador', 'tecnico', 'residente']), zodValidate(upcomingQuerySchema, 'query')], alertController.getUpcomingAlerts);

// GET /api/alerts/garden/:gardenId - Alertas por jardín
router.get('/garden/:gardenId', [authenticateJWT, authorizeRoles(['administrador', 'tecnico', 'residente']), zodValidate(paramsGardenId, 'params'), zodValidate(gardenAlertsQuerySchema, 'query')], alertController.getGardenAlerts);

// PUT /api/alerts/:alertId/status - Cambiar estado de alerta
router.put('/:alertId/status', [authenticateJWT, authorizeRoles(['administrador', 'tecnico']), zodValidate(paramsAlertId, 'params'), zodValidate(updateAlertStatusSchema)], alertController.updateAlertStatus);

// PUT /api/alerts/:alertId - Editar alerta (Solo creador o Admin)
router.put('/:alertId', [authenticateJWT, authorizeRoles(['administrador', 'tecnico']), zodValidate(paramsAlertId, 'params'), zodValidate(updateAlertSchema)], alertController.updateAlert);

// DELETE /api/alerts/:alertId - Eliminar alerta (Solo creador o Admin)
router.delete('/:alertId', [authenticateJWT, authorizeRoles(['administrador', 'tecnico']), zodValidate(paramsAlertId, 'params')], alertController.deleteAlert);

// POST /api/alerts/:alertId/notify - Notificar alerta ahora
router.post('/:alertId/notify', [authenticateJWT, authorizeRoles(['administrador', 'tecnico']), zodValidate(paramsAlertId, 'params')], alertController.triggerAlertNotification);

export default router;