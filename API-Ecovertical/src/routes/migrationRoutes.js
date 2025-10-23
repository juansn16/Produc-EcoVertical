import express from 'express';
import { addHuertoSiembraIdColumn } from '../controllers/migrationController.js';

const router = express.Router();

// Ruta para ejecutar migración de base de datos
router.post('/add-huerto-siembra-id', addHuertoSiembraIdColumn);

export default router;
