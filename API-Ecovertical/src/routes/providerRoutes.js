import express from 'express';
import * as providerController from '../controllers/providerController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/roleMiddleware.js';
import { zodValidate } from '../middleware/validationMiddleware.js';
import { paramsId, createProviderSchema, updateProviderSchema, serviceTypeParamsSchema } from '../validators/providerValidators.js';

const router = express.Router();

// GET /api/providers - Listar proveedores (Todos los roles)
router.get('/', [authenticateJWT, requirePermission('view_providers')], providerController.getAllProviders);

// GET /api/providers/category/:categoryId - Obtener proveedores por categoría
router.get('/category/:categoryId', [
  authenticateJWT, 
  requirePermission('view_providers')
], providerController.getProvidersByCategory);

// POST /api/providers - Crear proveedor (Técnico/Admin)
router.post('/', [
  authenticateJWT, 
  requirePermission('create_providers'), 
  zodValidate(createProviderSchema)
], providerController.createProvider);

// GET /api/providers/:id - Obtener detalles de proveedor
router.get('/:id', [authenticateJWT, requirePermission('view_providers'), zodValidate(paramsId, 'params')], providerController.getProviderById);

// PUT /api/providers/:id - Actualizar proveedor (Técnico/Admin)
router.put('/:id', [authenticateJWT, requirePermission('edit_providers'), zodValidate(paramsId, 'params'), zodValidate(updateProviderSchema)], providerController.updateProvider);

// DELETE /api/providers/:id - Eliminar proveedor (Técnico/Admin)
router.delete('/:id', [authenticateJWT, requirePermission('delete_providers'), zodValidate(paramsId, 'params')], providerController.deleteProvider);

// GET /api/providers/by-service/:type - Buscar proveedores por tipo de servicio
router.get('/by-service/:type', [
  authenticateJWT,
  requirePermission('view_providers'),
  zodValidate(serviceTypeParamsSchema, 'params')
], providerController.searchProviders);

export default router;