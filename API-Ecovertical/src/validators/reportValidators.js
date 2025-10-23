import { z } from 'zod';

export const reportTypeEnum = z.enum(['global', 'water', 'fertilizer', 'harvest', 'maintenance'], { errorMap: () => ({ message: 'Tipo de reporte no válido' }) });

export const generateSchema = z.object({
  gardenId: z.string().uuid('ID de huerto no válido'),
  type: reportTypeEnum,
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha debe ser YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha debe ser YYYY-MM-DD')
});

export const idParams = z.object({ id: z.string().uuid('ID de reporte no válido') });

