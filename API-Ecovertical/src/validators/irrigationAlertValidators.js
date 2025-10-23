import { z } from 'zod';

// Validación para crear una alerta de riego
export const createIrrigationAlertSchema = z.object({
  huerto_id: z.string().uuid('ID de huerto no válido'),
  descripcion: z.string().min(1, 'La descripción es requerida').max(500, 'La descripción no puede exceder 500 caracteres'),
  fecha_alerta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  hora_alerta: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)')
});

// Validación para actualizar el estado de una alerta
export const updateAlertStatusSchema = z.object({
  estado: z.enum(['activa', 'completada', 'cancelada'], {
    errorMap: () => ({ message: 'Estado debe ser: activa, completada o cancelada' })
  })
});

// Validación para parámetros de consulta
export const alertQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  estado: z.enum(['activa', 'completada', 'cancelada']).optional().default('activa')
});

// Validación para parámetros de notificaciones
export const notificationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  unread_only: z.enum(['true', 'false']).optional().default('false')
});

// Validación para ID de alerta
export const alertIdSchema = z.object({
  id: z.string().uuid('ID de alerta no válido')
});

// Validación para ID de notificación
export const notificationIdSchema = z.object({
  id: z.string().uuid('ID de notificación no válido')
});
