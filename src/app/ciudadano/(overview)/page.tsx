"use client";

import { Alert, Button, Chip, Skeleton } from "@heroui/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ClipboardDocumentListIcon,
  DocumentChartBarIcon,
} from "@heroicons/react/24/solid";
import Image from "next/image";
import { useActivePeriod } from "@/hooks/useActivePeriod";
import { addToast } from "@heroui/toast";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { verifyFormForPeriod } from "@/services/ciudadano/FormService/forms.service";
import { get } from "@/utils/shared/apiUtils";

export default function CitizenOverviewPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { id: periodId, periodo, activo } = useActivePeriod();
  const { name } = useAuth();
  const toastParam = search.get("toast");
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  useEffect(() => {
    if (toastParam === "forbidden") {
      addToast({ title: "Acceso denegado al formulario.", color: "warning" });
      const url = new URL(window.location.href);
      url.searchParams.delete("toast");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, [toastParam]);

  useEffect(() => {
    const checkExistingForm = async () => {
      if (!periodId) return;
      try {
        setIsChecking(true);
        const data = await verifyFormForPeriod(periodId);
        const list = Array.isArray(data) ? data : (data as any)?.data ?? [];
        const completed = list.length > 0 ? !!list[0]?.completado : false;
        setIsCompleted(completed);
      } catch (e) {
        console.error("Error verificando formulario por periodo:", e);
        setIsCompleted(false);
      } finally {
        setIsChecking(false);
      }
    };
    checkExistingForm();
  }, [periodId]);

  // Cargar mensajes in-app y tomar el último (según orden del array)
  useEffect(() => {
    (async () => {
      try {
        const data = await get<any[]>("/api/v1/mensajes/?skip=0&limit=999");
        if (Array.isArray(data) && data.length > 0) {
          const first = data[0];
          const contenido = first?.contenido ?? "";
          setLastMessage(typeof contenido === "string" ? contenido : "");
        } else {
          setLastMessage("");
        }
      } catch (e) {
        console.error("Error cargando mensajes", e);
        setLastMessage("");
      }
    })();
  }, []);

  console.log("activo", activo);

  return (
    <section 
      className="flex relative flex-col items-center bg-white space-y-8 rounded-4xl py-5 px-5 lg:py-9 lg:px-20"
      role="main"
      aria-labelledby="citizen-overview-title"
    >
      <div className="flex flex-col items-center gap-1 w-auto max-w-md">
        <Image
          src="/gato_ciudadano_home.webp"
          alt="Imagen del gato de Cali"
          width={100}
          height={100}
          className="mb-4"
        />
        <h1 
          id="citizen-overview-title"
          className="text-xl text-center max-w-10/12 lg:text-2xl"
        >
          ¡Bienvenido de nuevo{" "}
          <span className="font-bold text-primary">{name || "Usuario"}</span> al SGIRS Cali!
        </h1>
        <p className="text-sm text-gray-400 text-center">
          Reporta fácilmente tu gestión de residuos y contribuye a una ciudad
          más limpia y circular.
        </p>
      </div>
      <div className="w-full flex flex-col items-center max-w-lg">
        {isCompleted && (
          <div className="w-full mb-2 flex justify-center" role="status" aria-live="polite">
            <Chip
              color="warning"
              variant="flat"
              size="sm"
              className="tracking-wide"
              aria-label="Formulario completado: ya no puedes responder. Revisa Mis reportes para descargar el certificado."
            >
              <span className="font-semibold">Formulario completado:</span> ya no puedes responder. Revisa Mis reportes para descargar el certificado.
            </Chip>
          </div>
        )}
        {activo === true && (
          <Alert
            color="success"
            title={`Está activo el diligenciamiento del formulario SGIRS para el año ${periodo ?? ""}. Comienza a llenar el formulario.`}
            role="status"
            aria-live="polite"
          />
        )}
        {activo === false && (
          <Alert
            color="warning"
            title={`Se ha cerrado el formulario del ${periodo ?? ""}.`}
            role="alert"
            aria-live="polite"
          />
        )}
        {activo === undefined && (
          <Alert
            color="primary"
            title={lastMessage}
            role="status"
            aria-live="polite"
          />
        )}
      </div>
      <section 
        className="w-full flex flex-col items-center gap-4"
        aria-labelledby="citizen-actions-title"
      >
        <h2 id="citizen-actions-title" className="sr-only">
          Acciones principales del ciudadano
        </h2>
        <Button
          fullWidth
          color="primary"
          endContent={
            <ClipboardDocumentListIcon className="w-6 h6 text-white" aria-hidden="true" />
          }
          isDisabled={activo === false || isCompleted || isChecking || activo === undefined}
          aria-disabled={activo === false || isCompleted || isChecking || activo === undefined}
          aria-busy={isChecking}
          title={
            activo === undefined || activo === false
              ? "El formulario no está abierto."
              : isCompleted
              ? "Ya completaste el formulario de este periodo."
              : undefined
          }
          onPress={() => {
            if (activo !== true || isCompleted) {
              addToast({
                title: "El formulario no está abierto o ya respondiste el formulario.",
                color: "warning",
              });
              return;
            }
            router.push("/ciudadano/reportes/formulario");
          }}
          aria-describedby="form-button-help"
        >
          Diligenciar formulario
        </Button>
        <div id="form-button-help" className="sr-only">
          Ir al formulario para reportar gestión de residuos
        </div>
        
        <Button
          fullWidth
          color="primary"
          variant="bordered"
          endContent={<DocumentChartBarIcon className="w-6 h6 text-primary" aria-hidden="true" />}
          onPress={() => router.push("/ciudadano/reportes")}
          aria-describedby="reports-button-help"
        >
          Revisar mis reportes
        </Button>
        <div id="reports-button-help" className="sr-only">
          Ver historial de reportes enviados anteriormente
        </div>
      </section>
    </section>
  );
}
