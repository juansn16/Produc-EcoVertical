import { z } from 'zod';

export const paramsPlantId = z.object({ plantId: z.string().uuid('ID de planta no válido') });
export const paramsGardenId = z.object({ gardenId: z.string().uuid('ID de huerto no válido') });

export const growthStageEnum = z.enum(['semilla', 'germinacion', 'crecimiento', 'madurez', 'cosecha'], { errorMap: () => ({ message: 'Etapa de crecimiento no válida' }) });

export const createPlantSchema = z.object({
  name: z.string().min(1, 'Nombre de la planta es requerido'),
  species: z.string().min(1, 'Especie es requerida'),
  plantingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha de plantación debe ser YYYY-MM-DD'),
  expectedHarvestDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha esperada de cosecha debe ser YYYY-MM-DD'),
  growthStage: growthStageEnum,
  gardenId: z.string().uuid('ID de huerto no válido')
});

export const updatePlantSchema = createPlantSchema.partial();

export const wateringSchema = z.object({ waterAmount: z.coerce.number().min(0, 'Cantidad de agua debe ser un número positivo'), notes: z.string().optional() });

export const harvestSchema = z.object({
  harvestDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha de cosecha debe ser YYYY-MM-DD'),
  amount: z.coerce.number().min(0, 'Cantidad cosechada debe ser un número positivo'),
  quality: z.enum(['excelente', 'buena', 'regular', 'mala']).optional()
});

