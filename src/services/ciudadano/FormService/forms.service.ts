import { get, post, patch } from "@/utils/shared/apiUtils";
import type {
  FormVerification,
  ResponseAnswer,
  CreateFormRequest,
  PatchAnswersRequest,
  CompleteFormRequest,
} from "@/types/ciudadano/form.types";

// Verificar si existe formulario para el periodo (usuario actual por token)
export function verifyFormForPeriod(periodId: string): Promise<FormVerification[]> {
  return get<FormVerification[]>(
    `/api/v1/respuestas-usuario/respuestas-usuario/verificar-si-hay-formulario-creado-para-periodo/${periodId}`
  );
}

// Obtener respuestas guardadas (para reanudar o solo lectura si completado)
export function getFormAnswersByPeriod(periodId: string): Promise<ResponseAnswer[]> {
  return get<ResponseAnswer[]>(
    `/api/v1/respuestas-usuario/respuestas-usuario/${periodId}/mostrar-respuestas-a-preguntas-y-archivos-añadidos`
  );
}

// Crear formulario (primer guardado parcial cuando no existe todavía)
export function createForm(payload: CreateFormRequest): Promise<any> {
  return post<any>(`/api/v1/encuesta-estado/`, payload);
}

// Editar/agregar respuestas cuando ya existe formulario (PATCH por array)
export function patchFormAnswers(
  userId: string,
  periodId: string,
  payload: PatchAnswersRequest
): Promise<any> {
  return patch<any>(
    `/api/v1/encuesta-estado/${userId}/${periodId}`,
    payload
  );
}

// Completar el formulario (no más ediciones a partir de aquí)
export function completeForm(payload: CompleteFormRequest): Promise<any> {
  return post<any>(
    `/api/v1/respuestas-usuario/respuestas-usuario/completar`,
    payload
  );
}

// Subir archivos (multipart/form-data) para respuestas de usuario
export function uploadAnswerFiles(periodId: string, formData: FormData): Promise<any> {
  return post<any>(
    `/api/v1/respuestas-usuario/respuestas-usuario/subir-archivos-respuestas-usuario?periodo_encuesta=${periodId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
}
