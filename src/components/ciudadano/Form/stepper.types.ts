/**
 * Tipos y interfaces para el componente Stepper
 */

import type { FormState } from "./FormContext";

export interface FileAttachment {
  name: string;
  size: number;
  type: string;
  url?: string;
  file?: File;
}

export interface AnswerPayload {
  id_pregunta: string;
  id_opcion_respuesta: string;
  id_periodo_encuesta: string;
  id_usuario?: string;
  fecha_respuesta?: string;
  status?: string;
  tipo_pregunta?: string;
}

export interface CreateFormBody {
  usuario_id: string;
  encuesta_id: string;
  status: string;
  respuestas: Omit<AnswerPayload, "tipo_pregunta">[];
}

export interface OpcionRespuesta {
  id: string;
  opcion_respuesta: string;
  id_pregunta: string;
}

export interface PreguntaMetadata {
  id: string;
  num_pregunta: number;
  id_tipo_pregunta?: string;
  anexo?: boolean;
}

export interface IndicatorVariable {
  nombre_variable: string;
  respuesta_por_mes: Record<string, number>;
}

export interface IndicatorRespuesta {
  nombre_indicador: string;
  variables?: IndicatorVariable[];
  respuestas?: Array<{ pregunta: string; respuesta: string }>;
}

export interface IndicatorsPayload {
  periodo_encuesta_id: string;
  respuestas: IndicatorRespuesta[];
}

export interface DynamicIndicator {
  nombre_indicador: string;
  num_indicador: number;
  es_uar: boolean;
  variables?: Array<{ nombre_variable: string }>;
  preguntas?: Array<{ pregunta: string }>;
}

export interface RespuestaUsuario {
  id_pregunta: string;
  id_opcion_respuesta: string;
  num_pregunta?: number;
  opcion_respuesta?: string | string[];
  archivo_anexo?: string;
  nombre_anexo?: string;
}

export interface ValidationCache {
  [stepNumber: number]: boolean | undefined;
}

export type QuestionFieldMapping = Record<number, keyof FormState>;

export type StepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export type MonthKeyUI = "ene" | "feb" | "mar" | "abr" | "may" | "jun" | "jul" | "ago" | "sep" | "oct" | "nov" | "dic";

export type MonthKeyAPI = "enero" | "febrero" | "marzo" | "abril" | "mayo" | "junio" | "julio" | "agosto" | "septiembre" | "octubre" | "noviembre" | "diciembre";
