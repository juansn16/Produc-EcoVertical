import { z } from 'zod';

export const emailSchema = z.string().email({ message: 'Correo electrónico no válido' });

export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres');

export const registerSchema = z.object({
  nombre: z.string().min(1, 'Nombre es requerido'),
  cedula: z.string()
    .min(3, 'Cédula es requerida')
    .max(20, 'Cédula no puede exceder 20 caracteres')
    .regex(/^[0-9]+$/, 'Cédula debe contener solo números'),
  telefono: z.string().optional(),
  preferencias_cultivo: z.string().optional(),
  calle: z.string().min(1, 'Calle es requerida'),
  ciudad: z.string().min(1, 'Ciudad es requerida'),
  estado: z.string().optional(),
  pais: z.string().optional(),
  latitud: z.coerce.number().optional(),
  longitud: z.coerce.number().optional(),
  email: emailSchema,
  password: passwordSchema
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Contraseña es requerida')
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Token de refresco es requerido')
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Token de refresco es requerido')
});

