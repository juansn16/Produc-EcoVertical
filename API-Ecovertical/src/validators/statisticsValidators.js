import { z } from 'zod';

export const gardenParamsSchema = z.object({ 
  gardenId: z.union([
    z.string().uuid('ID de jardín no válido'),
    z.string().regex(/^\d+$/, 'ID de jardín debe ser un UUID válido o un número')
  ])
});
export const growthParamsSchema = z.object({ gardenId: z.string().uuid(), plantId: z.string().uuid() });

