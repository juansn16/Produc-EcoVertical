import express from 'express';
import * as authController from '../controllers/authController.js';
import rateLimit from 'express-rate-limit';
import { zodValidate } from '../middleware/validationMiddleware.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';
// Esquemas: src/validators/authValidators.js
import { registerSchema, loginSchema, refreshSchema, logoutSchema } from '../validators/authValidators.js';

// Configuración de rate limiting para protección contra ataques de fuerza bruta
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // límite de 5 intentos por ventana
  message: 'Demasiados intentos, por favor intente nuevamente más tarde'
});

const router = express.Router();

// Fin esquemas

// POST /api/auth/register - Registro de usuario (HU-0001)
router.post('/register', zodValidate(registerSchema), authController.register);

// POST /api/auth/login - Inicio de sesión (HU-0002)
router.post('/login', authLimiter, zodValidate(loginSchema), authController.login);

// POST /api/auth/refresh - Renovación de token
router.post('/refresh', zodValidate(refreshSchema), authController.refreshToken);

// POST /api/auth/logout - Cerrar sesión (requiere refreshToken para invalidar)
router.post('/logout', zodValidate(logoutSchema), authController.logout);

// GET /api/auth/test-jwt - Endpoint de prueba para verificar JWT
router.get('/test-jwt', authController.testJWT);

// GET /api/auth/test-auth - Endpoint de prueba para verificar autenticación (requiere token)
router.get('/test-auth', authenticateJWT, authController.testAuth);

// GET /api/auth/check-cedula - Verificar si una cédula ya existe
router.get('/check-cedula', authController.checkCedula);

// GET /api/auth/check-email - Verificar si un email ya existe
router.get('/check-email', authController.checkEmail);

// POST /api/auth/validate-invitation-code - Validar código de invitación
router.post('/validate-invitation-code', authController.validateInvitationCode);

// POST /api/auth/test-login - Endpoint de prueba para login sin rate limiting
router.post('/test-login', zodValidate(loginSchema), authController.testLogin);

// POST /api/auth/test-password-reset - Endpoint de prueba para restablecimiento
router.post('/test-password-reset', authController.testPasswordReset);

// ==================== RUTAS DE RESTABLECIMIENTO DE CONTRASEÑA ====================

// POST /api/auth/request-password-reset - Solicitar código de restablecimiento
router.post('/request-password-reset', authController.requestPasswordReset);

// POST /api/auth/verify-reset-code - Verificar código de restablecimiento
router.post('/verify-reset-code', authController.verifyResetCode);

// POST /api/auth/reset-password - Restablecer contraseña
router.post('/reset-password', authController.resetPassword);

export default router;