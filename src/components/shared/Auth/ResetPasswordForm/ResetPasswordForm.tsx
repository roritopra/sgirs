"use client";

import { Form, Input, Button, addToast } from "@heroui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/validators/shared/resetPasswordValidators";
import { useMemo, useState, useEffect } from "react";
import { AuthService } from "@/services/authService";
import { decodeJwtPayload } from "@/utils/shared/jwt";
import { useRouter } from "next/navigation";
import PasswordField from "@/components/shared/Auth/Password/PasswordField";

interface ResetPasswordFormProps {
  token?: string | null;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const payload = useMemo(() => (token ? decodeJwtPayload(token) : null), [token]);
  const userId: string | null = useMemo(() => {
    if (!payload) return null;
    return (payload.sub ?? payload.uid ?? null) as string | null;
  }, [payload]);

  const [newPassword, setNewPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    setValue,
    watch,
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
    mode: "onBlur",
  });

  const disabledByToken = !token || !userId;
  const confirmPassword = watch("confirmPassword") || "";
  const passwordsMatch = confirmPassword === newPassword;

  useEffect(() => {
    setValue("newPassword", newPassword, { shouldValidate: true });
  }, [newPassword, setValue]);

  async function onSubmit(data: ResetPasswordFormValues) {
    if (disabledByToken) {
      addToast({
        title: "Token inválido",
        description: "El enlace es inválido o ha expirado.",
        color: "danger",
        variant: "flat",
      });
      return;
    }
    try {
      await AuthService.resetPassword({
        token: token as string,
        user_id: userId as string,
        new_password: data.newPassword,
      });
      addToast({
        title: "Contraseña actualizada",
        description: "Ahora puedes iniciar sesión con tu nueva contraseña.",
        color: "success",
        variant: "flat",
      });
      router.push("/auth/login");
    } catch (error) {
      addToast({
        title: "No se pudo cambiar la contraseña",
        description:
          "Intenta nuevamente. Si el problema persiste, solicita un nuevo enlace.",
        color: "danger",
        variant: "flat",
      });
      console.error("Error al cambiar contraseña:", error);
    }
  }

  return (
    <section
      className="flex relative flex-col items-center bg-white space-y-8 rounded-4xl py-5 px-5 lg:py-9 lg:px-20"
      role="main"
      aria-labelledby="reset-password-title"
    >
      <div className="flex flex-col items-center gap-1 w-md max-w-md">
        <h1 id="reset-password-title" className="text-xl text-center font-semibold lg:text-2xl">
          Restablecer contraseña
        </h1>
        <p className="text-sm text-center text-gray-400">
          Crea una nueva contraseña para tu cuenta.
        </p>
      </div>

      <Form
        className="w-full flex flex-col items-center gap-6"
        onSubmit={handleSubmit(onSubmit)}
        aria-labelledby="reset-password-title"
      >
        <PasswordField
          value={newPassword}
          onChange={setNewPassword}
          label="Nueva contraseña"
          placeholder="Ingresa tu nueva contraseña"
          isRequired
          autoComplete="new-password"
        />

        <Input
          label="Confirmar contraseña"
          labelPlacement="outside"
          placeholder="Confirma tu nueva contraseña"
          isRequired
          variant="bordered"
          type={showConfirm ? "text" : "password"}
          {...register("confirmPassword")}
          autoComplete="new-password"
          aria-describedby={
            errors.confirmPassword ? "confirm-password-error" : undefined
          }
          endContent={
            <button
              type="button"
              className="focus:outline-none cursor-pointer"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-pressed={showConfirm}
            >
              {showConfirm ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-gray-400"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-gray-400"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
            </button>
          }
        />

        <div className="flex flex-col gap-8 w-full mt-4">
          <Button
            fullWidth
            color="primary"
            type="submit"
            isLoading={isSubmitting}
            isDisabled={isSubmitting || disabledByToken || !passwordsMatch}
            aria-describedby="change-button-help"
          >
            {isSubmitting ? "Cambiando..." : "Cambiar contraseña"}
          </Button>
          <div id="change-button-help" className="sr-only">
            Actualizar la contraseña de la cuenta con la nueva contraseña proporcionada
          </div>
        </div>
      </Form>
    </section>
  );
}
