import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string({ required_error: "La contraseña es requerida" })
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .refine((password) => /[0-9]/.test(password), {
        message: "La contraseña debe incluir al menos un número",
      })
      .refine((password) => /[a-z]/.test(password), {
        message: "La contraseña debe incluir al menos una letra minúscula",
      })
      .refine((password) => /[A-Z]/.test(password), {
        message: "La contraseña debe incluir al menos una letra mayúscula",
      }),
    confirmPassword: z
      .string({ required_error: "Confirma la contraseña" })
      .min(8, "Debe tener al menos 8 caracteres"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
