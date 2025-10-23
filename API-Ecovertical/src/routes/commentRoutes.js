import express from 'express';
import * as commentController from '../controllers/commentController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware.js';
import { zodValidate } from '../middleware/validationMiddleware.js';
import { 
  verifyCommentAccess, 
  requireCommentPermission, 
  verifyCommentOwnership 
} from '../middleware/commentAccessMiddleware.js';
import { 
  createCommentSchema, 
  updateCommentSchema,
  commentQuerySchema 
} from '../validators/commentValidators.js';

const router = express.Router();

// POST /api/comments/garden/:huerto_id - Crear nuevo comentario en un huerto específico
router.post('/garden/:huerto_id', [
  authenticateJWT, 
  verifyCommentAccess,
  requireCommentPermission('create'),
  zodValidate(createCommentSchema)
], commentController.createComment);

// GET /api/comments/garden/:huerto_id - Obtener comentarios de un huerto
router.get('/garden/:huerto_id', [
  authenticateJWT, 
  verifyCommentAccess,
  zodValidate(commentQuerySchema, 'query')
], commentController.getCommentsByGarden);

// PUT /api/comments/:commentId - Actualizar comentario
router.put('/:commentId', [
  authenticateJWT, 
  verifyCommentAccess,
  requireCommentPermission('edit'),
  verifyCommentOwnership,
  zodValidate(updateCommentSchema)
], commentController.updateComment);

// DELETE /api/comments/:commentId - Eliminar comentario
router.delete('/:commentId', [
  authenticateJWT, 
  verifyCommentAccess,
  requireCommentPermission('delete'),
  verifyCommentOwnership
], commentController.deleteComment);

// GET /api/comments/stats/:huerto_id - Obtener estadísticas de comentarios
router.get('/stats/:huerto_id', [
  authenticateJWT, 
  verifyCommentAccess
], commentController.getCommentStats);

// GET /api/comments/inventory/:inventory_id - Obtener comentarios de uso de inventario
router.get('/inventory/:inventory_id', [
  authenticateJWT
], commentController.getInventoryUsageComments);

export default router;