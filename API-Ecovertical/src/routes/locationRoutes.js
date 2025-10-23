import express from 'express';
import * as locationController from '../controllers/locationController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware.js';
import { zodValidate } from '../middleware/validationMiddleware.js';
import { 
  paramsLocationId, 
  createLocationSchema, 
  updateLocationSchema 
} from '../validators/locationValidators.js';

const router = express.Router();

// GET /api/locations - Listar todas las ubicaciones
router.get('/', [authenticateJWT, authorizeRoles(['administrador', 'tecnico', 'residente'])], locationController.listLocations);

// GET /api/locations/:locationId - Obtener ubicación por ID
router.get('/:locationId', [authenticateJWT, authorizeRoles(['administrador', 'tecnico', 'residente']), zodValidate(paramsLocationId, 'params')], locationController.getLocationById);

// POST /api/locations - Crear nueva ubicación
router.post('/', [authenticateJWT, authorizeRoles(['administrador', 'tecnico']), zodValidate(createLocationSchema)], locationController.createLocation);

// PUT /api/locations/:locationId - Actualizar ubicación
router.put('/:locationId', [authenticateJWT, authorizeRoles(['administrador', 'tecnico']), zodValidate(paramsLocationId, 'params'), zodValidate(updateLocationSchema)], locationController.updateLocation);

// DELETE /api/locations/:locationId - Eliminar ubicación
router.delete('/:locationId', [authenticateJWT, authorizeRoles(['administrador']), zodValidate(paramsLocationId, 'params')], locationController.deleteLocation);

// GET /api/locations/city/:ciudad - Buscar ubicaciones por ciudad
router.get('/city/:ciudad', [authenticateJWT, authorizeRoles(['administrador', 'tecnico', 'residente'])], locationController.getLocationsByCity);

export default router;
