import { post, get } from "@/utils/shared/apiUtils";

export interface IndicatorVariable {
  nombre_variable: string;
}

export interface IndicatorQuestion {
  pregunta: string;
  posibles_respuestas: string[];
}

export interface DynamicIndicator {
  num_indicador: number;
  nombre_indicador: string;
  es_uar: boolean;
  variables?: IndicatorVariable[];
  preguntas?: IndicatorQuestion[];
}

export interface IndicatorRequest {
  respuestas: Array<{
    id_pregunta: string;
    id_opcion_respuesta: string;
  }>;
}

export const obtenerIndicadoresPorRespuestas = async (
  request: IndicatorRequest
): Promise<DynamicIndicator[]> => {
  try {
    const response = await post<DynamicIndicator[]>(
      "/api/v1/indicadores/obtener-por-respuestas",
      request
    );
    return response;
  } catch (error) {
    console.error("Error obteniendo indicadores:", error);
    throw error;
  }
};

// Payload para subir respuestas de indicadores
export type RespuestaPorMes = {
  enero: number;
  febrero: number;
  marzo: number;
  abril: number;
  mayo: number;
  junio: number;
  julio: number;
  agosto: number;
  septiembre: number;
  octubre: number;
  noviembre: number;
  diciembre: number;
};

export interface IndicatorsSubmitVariable {
  nombre_variable: string;
  respuesta_por_mes: RespuestaPorMes;
}

export interface IndicatorsSubmitItemVariables {
  nombre_indicador: string;
  variables: IndicatorsSubmitVariable[];
}

export interface IndicatorsSubmitItemPreguntas {
  nombre_indicador: string;
  respuestas: { pregunta: string; respuesta: string }[];
}

export type IndicatorsSubmitItem =
  | IndicatorsSubmitItemVariables
  | IndicatorsSubmitItemPreguntas;

export interface SubmitIndicatorsRequest {
  periodo_encuesta_id: string;
  respuestas: IndicatorsSubmitItem[];
}

export const submitIndicators = async (
  payload: SubmitIndicatorsRequest
): Promise<any> => {
  try {
    return await post<any>("/api/v1/indicadores/subir-respuestas", payload);
  } catch (error) {
    console.error("Error enviando indicadores:", error);
    throw error;
  }
};

export const submitIndicatorsPartial = async (
  payload: SubmitIndicatorsRequest
): Promise<any> => {
  try {
    return await post<any>(
      "/api/v1/indicadores/subir-respuestas-parciales",
      payload
    );
  } catch (error) {
    console.error("Error enviando indicadores parciales:", error);
    throw error;
  }
};

// Obtener respuestas parciales guardadas de indicadores para prellenar el Step 13
export const getPartialIndicators = async (
  periodId: string
): Promise<any> => {
  try {
    return await get<any>(
      `/api/v1/indicadores/respuestas-parciales/${encodeURIComponent(periodId)}`
    );
  } catch (error) {
    console.error("Error obteniendo indicadores parciales:", error);
    throw error;
  }
};

// Respuestas finales de indicadores por periodo
export interface IndicatorsAnswerVariable {
  nombre_variable: string;
  respuesta_por_mes: RespuestaPorMes;
}

export interface IndicatorsAnswerItemVariables {
  nombre_indicador: string;
  variables: IndicatorsAnswerVariable[];
}

export interface IndicatorsAnswerItemPreguntas {
  nombre_indicador: string;
  respuestas: { pregunta: string; respuesta: string }[];
}

export type IndicatorsAnswerItem =
  | IndicatorsAnswerItemVariables
  | IndicatorsAnswerItemPreguntas;

export interface IndicatorsAnswersResponse {
  periodo_encuesta_id: string;
  respuestas: IndicatorsAnswerItem[];
}

export const getIndicatorsAnswers = async (
  periodId: string
): Promise<IndicatorsAnswersResponse> => {
  try {
    return await get<IndicatorsAnswersResponse>(
      `/api/v1/indicadores/respuestas/${encodeURIComponent(periodId)}`
    );
  } catch (error) {
    console.error("Error obteniendo respuestas de indicadores:", error);
    throw error;
  }
};
