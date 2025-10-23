import express from 'express';
import { getAllCategories, getCategoryById } from '../controllers/categoryController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateJWT);

// Rutas de categorías
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

export default router;