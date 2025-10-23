import express from 'express';
import * as inventoryController from '../controllers/inventoryController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/roleMiddleware.js';
import { zodValidate } from '../middleware/validationMiddleware.js';
import { paramsId, paramsInventoryId, createItemSchema, updateItemSchema, queryListSchema, usageSchema } from '../validators/inventoryValidators.js';

const router = express.Router();

// GET /api/inventory - Listar ítems de inventario con filtros (HU-0009)
router.get('/', [
  authenticateJWT, 
  authorizeRoles(['administrador', 'tecnico', 'residente']), 
  zodValidate(queryListSchema, 'query')
], inventoryController.getInventoryItems);

// GET /api/inventory/low-stock - Obtener ítems con bajo stock (HU-0014)
router.get('/low-stock', [
  authenticateJWT, 
  authorizeRoles(['administrador', 'tecnico', 'residente'])
], inventoryController.getLowStockItems);

// GET /api/inventory/users - Obtener todos los usuarios para asignar permisos
router.get('/users', [
  authenticateJWT,
  authorizeRoles(['administrador', 'tecnico', 'residente'])
], inventoryController.getAllUsers);

// POST /api/inventory - Agregar ítem al inventario (Técnico/Admin) (HU-0010)
router.post('/', [
  authenticateJWT, 
  requirePermission('create_inventory'), 
  zodValidate(createItemSchema)
], inventoryController.addInventoryItem);

// GET /api/inventory/:id - Obtener detalles de ítem
router.get('/:id', [
  authenticateJWT, 
  requirePermission('view_inventory'), 
  zodValidate(paramsId, 'params')
], inventoryController.getItemDetails);

// PUT /api/inventory/:id - Actualizar ítem (Técnico/Admin)
router.put('/:id', [
  authenticateJWT, 
  requirePermission('edit_inventory'), 
  zodValidate(paramsId, 'params'), 
  zodValidate(updateItemSchema)
], inventoryController.updateInventoryItem);

// PATCH /api/inventory/:id/stock - Actualizar stock de ítem (Todos los roles)
router.patch('/:id/stock', [
  authenticateJWT, 
  requirePermission('update_stock'), 
  zodValidate(paramsId, 'params')
], inventoryController.updateItemStock);

// DELETE /api/inventory/:id - Eliminar ítem (Técnico/Admin)
router.delete('/:id', [
  authenticateJWT, 
  requirePermission('delete_inventory'), 
  zodValidate(paramsId, 'params')
], inventoryController.deleteInventoryItem);

// POST /api/inventory/:id/usage - Registrar uso de ítem (Todos los roles)
router.post('/:id/usage', [
  authenticateJWT,
  requirePermission('record_usage'),
  zodValidate(paramsId, 'params'),
  zodValidate(usageSchema)
], inventoryController.recordItemUsage);

// GET /api/inventory/:id/history - Obtener historial de ítem
router.get('/:id/history', [
  authenticateJWT, 
  authorizeRoles(['administrador', 'tecnico', 'residente']), 
  zodValidate(paramsId, 'params')
], inventoryController.getItemHistory);

// GET /api/inventory/:inventoryId/permissions/check - Verificar permiso de usuario
router.get('/:inventoryId/permissions/check', [
  authenticateJWT,
  zodValidate(paramsInventoryId, 'params')
], inventoryController.checkInventoryPermission);

// GET /api/inventory/:inventoryId/permissions - Obtener permisos de un item
router.get('/:inventoryId/permissions', [
  authenticateJWT,
  zodValidate(paramsInventoryId, 'params')
], inventoryController.getInventoryPermissions);

// POST /api/inventory/:inventoryId/permissions - Asignar permiso a usuario
router.post('/:inventoryId/permissions', [
  authenticateJWT,
  zodValidate(paramsInventoryId, 'params')
], inventoryController.assignInventoryPermission);

// DELETE /api/inventory/:inventoryId/permissions/:userId/:permissionType - Revocar permiso
router.delete('/:inventoryId/permissions/:userId/:permissionType', [
  authenticateJWT,
  zodValidate(paramsInventoryId, 'params')
], inventoryController.revokeInventoryPermission);

// ==================== RUTAS PARA COMENTARIOS DE INVENTARIO ====================

// GET /api/inventory/:inventoryId/comments - Obtener comentarios de un item
router.get('/:inventoryId/comments', [
  authenticateJWT,
  authorizeRoles(['administrador', 'tecnico', 'residente'])
], inventoryController.getInventoryComments);

// GET /api/inventory/user/comments - Obtener todos los comentarios de inventario del usuario
router.get('/user/comments', [
  authenticateJWT,
  authorizeRoles(['administrador', 'tecnico', 'residente'])
], inventoryController.getUserInventoryComments);

// GET /api/inventory/comments/all - Obtener TODOS los comentarios de inventario (admin/tecnico/residente)
router.get('/comments/all', [
  authenticateJWT,
  authorizeRoles(['administrador', 'tecnico', 'residente'])
], inventoryController.getAllInventoryComments);

// POST /api/inventory/comments - Crear comentario de inventario
router.post('/comments', [
  authenticateJWT,
  authorizeRoles(['administrador', 'tecnico', 'residente'])
], inventoryController.createInventoryComment);

// GET /api/inventory/comments/:commentId/permissions/check - Verificar permiso de comentario
router.get('/comments/:commentId/permissions/check', [
  authenticateJWT
], inventoryController.checkCommentPermission);

// GET /api/inventory/comments/:commentId/permissions - Obtener permisos de un comentario
router.get('/comments/:commentId/permissions', [
  authenticateJWT
], inventoryController.getCommentPermissions);

// POST /api/inventory/comments/:commentId/permissions - Asignar permiso a comentario
router.post('/comments/:commentId/permissions', [
  authenticateJWT
], inventoryController.assignCommentPermission);

// DELETE /api/inventory/comments/:commentId/permissions/:userId/:permissionType - Revocar permiso de comentario
router.delete('/comments/:commentId/permissions/:userId/:permissionType', [
  authenticateJWT
], inventoryController.revokeCommentPermission);

// ==================== NUEVAS RUTAS DE PERMISOS ====================

// POST /api/inventory/comments/:commentId/assign-permission - Asignar permiso específico a usuario
router.post('/comments/:commentId/assign-permission', [
  authenticateJWT
], inventoryController.assignCommentPermissionToUser);

// GET /api/inventory/comments/:commentId/permissions - Obtener permisos de un comentario específico
router.get('/comments/:commentId/permissions', [
  authenticateJWT
], inventoryController.getCommentPermissions);

// DELETE /api/inventory/comments/:commentId/revoke-permission/:userId/:permissionType - Revocar permiso específico
router.delete('/comments/:commentId/revoke-permission/:userId/:permissionType', [
  authenticateJWT
], inventoryController.revokeCommentPermissionFromUser);

// GET /api/inventory/comments/:commentId/check-permission - Verificar si usuario puede editar/eliminar comentario
router.get('/comments/:commentId/check-permission', [
  authenticateJWT
], inventoryController.checkCommentEditPermission);

export default router;