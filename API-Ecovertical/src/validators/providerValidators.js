// providerValidators.js
import { z } from 'zod';

export const paramsId = z.object({ 
  id: z.string().uuid('ID de proveedor no válido') 
});

export const phoneSchema = z.string()
  .optional()
  .or(z.literal(''))
  .refine((val) => {
    if (!val || val === '') return true; // Permitir vacío
    return /^(\+[0-9]{1,3})?[0-9\s\-\(\)]{7,15}$/.test(val);
  }, 'Formato de teléfono no válido');

export const emailSchema = z.string()
  .optional()
  .or(z.literal(''))
  .refine((val) => {
    if (!val || val === '') return true; // Permitir vacío
    return /\S+@\S+\.\S+/.test(val);
  }, 'Correo electrónico no válido');

export const ubicacionSchema = z.object({
  nombre: z.string().optional(),
  calle: z.string().optional(),
  ciudad: z.string().optional(),
  estado: z.string().optional(),
  pais: z.string().default('Venezuela'),
  descripcion: z.string().optional()
}).optional();

export const createProviderSchema = z.object({
  nombre_empresa: z.string().min(1, 'Nombre de empresa es requerido'),
  contacto_principal: z.string().min(1, 'Contacto principal es requerido'),
  telefono: phoneSchema,
  email: emailSchema,
  especialidades: z.array(z.string()).optional(),
  especialidad: z.string().optional(), // Mantener para compatibilidad
  categorias: z.array(z.string()).optional(), // Campo principal para categorías
  descripcion: z.string().optional(),
  ubicacion: ubicacionSchema
});

export const updateProviderSchema = createProviderSchema.partial();

export const serviceTypeParamsSchema = z.object({ 
  type: z.enum(['semillas', 'fertilizantes', 'herramientas', 'sistemas_riego', 'macetas', 'iluminacion', 'otros']) 
});