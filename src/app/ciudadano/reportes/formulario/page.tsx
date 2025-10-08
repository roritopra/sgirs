"use client";

import { Stepper } from "@/components/ciudadano/Form/stepper";
import { FormProvider } from "@/components/ciudadano/Form/FormContext";
import { useActivePeriod } from "@/hooks/useActivePeriod";
import { addToast } from "@heroui/toast";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FormPage() {
  const router = useRouter();
  const { activo, periodo } = useActivePeriod();

  useEffect(function guardAccess() {
    if (activo === undefined) return;
    if (activo === false) {
      addToast({
        title: "El formulario no está abierto o ya respondiste el formulario.",
        color: "warning",
      });
      router.replace("/ciudadano");
    }
  }, [activo, router]);

  const allowed = activo === true;
  if (!allowed) return null;
  return (
    <section 
      className="max-w-5xl mx-auto w-full"
      role="main"
      aria-labelledby="form-page-title"
    >
      <div className="text-center mb-8">
        <h1 
          id="form-page-title"
          className="text-2xl font-bold text-gray-900 md:text-3xl"
        >
          Sistema de Gestión Integral de Residuos Sólidos (SGIRS)
        </h1>
        <p 
          className="text-lg text-gray-600 mt-2"
          id="form-description"
        >
          Formulario de evaluación y diagnóstico
        </p>
      </div>

      <div aria-labelledby="form-page-title" aria-describedby="form-description">
        <FormProvider>
          <Stepper />
        </FormProvider>
      </div>

      <footer 
        className="text-center text-sm text-gray-800 mt-8"
        role="contentinfo"
        aria-label="Información legal del formulario"
      >
        Este formulario cumple con los requisitos establecidos en el Decreto 0595 de 2022 y con toda la normativa ambiental vigente asociada a la gestión integral de residuos sólidos.
      </footer>
    </section>
  );
}
