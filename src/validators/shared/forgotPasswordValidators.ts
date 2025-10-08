import { z } from "zod";

// Esquema para validación del formulario de recuperación de contraseña
export const forgotPasswordSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
});

// Tipo derivado del esquema de recuperación de contraseña
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
