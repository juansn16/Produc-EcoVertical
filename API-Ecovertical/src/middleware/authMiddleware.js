import db from '../config/db.js';
import { verifyAccessToken } from '../utils/jwt.js';

export const authenticateJWT = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;
		
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.status(401).json({ 
				success: false,
				message: 'Token de acceso requerido' 
			});
		}

		const token = authHeader.substring(7); // Remover 'Bearer '

		try {
			const decoded = verifyAccessToken(token);
			
			// Verificar que el usuario existe y no está eliminado
			const [users] = await db.query(
				"SELECT id, nombre, email, rol FROM usuarios WHERE id = ? AND is_deleted = 0",
				[decoded.id]
			);

			if (users.length === 0) {
				return res.status(401).json({
					success: false,
					message: 'Usuario no encontrado o inactivo'
				});
			}

			const u = users[0];
			req.user = { id: u.id, name: u.nombre, email: u.email, role: u.rol };
			next();
		} catch (jwtError) {
			if (jwtError.name === 'TokenExpiredError') {
				return res.status(401).json({
					success: false,
					message: 'Token expirado'
				});
			}
			return res.status(401).json({
				success: false,
				message: 'Token inválido'
			});
		}
	} catch (error) {
		console.error('Error en authenticateJWT:', error);
		next(error);
	}
};

export const authorizeRoles = (allowedRoles = []) => {
	return (req, res, next) => {
		const userRole = req.user?.role;
		
		if (!userRole || (allowedRoles.length && !allowedRoles.includes(userRole))) {
			return res.status(403).json({ 
				success: false,
				message: 'No tienes permisos para acceder a este recurso',
				userRole,
				allowedRoles
			});
		}
		return next();
	};
};

export const protect = authenticateJWT;
