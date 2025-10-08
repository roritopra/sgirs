import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().email("Debe ser un email válido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
