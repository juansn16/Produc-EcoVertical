import db from '../config/db.js';

export const isAdmin = (req, res, next) => {
	if (req.user?.role !== 'administrador') {
		return res.status(403).json({ message: 'Requiere rol administrador' });
	}
	return next();
};

export const isTechnician = (req, res, next) => {
	const userRole = req.user?.role;
	if (userRole !== 'tecnico' && userRole !== 'administrador') {
		return res.status(403).json({ message: 'Requiere rol técnico o administrador' });
	}
	return next();
};

export const isResident = (req, res, next) => {
	const userRole = req.user?.role;
	if (!['residente', 'tecnico', 'administrador'].includes(userRole)) {
		return res.status(403).json({ message: 'Requiere rol residente, técnico o administrador' });
	}
	return next();
};

// Middleware para verificar permisos específicos
export const requirePermission = (permission) => {
	return (req, res, next) => {
		const userRole = req.user?.role;
		
		const permissions = {
			// Residente - Puede ver, usar y crear inventario
			'view_public_info': ['residente', 'tecnico', 'administrador'],
			'add_comments': ['residente', 'tecnico', 'administrador'],
			'edit_comments': ['residente', 'tecnico', 'administrador'],
			'delete_comments': ['residente', 'tecnico', 'administrador'],
			'view_inventory': ['residente', 'tecnico', 'administrador'],
			'update_stock': ['residente', 'tecnico', 'administrador'],
			'record_usage': ['residente', 'tecnico', 'administrador'],
			'view_providers': ['residente', 'tecnico', 'administrador'],
			'download_reports': ['residente', 'tecnico', 'administrador'],
			'create_inventory': ['residente', 'tecnico', 'administrador'],
			
			// Técnico - Puede hacer todo excepto gestión de roles
			'edit_inventory': ['residente', 'tecnico', 'administrador'], // Los residentes pueden editar sus propios ítems
			'delete_inventory': ['residente', 'tecnico', 'administrador'], // Los residentes pueden eliminar sus propios ítems
			'manage_inventory': ['tecnico', 'administrador'],
			'create_providers': ['tecnico', 'administrador'],
			'edit_providers': ['tecnico', 'administrador'],
			'delete_providers': ['tecnico', 'administrador'],
			'view_statistics': ['tecnico', 'administrador'],
			'create_alerts': ['tecnico', 'administrador'],
			'manage_gardens': ['tecnico', 'administrador'],
			'manage_irrigation_alerts': ['tecnico', 'administrador'],
			
			// Administrador - Acceso completo
			'manage_users': ['administrador'],
			'assign_technician_role': ['administrador'],
			'remove_technician_role': ['administrador'],
			'system_config': ['administrador'],
			'financial_reports': ['administrador'],
			'all_permissions': ['administrador']
		};
		
		const allowedRoles = permissions[permission];
		if (!allowedRoles || !allowedRoles.includes(userRole)) {
			return res.status(403).json({ 
				message: `No tienes permisos para ${permission}`,
				requiredPermission: permission,
				userRole: userRole
			});
		}
		
		return next();
	};
};

// Middleware para verificar que el administrador puede gestionar usuarios de su mismo condominio
export const canManageCondominiumUsers = async (req, res, next) => {
	try {
		const adminId = req.user.id;
		const targetUserId = req.params.id;

		// Obtener la ubicación del administrador
		const adminLocation = await db.query(
			"SELECT ubicacion_id FROM usuarios WHERE id = $1 AND is_deleted = false",
			[adminId]
		);

		if (!adminLocation.rows.length) {
			return res.status(404).json({ message: 'Administrador no encontrado' });
		}

		const adminLocationId = adminLocation.rows[0].ubicacion_id;

		// Obtener la ubicación del usuario objetivo
		const targetUserLocation = await db.query(
			"SELECT ubicacion_id, nombre, rol FROM usuarios WHERE id = $1 AND is_deleted = false",
			[targetUserId]
		);

		if (!targetUserLocation.rows.length) {
			return res.status(404).json({ message: 'Usuario objetivo no encontrado' });
		}

		const targetUser = targetUserLocation.rows[0];

		// Verificar que ambos usuarios pertenecen al mismo condominio
		if (adminLocationId !== targetUser.ubicacion_id) {
			return res.status(403).json({ 
				message: 'No puedes gestionar usuarios de otros condominios' 
			});
		}

		// Agregar información del usuario objetivo a la request
		req.targetUser = targetUser;
		req.adminLocationId = adminLocationId;

		next();
	} catch (error) {
		console.error('Error en canManageCondominiumUsers:', error);
		res.status(500).json({ message: 'Error interno del servidor' });
	}
};
