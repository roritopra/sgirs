import { z } from "zod";

// Esquema para validación del formulario de login
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Por favor ingresa un correo electrónico válido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(4, "La contraseña debe tener al menos 4 caracteres"),
});

// Tipo derivado del esquema de login
export type LoginFormValues = z.infer<typeof loginSchema>;
