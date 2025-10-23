import { z } from 'zod';

export const paramsLocationId = z.object({ 
  locationId: z.string().uuid('ID de ubicación no válido') 
});

export const createLocationSchema = z.object({
  nombre: z.string().min(1, 'Nombre es requerido').max(100, 'Nombre no puede exceder 100 caracteres'),
  calle: z.string().min(1, 'Calle es requerida').max(200, 'Calle no puede exceder 200 caracteres'),
  ciudad: z.string().min(1, 'Ciudad es requerida').max(100, 'Ciudad no puede exceder 100 caracteres'),
  estado: z.string().max(100, 'Estado no puede exceder 100 caracteres').optional(),
  pais: z.string().max(100, 'País no puede exceder 100 caracteres').optional(),
  latitud: z.coerce.number().min(-90, 'Latitud debe estar entre -90 y 90').max(90, 'Latitud debe estar entre -90 y 90').optional(),
  longitud: z.coerce.number().min(-180, 'Longitud debe estar entre -180 y 180').max(180, 'Longitud debe estar entre -180 y 180').optional(),
  descripcion: z.string().max(500, 'Descripción no puede exceder 500 caracteres').optional()
});

export const updateLocationSchema = z.object({
  nombre: z.string().min(1, 'Nombre es requerido').max(100, 'Nombre no puede exceder 100 caracteres').optional(),
  calle: z.string().min(1, 'Calle es requerida').max(200, 'Calle no puede exceder 200 caracteres').optional(),
  ciudad: z.string().min(1, 'Ciudad es requerida').max(100, 'Ciudad no puede exceder 100 caracteres').optional(),
  estado: z.string().max(100, 'Estado no puede exceder 100 caracteres').optional(),
  pais: z.string().max(100, 'País no puede exceder 100 caracteres').optional(),
  latitud: z.coerce.number().min(-90, 'Latitud debe estar entre -90 y 90').max(90, 'Latitud debe estar entre -90 y 90').optional(),
  longitud: z.coerce.number().min(-180, 'Longitud debe estar entre -180 y 180').max(180, 'Longitud debe estar entre -180 y 180').optional(),
  descripcion: z.string().max(500, 'Descripción no puede exceder 500 caracteres').optional()
});
