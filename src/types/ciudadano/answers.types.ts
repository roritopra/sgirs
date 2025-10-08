export type RespuestaUsuarioPayload = {
  id_pregunta: string;
  id_usuario: string;
  id_opcion_respuesta: string | null;
  id_periodo_encuesta: string;
  archivo_anexo?: string;
};

export type PeriodoActivo = {
  id: string;
  periodo?: string;
  status?: boolean;
  activo?: boolean;
};

export type BulkSaveRequest = {
  respuestas: RespuestaUsuarioPayload[];
};
