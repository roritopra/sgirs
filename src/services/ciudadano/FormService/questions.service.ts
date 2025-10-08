import { get } from "@/utils/shared/apiUtils";
import { TipoPregunta, Pregunta, OpcionRespuesta } from "@/types/ciudadano/typeQuestions.types";

export function getTiposPregunta(): Promise<TipoPregunta[]> {
  return get<TipoPregunta[]>("/api/v1/tipo_pregunta/");
}

export function getPreguntaPorNumero(num: number): Promise<Pregunta> {
  return get<Pregunta>(`/api/v1/preguntas/numero/${num}`);
}

export function getOpcionesRespuesta(page: number = 1, perPage: number = 500): Promise<{ data: OpcionRespuesta[] }> {
  return get<{ data: OpcionRespuesta[] }>(`/api/v1/opciones-respuesta?page=${page}&per_page=${perPage}`);
}
