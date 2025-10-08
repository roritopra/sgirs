"use client";

import { Link } from "@heroui/link";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface VerifyMailProps {
  email?: string;
}

export default function VerifyMail({
  email = "example@mail.com",
}: VerifyMailProps) {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(20);

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          router.push("/auth/login");
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [router]);

  return (
    <section
      className="flex relative flex-col items-center bg-white space-y-8 rounded-4xl py-5 px-5 lg:py-9 lg:px-20"
      role="main"
      aria-labelledby="verify-mail-title"
    >
      <div className="flex flex-col items-center gap-3 w-auto max-w-md">
        <div
          className="bg-[#E6F1ED] rounded-full flex items-center justify-center p-2"
          role="img"
          aria-label="Icono de sobre indicando que el correo fue enviado exitosamente"
        >
          <EnvelopeIcon className="w-10 h-10 text-primary" aria-hidden="true" />
        </div>

        <h1
          id="verify-mail-title"
          className="text-xl font-semibold lg:text-2xl"
        >
          ¡Correo enviado!
        </h1>
        <p className="text-sm text-gray-500 text-center" aria-live="polite">
          Hemos enviado un correo con las instrucciones a{" "}
          <span
            className="font-bold"
            aria-label={`correo electrónico ${email}`}
          >
            {email}
          </span>
          , revisa tu bandeja y sigue las instrucciones para restablecer tu
          contraseña
        </p>
      </div>
      <p
        className="text-sm text-gray-500 text-center"
        role="status"
        aria-live="polite"
        aria-describedby="redirect-message"
      >
        Serás redirigido al inicio de sesión en{" "}
        <span className="font-semibold">{secondsLeft}</span> segundos.
      </p>
      <section
        className="w-full flex flex-col items-center gap-6"
        aria-labelledby="verify-mail-actions"
      >
        <h2 id="verify-mail-actions" className="sr-only">
          Opciones adicionales
        </h2>
        <div className="w-full flex flex-col justify-center items-center gap-2 lg:flex-row">
          <p className="text-sm text-gray-400">
            ¿Escribiste mal la dirección de tu correo?
          </p>
          <Link
            href="/auth/forgot-password"
            size="sm"
            className="text-[#339afe]"
            underline="always"
            aria-label="Volver al formulario de recuperación para cambiar la dirección de correo"
          >
            Cambia la dirección
          </Link>
        </div>
      </section>
    </section>
  );
}
