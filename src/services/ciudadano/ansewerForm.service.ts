import { get } from "@/utils/shared/apiUtils";

export interface RespuestaItem {
  id: string;
  pregunta: string;
  num_pregunta: string;
  opcion_respuesta: string;
  archivo_anexo: string | null;
  nombre_anexo?: string | null;
  fecha_respuesta?: string;
  status?: boolean;
}

export interface RespuestasPeriodo {
  periodo_encuesta?: string;
  respuestas_usuario?: RespuestaItem[];
}

export interface UsuarioRespuestasResponse {
  id_usuario: string;
  respuestas_usuario: RespuestasPeriodo[];
}

export async function getAllUserResponses(): Promise<UsuarioRespuestasResponse> {
  return get<UsuarioRespuestasResponse>("/api/v1/respuestas-usuario/respuestas-usuario/all");
}

// Listado combinado de periodos por usuario
export interface CombinedReport {
  id_periodo_encuesta: string;
  periodo_encuesta: string;
  completado: boolean;
  updated_at: string;
  created_at: string;
}

export async function getCombinedUserResponses(): Promise<CombinedReport[]> {
  return get<CombinedReport[]>(
    "/api/v1/respuestas-usuario/respuestas-usuario/combinadas"
  );
}

// Detalle de un periodo por id_periodo_encuesta
export interface ReportDetailsResponse {
  id_periodo_encuesta: string;
  periodo_encuesta: string;
  completado: boolean;
  updated_at: string;
  respuestas_usuario: RespuestaItem[];
}

export async function getReportDetailsByPeriodoId(
  idPeriodoEncuesta: string
): Promise<ReportDetailsResponse> {
  return get<ReportDetailsResponse>(
    `/api/v1/respuestas-usuario/respuestas-usuario/${encodeURIComponent(
      idPeriodoEncuesta
    )}/mostrar-respuestas-a-preguntas-y-archivos-añadidos`
  );
}

// Certificado: retorna una URL de PDF firmada temporalmente
export interface CertificateResponse { url: string }

export async function getCertificateUrl(
  idPeriodoEncuesta: string
): Promise<string> {
  const res = await get<CertificateResponse | string>(
    "/api/v1/certificado/",
    {
      params: { id_periodo: idPeriodoEncuesta },
    }
  );
  if (typeof res === "string") return res;
  return res.url;
}
