import { z } from 'zod';

export const paramsAlertId = z.object({ alertId: z.string().uuid('ID de alerta no válido') });
export const paramsGardenId = z.object({ gardenId: z.string().uuid('ID de jardín no válido') });

export const createAlertSchema = z.object({
  titulo: z.string().trim().min(1, 'Título requerido').max(150, 'Título muy largo'),
  descripcion: z.string().trim().min(1, 'Descripción requerida').max(1000, 'Descripción muy larga'),
  tipo: z.enum(['riego', 'cosecha', 'mantenimiento', 'plaga', 'general']),
  prioridad: z.enum(['baja', 'media', 'alta', 'urgente']).optional().default('media'),
  huerto_id: z.string().uuid('ID de huerto no válido'),
  fecha_programada: z.string().datetime('Formato de fecha inválido').optional(),
  fecha_vencimiento: z.string().datetime('Formato de fecha inválido').nullable().optional(),
  hora_programada: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)').nullable().optional(),
  duracion_minutos: z.number().int().min(1, 'Duración debe ser al menos 1 minuto').max(1440, 'Duración no puede exceder 24 horas').nullable().optional(),
  notificar_antes_minutos: z.number().int().min(0, 'Notificación no puede ser negativa').max(10080, 'Notificación no puede exceder 7 días').nullable().optional(),
  notas: z.string().nullable().optional(),
  esta_activa: z.number().int().min(0).max(1).optional().default(1)
});

export const updateAlertSchema = createAlertSchema.partial();

export const upcomingQuerySchema = z.object({ daysAhead: z.coerce.number().int().min(1).max(30).optional() });

export const gardenAlertsQuerySchema = z.object({ status: z.enum(['pendiente', 'completada', 'cancelada']).optional() });

export const updateAlertStatusSchema = z.object({ 
  status: z.enum(['pendiente', 'completada', 'cancelada']), 
  completionNotes: z.string().optional() 
});

