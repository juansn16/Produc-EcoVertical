import express from 'express';
import * as gardenController from '../controllers/gardenController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware.js';
import { verifyGardenAccess, verifyGardenCreationPermissions, verifyGardenModificationPermissions } from '../middleware/gardenAccessMiddleware.js';
import { zodValidate } from '../middleware/validationMiddleware.js';
import { 
  paramsGardenId, 
  paramsGardenIdAndUserId,
  createGardenSchema, 
  queryListSchema, 
  updateGardenSchema, 
  maintenanceSchema, 
  maintenanceHistoryQuerySchema, 
  assignSchema,
  gardenDataSchema 
} from '../validators/gardenValidators.js';

const router = express.Router();

// GET /api/gardens - Listar jardines con filtros (HU-0003)
router.get('/', [authenticateJWT, authorizeRoles(['administrador', 'tecnico', 'residente']), zodValidate(queryListSchema, 'query')], gardenController.listGardens);

// GET /api/gardens/user - Obtener huertos del usuario actual
router.get('/user', [authenticateJWT, authorizeRoles(['administrador', 'tecnico', 'residente'])], gardenController.getUserGardens);

// POST /api/gardens - Crear nuevo jardín (HU-0003)
router.post('/', [authenticateJWT, authorizeRoles(['administrador', 'tecnico', 'residente']), verifyGardenCreationPermissions, zodValidate(createGardenSchema)], gardenController.createGarden);

// GET /api/gardens/:gardenId - Obtener detalles de jardín
router.get('/:gardenId', [authenticateJWT, authorizeRoles(['administrador', 'tecnico', 'residente']), verifyGardenAccess, zodValidate(paramsGardenId, 'params')], gardenController.getGardenDetails);

// PUT /api/gardens/:gardenId - Actualizar jardín
router.put('/:gardenId', [authenticateJWT, authorizeRoles(['administrador', 'tecnico', 'residente']), verifyGardenModificationPermissions, zodValidate(paramsGardenId, 'params'), zodValidate(updateGardenSchema)], gardenController.updateGarden);

// DELETE /api/gardens/:gardenId - Eliminar jardín (Solo Admin)
router.delete('/:gardenId', [authenticateJWT, authorizeRoles(['administrador']), zodValidate(paramsGardenId, 'params')], gardenController.deleteGarden);

// POST /api/gardens/:gardenId/maintenance - Registrar mantenimiento (HU-0004)
router.post('/:gardenId/maintenance', [authenticateJWT, authorizeRoles(['administrador', 'tecnico']), verifyGardenAccess, zodValidate(paramsGardenId, 'params'), zodValidate(maintenanceSchema)], gardenController.recordMaintenance);

// GET /api/gardens/:gardenId/maintenance - Obtener historial de mantenimiento (HU-0004)
router.get('/:gardenId/maintenance', [authenticateJWT, authorizeRoles(['administrador', 'tecnico', 'residente']), verifyGardenAccess, zodValidate(paramsGardenId, 'params'), zodValidate(maintenanceHistoryQuerySchema, 'query')], gardenController.getMaintenanceHistory);

// GET /api/gardens/:gardenId/plants - Obtener plantas del jardín
router.get('/:gardenId/plants', [authenticateJWT, authorizeRoles(['administrador', 'tecnico', 'residente']), verifyGardenAccess, zodValidate(paramsGardenId, 'params')], gardenController.getGardenPlants);

// POST /api/gardens/:gardenId/data - Registrar datos del huerto (agua, siembra, cosecha, etc.)
router.post('/:gardenId/data', [authenticateJWT, authorizeRoles(['administrador', 'tecnico', 'residente']), verifyGardenAccess, zodValidate(paramsGardenId, 'params'), zodValidate(gardenDataSchema)], gardenController.recordGardenData);

// POST /api/gardens/:gardenId/assign - Asignar residente a jardín (Admin)
router.post('/:gardenId/assign', [authenticateJWT, authorizeRoles(['administrador']), zodValidate(paramsGardenId, 'params'), zodValidate(assignSchema)], gardenController.assignResident);

// GET /api/gardens/:gardenId/residents - Obtener residentes de un huerto (Admin)
router.get('/:gardenId/residents', [authenticateJWT, authorizeRoles(['administrador']), zodValidate(paramsGardenId, 'params')], gardenController.getGardenResidents);

// GET /api/gardens/:gardenId/residents/:userId/check - Verificar si un usuario está asignado a un huerto
router.get('/:gardenId/residents/:userId/check', [authenticateJWT, zodValidate(paramsGardenIdAndUserId, 'params')], gardenController.checkUserGardenAssignment);

// DELETE /api/gardens/:gardenId/residents/:userId - Eliminar residente de un huerto (Admin)
router.delete('/:gardenId/residents/:userId', [authenticateJWT, authorizeRoles(['administrador']), zodValidate(paramsGardenIdAndUserId, 'params')], gardenController.removeResident);

// DELETE /api/gardens/:gardenId/unsubscribe - Darse de baja de un huerto (Residente)
router.delete('/:gardenId/unsubscribe', [authenticateJWT, authorizeRoles(['residente']), zodValidate(paramsGardenId, 'params')], gardenController.unsubscribeFromGarden);

export default router;