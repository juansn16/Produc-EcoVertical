import express from 'express';
import * as invitationCodeController from '../controllers/invitationCodeController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/roleMiddleware.js';
import { zodValidate } from '../middleware/validationMiddleware.js';

const router = express.Router();

// POST /api/invitation-codes/validate - Validar código de invitación (público, para registro)
// Esta ruta debe estar ANTES del middleware de autenticación
router.post('/validate', 
  invitationCodeController.validateInvitationCode
);

// Todas las demás rutas requieren autenticación
router.use(authenticateJWT);

// POST /api/invitation-codes - Crear nuevo código de invitación (solo administradores)
router.post('/', 
  isAdmin, 
  invitationCodeController.createInvitationCode
);

// GET /api/invitation-codes/current - Obtener código actual del administrador
router.get('/current', 
  isAdmin, 
  invitationCodeController.getCurrentInvitationCode
);

// GET /api/invitation-codes/history - Obtener historial de códigos del administrador
router.get('/history', 
  isAdmin, 
  invitationCodeController.getInvitationCodeHistory
);

// DELETE /api/invitation-codes/:id - Eliminar código de invitación
router.delete('/:id', 
  isAdmin, 
  invitationCodeController.deleteInvitationCode
);

export default router;
