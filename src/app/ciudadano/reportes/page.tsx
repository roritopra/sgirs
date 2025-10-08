"use client";

import ReportCard from "@/components/ciudadano/ReportCard";
import { useEffect, useState } from "react";
import {
  getCombinedUserResponses,
  CombinedReport,
} from "@/services/ciudadano/ansewerForm.service";
import ReportCardSkeleton from "@/components/skeletons/ReportCardSkeleton";
import { parseDateToLocal } from "@/utils/shared/date";
import { useActivePeriod } from "@/hooks/useActivePeriod";

export default function ReportsPage() {
  const [reportes, setReportes] = useState<CombinedReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { activo } = useActivePeriod();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getCombinedUserResponses();
        if (!mounted) return;
        setReportes(data || []);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || "Error al cargar los reportes");
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section 
      className="flex relative flex-col items-center space-y-8 max-w-5xl"
      role="main"
      aria-labelledby="reports-page-title"
    >
      <div className="flex flex-col gap-3 p-5 bg-white rounded-xl">
        <h1 
          id="reports-page-title"
          className="font-medium text-lg"
        >
          Mis reportes
        </h1>
        <p className="text-gray-500 text-sm md:text-base">
          Visualiza tus reportes generados durante los semestres del año, puedes
          observar si se generaron correctamente junto con su resumen y también
          observar si hay alguno pendiente por realizar.
        </p>
      </div>
      <section 
        className="flex flex-col gap-3 p-5 bg-white rounded-xl w-full"
        aria-labelledby="reports-list-title"
      >
        <h2 id="reports-list-title" className="sr-only">
          Lista de reportes del usuario
        </h2>
        {isLoading && (
          <div 
            role="status"
            aria-live="polite"
            aria-label="Cargando reportes"
          >
            {Array.from({ length: 3 }).map((_, idx) => (
              <ReportCardSkeleton key={`skeleton-${idx}`} />
            ))}
          </div>
        )}
        {error && !isLoading && (
          <div 
            role="alert"
            aria-live="polite"
            className="text-red-500 text-sm"
          >
            {error}
          </div>
        )}
        {!isLoading && !error && reportes.length === 0 && (
          <div 
            role="status"
            aria-live="polite"
            className="text-gray-500 text-sm"
          >
            No hay reportes disponibles.
          </div>
        )}
        {!isLoading && !error &&
          reportes.map((r) => (
            <ReportCard
              key={r.id_periodo_encuesta}
              date={parseDateToLocal(r.updated_at)}
              period={r.periodo_encuesta}
              isCompleted={r.completado}
              linkUrl={r.completado
                ? `/ciudadano/reportes/${encodeURIComponent(r.id_periodo_encuesta)}?id_periodo_encuesta=${encodeURIComponent(r.id_periodo_encuesta)}&id_periodo=${encodeURIComponent(r.id_periodo_encuesta)}`
                : "/ciudadano/reportes/formulario"}
              canEnter={r.completado || activo === true}
            />
          ))}
      </section>
    </section>
  );
}
