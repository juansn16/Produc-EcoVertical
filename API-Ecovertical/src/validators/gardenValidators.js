import { z } from 'zod';

export const paramsGardenId = z.object({ gardenId: z.string().uuid('ID de jardín no válido') });

export const paramsGardenIdAndUserId = z.object({ 
  gardenId: z.string().uuid('ID de jardín no válido'),
  userId: z.string().uuid('ID de usuario no válido')
});

export const createGardenSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').max(100, 'Nombre no puede exceder 100 caracteres'),
  location: z.string().uuid('ID de ubicación no válido'),
  type: z.enum(['privado', 'publico'], { errorMap: () => ({ message: 'Tipo debe ser privado o publico' }) }),
  dimensions: z.string().min(1, 'Dimensiones son requeridas').max(50, 'Dimensiones no pueden exceder 50 caracteres'),
  plantCapacity: z.coerce.number().int().min(1, 'Capacidad debe ser al menos 1').max(100, 'Capacidad no puede exceder 100'),
  description: z.string().max(1000, 'Descripción no puede exceder 1000 caracteres').optional()
});

export const queryListSchema = z.object({
  type: z.enum(['privado', 'publico']).optional(),
  status: z.enum(['active', 'maintenance', 'inactive']).optional()
});

export const updateGardenSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').max(100, 'Nombre no puede exceder 100 caracteres').optional(),
  location: z.string().uuid('ID de ubicación no válido').optional(),
  type: z.enum(['privado', 'publico'], { errorMap: () => ({ message: 'Tipo debe ser privado o publico' }) }).optional(),
  dimensions: z.string().min(1, 'Dimensiones son requeridas').max(50, 'Dimensiones no pueden exceder 50 caracteres').optional(),
  plantCapacity: z.coerce.number().int().min(1, 'Capacidad debe ser al menos 1').max(100, 'Capacidad no puede exceder 100').optional(),
  description: z.string().max(1000, 'Descripción no puede exceder 1000 caracteres').optional(),
  imageUrl: z.string().url('URL de imagen no válida').optional()
});

export const maintenanceSchema = z.object({
  type: z.enum(['riego', 'poda', 'fertilizacion', 'limpieza', 'reparacion', 'control_plagas', 'cosecha']),
  description: z.string().min(1, 'Descripción es requerida').max(500, 'Descripción no puede exceder 500 caracteres'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe ser YYYY-MM-DD'),
  duration: z.coerce.number().int().min(1, 'Duración debe ser al menos 1 minuto').max(1440, 'Duración no puede exceder 24 horas'),
  technicianNotes: z.string().max(1000, 'Notas no pueden exceder 1000 caracteres').optional()
});

export const maintenanceHistoryQuerySchema = z.object({ 
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe ser YYYY-MM-DD').optional(), 
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe ser YYYY-MM-DD').optional() 
});

export const assignSchema = z.object({ 
  userId: z.string().uuid('ID de usuario no válido') 
});

// Validación para datos de huerto (plantas, agua, etc.)
export const gardenDataSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe ser YYYY-MM-DD'),
  cantidad_agua: z.coerce.number().min(0, 'Cantidad de agua no puede ser negativa').optional(),
  cantidad_siembra: z.coerce.number().int().min(0, 'Cantidad de siembra no puede ser negativa').optional(),
  cantidad_cosecha: z.coerce.number().int().min(0, 'Cantidad de cosecha no puede ser negativa').optional(),
  fecha_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe ser YYYY-MM-DD').optional(),
  fecha_final: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe ser YYYY-MM-DD').optional(),
  cantidad_abono: z.coerce.number().min(0, 'Cantidad de abono no puede ser negativa').optional(),
  cantidad_plagas: z.coerce.number().min(0, 'Cantidad de plagas no puede ser negativa').optional()
});

