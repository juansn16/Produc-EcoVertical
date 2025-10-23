import express from 'express';
import * as reportController from '../controllers/reportController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware.js';
import { zodValidate } from '../middleware/validationMiddleware.js';
import { generateSchema, idParams } from '../validators/reportValidators.js';

const router = express.Router();

// POST /api/reports/generate - Generación async de PDF (HU-0007)
router.post('/generate', [authenticateJWT, authorizeRoles(['administrador', 'tecnico']), zodValidate(generateSchema)], reportController.generateReport);

// POST /api/reports/test-analyze - Test de comunicación
router.post('/test-analyze', [authenticateJWT, authorizeRoles(['administrador', 'tecnico'])], reportController.testAnalyze);

// POST /api/reports/analyze - Análisis IA (Gemini) para PDFs
router.post('/analyze', [authenticateJWT, authorizeRoles(['administrador', 'tecnico'])], reportController.analyzeReport);

// GET /api/reports/{id} - Descarga con control de acceso
router.get('/:id', [authenticateJWT, authorizeRoles(['administrador', 'tecnico', 'residente']), zodValidate(idParams, 'params')], reportController.downloadReport);

// GET /api/reports - Listado de reportes generados
router.get('/', [authenticateJWT, authorizeRoles(['administrador', 'tecnico'])], reportController.listReports);

// DELETE /api/reports/{id} - Eliminar reporte (solo admin)
router.delete('/:id', [authenticateJWT, authorizeRoles(['administrador']), zodValidate(idParams, 'params')], reportController.deleteReport);

export default router;