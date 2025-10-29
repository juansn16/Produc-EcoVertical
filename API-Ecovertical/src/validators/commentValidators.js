import { z } from 'zod';

// Validación para crear comentario
export const createCommentSchema = z.object({
  // huerto_id viene de los parámetros de la ruta, no del body
  contenido: z.string().min(1, 'El contenido es requerido').max(1000, 'El contenido no puede exceder 1000 caracteres'),
  tipo_comentario: z.enum(['riego', 'siembra', 'cosecha', 'abono', 'plagas', 'general', 'mantenimiento']).optional(),
  // Datos estadísticos opcionales
  cantidad_agua: z.coerce.number().min(0, 'La cantidad de agua no puede ser negativa').optional(),
  unidad_agua: z.enum(['ml', 'l']).optional(),
  cantidad_siembra: z.coerce.number().int().min(0, 'La cantidad de siembra no puede ser negativa').optional(),
  cantidad_cosecha: z.coerce.number().int().min(0, 'La cantidad de cosecha no puede ser negativa').optional(),
  cantidad_abono: z.coerce.number().min(0, 'La cantidad de abono no puede ser negativa').optional(),
  unidad_abono: z.enum(['kg', 'g']).optional(),
  cantidad_plagas: z.coerce.number().min(0, 'La cantidad de plagas no puede ser negativa').optional(),
  cantidad_mantenimiento: z.coerce.number().min(0, 'La cantidad de mantenimiento no puede ser negativa').optional(),
  unidad_mantenimiento: z.enum(['minutos', 'horas']).optional(),
  fecha_actividad: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe ser YYYY-MM-DD').optional(),
  // Nuevo formato de plagas
  plaga_especie: z.string().optional(),
  plaga_nivel: z.enum(['pocos', 'medio', 'muchos']).optional(),
  // Relación siembra-cosecha
  siembra_relacionada: z.string().uuid('ID de siembra relacionada no válido').optional(),
  // Nuevos campos
  cambio_tierra: z.enum(['si', 'por_encima']).optional(),
  huerto_siembra_id: z.string().uuid('ID de huerto siembra no válido').optional(),
  nombre_siembra: z.string().max(255, 'El nombre de siembra no puede exceder 255 caracteres').optional()
});

// Validación para actualizar comentario
export const updateCommentSchema = z.object({
  contenido: z.string().min(1, 'El contenido es requerido').max(1000, 'El contenido no puede exceder 1000 caracteres'),
  tipo_comentario: z.enum(['riego', 'siembra', 'cosecha', 'abono', 'plagas', 'general', 'mantenimiento']).optional(),
  // Datos estadísticos opcionales
  cantidad_agua: z.coerce.number().min(0, 'La cantidad de agua no puede ser negativa').optional(),
  unidad_agua: z.enum(['ml', 'l']).optional(),
  cantidad_siembra: z.coerce.number().int().min(0, 'La cantidad de siembra no puede ser negativa').optional(),
  cantidad_cosecha: z.coerce.number().int().min(0, 'La cantidad de cosecha no puede ser negativa').optional(),
  cantidad_abono: z.coerce.number().min(0, 'La cantidad de abono no puede ser negativa').optional(),
  unidad_abono: z.enum(['kg', 'g']).optional(),
  cantidad_plagas: z.coerce.number().min(0, 'La cantidad de plagas no puede ser negativa').optional(),
  cantidad_mantenimiento: z.coerce.number().min(0, 'La cantidad de mantenimiento no puede ser negativa').optional(),
  unidad_mantenimiento: z.enum(['minutos', 'horas']).optional(),
  fecha_actividad: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe ser YYYY-MM-DD').optional(),
  // Nuevo formato de plagas
  plaga_especie: z.string().optional(),
  plaga_nivel: z.enum(['pocos', 'medio', 'muchos']).optional(),
  // Relación siembra-cosecha
  siembra_relacionada: z.string().uuid('ID de siembra relacionada no válido').optional(),
  // Nuevos campos
  cambio_tierra: z.enum(['si', 'por_encima']).optional(),
  huerto_siembra_id: z.string().uuid('ID de huerto siembra no válido').optional(),
  nombre_siembra: z.string().max(255, 'El nombre de siembra no puede exceder 255 caracteres').optional()
});

// Validación para parámetros de comentario
export const commentParamsSchema = z.object({
  commentId: z.string().uuid('ID de comentario no válido')
});

// Validación para parámetros de huerto
export const gardenParamsSchema = z.object({
  huerto_id: z.string().uuid('ID de huerto no válido')
});

// Validación para consultas de comentarios
export const commentQuerySchema = z.object({
  page: z.coerce.number().int().min(1, 'La página debe ser al menos 1').optional(),
  limit: z.coerce.number().int().min(1, 'El límite debe ser al menos 1').max(100, 'El límite no puede exceder 100').optional(),
  tipo_comentario: z.enum(['riego', 'siembra', 'cosecha', 'abono', 'plagas', 'general', 'mantenimiento']).optional()
});

