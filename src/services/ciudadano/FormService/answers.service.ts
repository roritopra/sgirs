import { get, post } from "@/utils/shared/apiUtils";
import type { PeriodoActivo, BulkSaveRequest } from "@/types/ciudadano/answers.types";

export async function getPeriodosActivos(): Promise<{ data: PeriodoActivo[] }> {
  return get<{ data: PeriodoActivo[] }>("/api/v1/periodos-encuesta/activos");
}

export async function postRespuestaUsuario(payload: BulkSaveRequest): Promise<any> {
  return post<any>("/api/v1/respuestas-usuario/respuestas-usuario/bulk", payload);
}
