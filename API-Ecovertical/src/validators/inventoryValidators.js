// inventoryValidators.js - Versión final corregida
import { z } from 'zod';

export const paramsId = z.object({ id: z.string().uuid('ID de ítem no válido') });
export const paramsInventoryId = z.object({ inventoryId: z.string().uuid('ID de inventario no válido') });

export const createItemSchema = z.object({
  nombre: z.string().min(1, 'Nombre es requerido'),
  descripcion: z.string().optional(),
  categoria_id: z.string().uuid('ID de categoría no válido'),
  cantidad_stock: z.coerce.number().int().min(0, 'Cantidad debe ser un número entero positivo'),
  cantidad_minima: z.coerce.number().int().min(0).optional().default(5),
  precio_estimado: z.coerce.number().min(0).optional(),
  ubicacion_almacen: z.string().optional(),
  huerto_id: z.string().uuid('ID de huerto no válido').optional(),
  proveedor_id: z.string().uuid('ID de proveedor no válido').optional(),
  imagen_url: z.string().url('URL de imagen no válida').optional().or(z.literal(''))
});

export const updateItemSchema = createItemSchema.partial();

export const queryListSchema = z.object({
  category: z.string().uuid('ID de categoría no válido').optional(),
  lowStock: z.coerce.boolean().optional(),
  gardenId: z.string().uuid('ID de huerto no válido').optional(),
  providerId: z.string().uuid('ID de proveedor no válido').optional()
});

export const usageSchema = z.object({
  cantidad_usada: z.coerce.number().int().min(1, 'Cantidad usada debe ser al menos 1'),
  huerto_id: z.string().uuid('ID de huerto no válido').optional(),
  notas: z.string().optional()
});