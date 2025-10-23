import express from 'express';
import * as plantController from '../controllers/plantController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware.js';
import { zodValidate } from '../middleware/validationMiddleware.js';
import { paramsPlantId, paramsGardenId, createPlantSchema, updatePlantSchema, wateringSchema, harvestSchema } from '../validators/plantValidators.js';

const router = express.Router();

// POST /api/plants - Registrar nueva planta (Admin/Técnico/Residente)
router.post('/', [authenticateJWT, authorizeRoles(['administrador', 'tecnico', 'residente']), zodValidate(createPlantSchema)], plantController.registerPlant);

// GET /api/plants/garden/:gardenId - Listar plantas de un huerto
router.get('/garden/:gardenId', [authenticateJWT, authorizeRoles(['administrador', 'tecnico', 'residente']), zodValidate(paramsGardenId, 'params')], plantController.getPlantsByGarden);

// GET /api/plants/:plantId - Obtener detalles de planta
router.get('/:plantId', [authenticateJWT, authorizeRoles(['administrador', 'tecnico', 'residente']), zodValidate(paramsPlantId, 'params')], plantController.getPlantDetails);

// PUT /api/plants/:plantId - Actualizar información de planta
router.put('/:plantId', [authenticateJWT, authorizeRoles(['administrador', 'tecnico', 'residente']), zodValidate(paramsPlantId, 'params'), zodValidate(updatePlantSchema)], plantController.updatePlant);

// DELETE /api/plants/:plantId - Eliminar planta (Admin/Técnico)
router.delete('/:plantId', [authenticateJWT, authorizeRoles(['administrador', 'tecnico']), zodValidate(paramsPlantId, 'params')], plantController.deletePlant);

// POST /api/plants/:plantId/watering - Registrar riego
router.post('/:plantId/watering', [
  authenticateJWT,
  authorizeRoles(['administrador', 'tecnico', 'residente']),
  zodValidate(paramsPlantId, 'params'),
  zodValidate(wateringSchema)
], plantController.recordWatering);

// GET /api/plants/:plantId/watering-history - Obtener historial de riego
router.get('/:plantId/watering-history', [authenticateJWT, authorizeRoles(['administrador', 'tecnico', 'residente']), zodValidate(paramsPlantId, 'params')], plantController.getWateringHistory);

// POST /api/plants/:plantId/harvest - Registrar cosecha
router.post('/:plantId/harvest', [
  authenticateJWT,
  authorizeRoles(['administrador', 'tecnico', 'residente']),
  zodValidate(paramsPlantId, 'params'),
  zodValidate(harvestSchema)
], plantController.recordHarvest);

export default router;