"use client";

import { Chip, Button } from "@heroui/react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import SummaryReport from "@/components/ciudadano/SummaryReport";
import { getReportDetailsByPeriodoId, RespuestasPeriodo, getCertificateUrl } from "@/services/ciudadano/ansewerForm.service";

export default function ReportDetailByIdPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const idPeriodo = useMemo(() => {
    const raw = params?.id_periodo_encuesta;
    if (typeof raw === "string") return decodeURIComponent(raw);
    if (Array.isArray(raw) && raw.length > 0) return decodeURIComponent(raw[0]!);
    return "";
  }, [params]);

  const [periodoLabel, setPeriodoLabel] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respuestas, setRespuestas] = useState<RespuestasPeriodo["respuestas_usuario"] | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [certError, setCertError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!idPeriodo) {
        setError("Identificador de periodo no válido.");
        setIsLoading(false);
        return;
      }
      try {
        const detail = await getReportDetailsByPeriodoId(idPeriodo);
        if (!mounted) return;
        setPeriodoLabel(detail.periodo_encuesta);
        setRespuestas(detail.respuestas_usuario || []);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || "Error al cargar el detalle del reporte");
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [idPeriodo]);

  const periodData: RespuestasPeriodo | null = useMemo(() => {
    if (!respuestas) return null;
    return {
      periodo_encuesta: periodoLabel,
      respuestas_usuario: respuestas,
    } as RespuestasPeriodo;
  }, [periodoLabel, respuestas]);

  const idFromQuery = useMemo(() => {
    const byFull = searchParams.get("id_periodo_encuesta");
    const byShort = searchParams.get("id_periodo");
    return byFull || byShort || "";
  }, [searchParams]);

  const effectiveId = idFromQuery || idPeriodo;

  const handleDownloadCertificate = async () => {
    setCertError(null);
    if (!effectiveId) {
      setCertError("ID de periodo no disponible.");
      return;
    }
    let pendingWindow: Window | null = null;
    try {
      setIsDownloading(true);
      pendingWindow = window.open("about:blank", "_blank");
      const url = await getCertificateUrl(effectiveId);
      if (url) {
        if (pendingWindow) {
          pendingWindow.location.href = url;
        } else {
          window.location.href = url;
        }
      } else {
        if (pendingWindow) pendingWindow.close();
        setCertError("No se pudo obtener el certificado.");
      }
    } catch (e: any) {
      if (pendingWindow) pendingWindow.close();
      setCertError(e?.message || "Error al descargar el certificado");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <section
      className="flex relative flex-col items-center space-y-8 w-full max-w-5xl"
      role="main"
      aria-labelledby="report-detail-title"
    >
      <article className="flex items-center flex-col gap-8 p-5 bg-white rounded-xl w-full md:justify-between md:flex-row">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-center gap-2 md:justify-start">
            <h1 id="report-detail-title" className="font-medium text-gray-900">
              Resumen de reporte
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-gray-400 text-sm">Fecha: 15 Septiembre 2025</p>
            <Chip size="sm" variant="flat">
              {periodoLabel || "–"}
            </Chip>
          </div>
        </div>
        <Button
          color="primary"
          variant="solid"
          endContent={<ArrowDownTrayIcon className="w-5 h-5" aria-hidden="true" />}
          onPress={handleDownloadCertificate}
          className="w-full md:w-auto"
          aria-label="Descargar certificado en PDF"
          isLoading={isDownloading}
          isDisabled={!effectiveId}
        >
          Descargar certificado
        </Button>
      </article>

      {certError && (
        <div className="p-5 bg-white rounded-xl w-full" role="alert" aria-live="polite">
          <p className="text-red-500 text-sm">{certError}</p>
        </div>
      )}

      {isLoading && (
        <div className="p-5 bg-white rounded-xl w-full" role="status" aria-live="polite">
          <p className="text-gray-500 text-sm">Cargando resumen…</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="p-5 bg-white rounded-xl w-full" role="alert" aria-live="polite">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      {!isLoading && !error && periodData && (
        <div aria-labelledby="summary-report-title" className="w-full">
          <h2 id="summary-report-title" className="sr-only">
            Detalles del reporte del periodo {periodoLabel}
          </h2>
          <SummaryReport periodData={periodData} periodId={effectiveId} />
        </div>
      )}
    </section>
  );
}
