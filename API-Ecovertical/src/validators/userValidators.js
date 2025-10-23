import { z } from 'zod';
import { zodValidate } from '../middleware/validationMiddleware.js';

const emailSchema = z.string().email('Correo electrónico no válido');

export const validateUpdateProfile = zodValidate(
	z.object({
		nombre: z.string().min(1, 'El nombre es requerido').optional(),
		email: emailSchema.optional(),
		telefono: z.string().optional().or(z.literal('')),
		imagen_url: z.string().url('URL de imagen no válida').optional().or(z.literal(''))
	})
);

export const validateChangePassword = zodValidate(
	z
		.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8) })
		.refine((d) => d.currentPassword !== d.newPassword, {
			message: 'La nueva contraseña debe ser distinta a la actual',
			path: ['newPassword']
		})
);

export const validateAdminUpdateUser = zodValidate(
	z.object({
		name: z.string().min(1).optional(),
		email: emailSchema.optional(),
		role: z.enum(['admin', 'technician', 'resident']).optional(),
		status: z.enum(['active', 'inactive', 'pending']).optional()
	})
);

// Validador para asignar rol de técnico (no necesita body, solo verifica que el usuario existe)
export const validateAssignTechnicianRole = zodValidate(
	z.any().optional()
);

// Validador para quitar rol de técnico (no necesita body, solo verifica que el usuario existe)
export const validateRemoveTechnicianRole = zodValidate(
	z.any().optional()
);

// Validador para obtener usuarios del condominio (solo query params opcionales)
export const validateGetCondominiumUsers = zodValidate(
	z.object({
		search: z.string().optional()
	}),
	'query'
);

