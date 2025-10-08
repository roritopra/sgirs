import { z } from "zod";

// Esquema para el primer paso del formulario
export const userInfoSchema = z.object({
  firstName: z.string().min(2, "El primer nombre es requerido"),
  secondName: z.string().optional(),
  firstLastName: z.string().min(2, "El primer apellido es requerido"),
  secondLastName: z.string().optional(),
  email: z.string().email("Por favor ingresa tu correo electrónico. Asegúrate de que sea un correo válido y al que tengas acceso, ya que lo utilizaremos más adelante para enviarte la validación."),
  password: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .refine(password => /[0-9]/.test(password), {
      message: "La contraseña debe incluir al menos un número"
    })
    .refine(password => /[a-z]/.test(password), {
      message: "La contraseña debe incluir al menos una letra minúscula"
    })
    .refine(password => /[A-Z]/.test(password), {
      message: "La contraseña debe incluir al menos una letra mayúscula"
    }),
});

// Esquema para el segundo paso del formulario
export const establishmentInfoSchema = z.object({
  nit: z
    .string()
    .regex(/^\d+$/u, "NIT inválido. Usa solo números"),
  nombreEstablecimiento: z.string().min(1, "El nombre del establecimiento es requerido"),
  sector: z.string().min(1, "El sector es requerido"),
  comuna: z.string().min(1, "La comuna es requerida"),
  barrio: z.string().min(1, "El barrio es requerido"),
  direccion: z.string().min(1, "La dirección es requerida"),
  telefono: z.string().optional(),
});

// Esquema completo del formulario
export const registerFormSchema = z.object({
  ...userInfoSchema.shape,
  ...establishmentInfoSchema.shape,
});

// Tipos derivados de los esquemas
export type UserInfoFormValues = z.infer<typeof userInfoSchema>;
export type EstablishmentInfoFormValues = z.infer<typeof establishmentInfoSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
