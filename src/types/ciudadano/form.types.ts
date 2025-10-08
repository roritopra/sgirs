export interface FormVerification {
  id_periodo_encuesta: string;
  periodo_encuesta: string;
  completado: boolean;
  updated_at: string;
}

export interface ResponseAnswer {
  id_pregunta: string;
  id_opcion_respuesta: string;
  archivo_anexo?: string | null;
  fecha_respuesta: string;
  status: string;
}

export interface CreateFormRequest {
  usuario_id: string;
  encuesta_id: string; // id_periodo_encuesta
  status: string; // "no completado"
  respuestas: CreateOrPatchAnswer[];
}

export type CreateOrPatchAnswer = {
  id_pregunta: string;
  id_opcion_respuesta: string;
  id_periodo_encuesta: string;
  archivo_anexo?: string | null;
  fecha_respuesta: string;
  status: string; // "no completado" | "no completada" | ...
};

export type PatchAnswersRequest = CreateOrPatchAnswer[]; // se envía como array

export interface CompleteFormRequest {
  usuario_id: string;
  encuesta_id: string; // id_periodo_encuesta
  respuestas: CompleteAnswer[];
}

export interface CompleteAnswer {
  id_pregunta: string;
  id_usuario: string;
  id_opcion_respuesta: string;
  id_periodo_encuesta: string;
}
