import express from 'express';
import * as statisticsController from '../controllers/statisticsController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware.js';
import { zodValidate } from '../middleware/validationMiddleware.js';
import { gardenParamsSchema, growthParamsSchema } from '../validators/statisticsValidators.js';

const router = express.Router();

// GET /api/statistics/gardens/:gardenId
router.get('/gardens/:gardenId', [
  authenticateJWT, 
  authorizeRoles(['administrador', 'tecnico', 'residente']), 
  zodValidate(gardenParamsSchema, 'params')
], statisticsController.getGardenStatistics);

// GET /api/statistics/user
router.get('/user', [
  authenticateJWT, 
  authorizeRoles(['administrador', 'tecnico', 'residente'])
], statisticsController.getUserStatistics);

// GET /api/statistics/system
router.get('/system', [
  authenticateJWT, 
  authorizeRoles(['administrador', 'tecnico'])
], statisticsController.getSystemStatistics);

// GET /api/statistics/growth/:gardenId/:plantId
router.get('/growth/:gardenId/:plantId', [
  authenticateJWT, 
  authorizeRoles(['administrador', 'tecnico', 'residente']), 
  zodValidate(growthParamsSchema, 'params')
], statisticsController.getGrowthStatistics);

// GET /api/statistics/harvest/:gardenId
router.get('/harvest/:gardenId', [
  authenticateJWT, 
  authorizeRoles(['administrador', 'tecnico', 'residente']), 
  zodValidate(gardenParamsSchema, 'params')
], statisticsController.getHarvestStatistics);

// GET /api/statistics/watering/:gardenId
router.get('/watering/:gardenId', [
  authenticateJWT, 
  authorizeRoles(['administrador', 'tecnico', 'residente']), 
  zodValidate(gardenParamsSchema, 'params')
], statisticsController.getWateringStatistics);

// GET /api/statistics/fertilizer/:gardenId - Datos de abono con cambio de tierra y nombre de siembra
router.get('/fertilizer/:gardenId', [
  authenticateJWT, 
  authorizeRoles(['administrador', 'tecnico', 'residente']), 
  zodValidate(gardenParamsSchema, 'params')
], statisticsController.getFertilizerStatistics);

// GET /api/statistics/pests/:gardenId - Datos de plagas con nombre de siembra
router.get('/pests/:gardenId', [
  authenticateJWT, 
  authorizeRoles(['administrador', 'tecnico', 'residente']), 
  zodValidate(gardenParamsSchema, 'params')
], statisticsController.getPestStatistics);

// GET /api/statistics/water/:gardenId - Datos de agua con nombre de siembra
router.get('/water/:gardenId', [
  authenticateJWT, 
  authorizeRoles(['administrador', 'tecnico', 'residente']), 
  zodValidate(gardenParamsSchema, 'params')
], statisticsController.getWaterStatistics);

// --- NUEVOS ENDPOINTS PARA ANÁLISIS INDIVIDUALES CON GEMINI ---

// POST /api/statistics/water/:gardenId/analyze - Análisis específico de agua con Gemini
router.post('/water/:gardenId/analyze', [
  authenticateJWT, 
  authorizeRoles(['administrador', 'tecnico', 'residente']), 
  zodValidate(gardenParamsSchema, 'params')
], statisticsController.analyzeWaterStatistics);

// POST /api/statistics/fertilizer/:gardenId/analyze - Análisis específico de abono con Gemini
router.post('/fertilizer/:gardenId/analyze', [
  authenticateJWT, 
  authorizeRoles(['administrador', 'tecnico', 'residente']), 
  zodValidate(gardenParamsSchema, 'params')
], statisticsController.analyzeFertilizerStatistics);

// POST /api/statistics/pests/:gardenId/analyze - Análisis específico de plagas con Gemini
router.post('/pests/:gardenId/analyze', [
  authenticateJWT, 
  authorizeRoles(['administrador', 'tecnico', 'residente']), 
  zodValidate(gardenParamsSchema, 'params')
], statisticsController.analyzePestStatistics);

// POST /api/statistics/planting/:gardenId/analyze - Análisis específico de siembra/cosecha con Gemini
router.post('/planting/:gardenId/analyze', [
  authenticateJWT, 
  authorizeRoles(['administrador', 'tecnico', 'residente']), 
  zodValidate(gardenParamsSchema, 'params')
], statisticsController.analyzePlantingStatistics);

export default router;
