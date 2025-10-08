import { Link } from "@heroui/link";
import { Form, Input, Button, addToast } from "@heroui/react";
import { EnvelopeIcon } from "@heroicons/react/24/solid";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/validators/shared/forgotPasswordValidators";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/authService";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      const res = await AuthService.forgotPassword({ email: data.email });
      if (res?.msg === "If the email exists, a reset link has been sent") {
        addToast({
          title: "Correo enviado",
          description:
            "Se envió un email a tu correo, verifica para seguir los pasos",
          color: "success",
          variant: "flat",
        });
        router.push(
          `/auth/verify-email?email=${encodeURIComponent(data.email)}`
        );
      }
    } catch (error) {
      addToast({
        title: "No se pudo enviar el correo",
        description:
          "Intenta nuevamente en unos minutos. Si el problema persiste, contacta soporte.",
        color: "danger",
        variant: "flat",
      });
      console.error("Error al solicitar recuperación de contraseña:", error);
    }
  };

  return (
    <section 
      className="flex relative flex-col items-center bg-white space-y-8 rounded-4xl py-5 px-5 lg:py-9 lg:px-20"
      role="main"
      aria-labelledby="forgot-password-title"
    >
      <div className="flex flex-col items-center gap-1 w-auto max-w-md">
        <h1 
          id="forgot-password-title"
          className="text-xl font-semibold lg:text-2xl"
        >
          Contraseña olvidada
        </h1>
        <p className="text-sm text-gray-400 text-center">
          Ingresa tu correo electrónico que creaste para poder recuperar tu
          contraseña y te enviaremos las instrucciones
        </p>
      </div>
      <Form 
        className="w-full flex flex-col items-center gap-6"
        onSubmit={handleSubmit(onSubmit)}
        aria-labelledby="forgot-password-title"
      >
        <Input
          label="Correo electrónico"
          labelPlacement="outside"
          placeholder="Ingresa tu correo electrónico"
          isRequired
          variant="bordered"
          startContent={<EnvelopeIcon className="w-6 h-6 text-gray-400" aria-hidden="true" />}
          fullWidth
          {...register("email")}
          isInvalid={!!errors.email}
          errorMessage={errors.email?.message}
          autoComplete="email"
          aria-describedby={errors.email ? "email-error" : undefined}
          type="email"
        />

        <div className="flex flex-col gap-8 w-full">
          <Button 
            fullWidth 
            color="primary" 
            type="submit"
            isLoading={isSubmitting}
            isDisabled={!isValid}
            aria-describedby="send-button-help"
          >
            {isSubmitting ? "Enviando..." : "Enviar"}
          </Button>
          <div id="send-button-help" className="sr-only">
            Enviar solicitud de recuperación de contraseña al correo electrónico
          </div>

          <div className="w-full flex justify-center items-center gap-2 mb-6">
            <p className="text-sm text-gray-400">¿Recordaste la contraseña?</p>
            <Link
              href="/auth/login"
              size="sm"
              className="text-[#339afe]"
              underline="always"
              aria-label="Volver al formulario de inicio de sesión"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </Form>
    </section>
  );
}
