"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, Input, Button, Alert, addToast } from "@heroui/react";
import Image from "next/image";
import {
  loginSchema,
  type LoginFormValues,
} from "@/validators/shared/loginValidators";
import { Link } from "@heroui/link";
import { useEffect, useState } from "react";
import type { AuthError } from "@/types/auth";

interface LoginFormProps {
  onSubmit: (data: LoginFormValues) => void;
  loading?: boolean;
  error?: AuthError | null;
}

export default function LoginForm({ onSubmit, loading = false, error }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    watch,
    reset,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit", // Solo validar al enviar
  });

  const watchedValues = watch();
  const isFormValid = watchedValues.email && watchedValues.password;

  // Sincronizar mensaje local según el error del backend
  useEffect(() => {
    if (!error) {
      setLocalError(null);
      return;
    }
    const status = error.status;
    if (status === 400) {
      setLocalError("Email o contraseña incorrectos");
      return;
    }
    if (status === 403) {
      setLocalError("Confirma la cuenta en el correo electrónico");
      return;
    }
    setLocalError(error.detail || error.message || "No se pudo iniciar sesión");
  }, [error]);

  useEffect(() => {
    if (!error) return;
    const status = error.status;
    let description = "";
    if (status === 400) {
      description = "Email o contraseña incorrectos";
    } else if (status === 403) {
      description = "Confirma la cuenta en el correo electrónico";
    } else {
      description = error.detail || error.message || "No se pudo iniciar sesión";
    }
    const color = status === 403 ? "warning" : "danger";
    addToast({
      title: "Error en el inicio de sesión",
      description,
      color,
      variant: "flat",
    });
  }, [error]);

  return (
    <section 
      className="flex relative flex-col items-center bg-white space-y-8 rounded-4xl py-5 px-5 lg:py-9 lg:px-20"
      role="main"
      aria-labelledby="login-title"
    >
      <div className="flex flex-col items-center gap-1 w-auto max-w-md">
        <Image
          src="/gato_login.webp"
          alt="Mascota de SGIRS Cali - Gato representando el sistema de gestión de residuos"
          width={100}
          height={100}
          className="mb-4 w-20 h-20 lg:w-24 lg:h-24"
        />
        <h1 
          id="login-title"
          className="text-xl font-semibold text-center lg:text-2xl"
        >
          ¡Bienvenido a SGIRS Cali!
        </h1>
        <p className="text-sm text-gray-400 text-center">
          Reporta fácilmente tu gestión de residuos y contribuye a una ciudad
          más limpia y circular.
        </p>
      </div>
      
      {error && (
        <Alert 
          color={error?.status === 403 ? "warning" : "danger"} 
          title={localError || "Error en el inicio de sesión"} 
          variant="flat"
          role="alert"
          aria-live="polite"
        />
      )}
      
      <Form
        className="w-full flex flex-col items-center gap-4"
        onSubmit={handleSubmit(onSubmit)}
        aria-labelledby="login-title"
      >
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              id="email"
              {...field}
              label="Correo electrónico"
              labelPlacement="outside"
              placeholder="Ingresa tu correo electrónico"
              type="email"
              isRequired
              variant="bordered"
              isInvalid={Boolean(localError)}
              onChange={(e) => {
                if (localError) setLocalError(null);
                field.onChange(e);
              }}
              fullWidth
              autoComplete="email"
              aria-label="Correo electrónico"
              aria-describedby={localError ? "login-error" : undefined}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Input
              id="password"
              {...field}
              label="Contraseña"
              labelPlacement="outside"
              placeholder="Ingresa tu contraseña"
              type={showPassword ? "text" : "password"}
              isRequired
              variant="bordered"
              isInvalid={Boolean(localError)}
              onChange={(e) => {
                if (localError) setLocalError(null);
                field.onChange(e);
              }}
              fullWidth
              autoComplete="current-password"
              aria-label="Contraseña"
              aria-describedby={localError ? "login-error" : undefined}
              endContent={
                <button
                  type="button"
                  className="focus:outline-none cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
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
          )}
        />

        {localError && (
          <div id="login-error" className="sr-only" aria-live="polite">
            {localError}
          </div>
        )}

        <div className="w-full flex justify-end mb-6">
          <Link
            href="/auth/forgot-password"
            size="sm"
            className="text-[#339afe]"
            aria-label="Ir a recuperación de contraseña"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <div className="flex flex-col gap-4 w-full">
          <Button
            fullWidth
            color="primary"
            type="submit"
            isLoading={isSubmitting || loading}
            isDisabled={!isFormValid || loading}
            aria-describedby="login-button-help"
          >
            {isSubmitting || loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
          <div id="login-button-help" className="sr-only">
            Acceder al sistema con las credenciales proporcionadas
          </div>

          <div 
            className="w-full flex items-center gap-4 my-2"
            role="separator"
            aria-label="Separador entre opciones de acceso"
          >
            <div className="h-px bg-gray-300 flex-1" aria-hidden="true"></div>
            <span className="text-gray-400 text-sm">
              ¿Aún no tienes cuenta?
            </span>
            <div className="h-px bg-gray-300 flex-1" aria-hidden="true"></div>
          </div>

          <div className="w-full flex justify-center mb-6">
            <Link
              href="/auth/register"
              size="sm"
              className="text-[#339afe]"
              underline="always"
              aria-label="Ir al formulario de registro para crear una nueva cuenta"
            >
              Crear una cuenta
            </Link>
          </div>
        </div>
      </Form>
    </section>
  );
}
