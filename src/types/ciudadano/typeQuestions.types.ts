export interface TipoPregunta {
  id: string;
  tipo_pregunta: string;
  status: boolean;
}

export interface Pregunta {
  id: string;
  id_tipo_pregunta: string;
  num_pregunta: number;
  contenido_pregunta: string;
  anexo: boolean;
  status: boolean;
}

export interface OpcionRespuesta {
  id: string;
  id_pregunta: string;
  orden_opcion: number;
  opcion_respuesta: string;
  anexo_requerido: boolean;
  status: boolean;
}

export type DynamicOption = { key: string; label: string };
export type DynamicType =
  | "S/No"
  | "Lista desplegable"
  | "Texto"
  | "Opciones"
  | "Anexar";

export interface DynamicQuestion {
  id: string;
  questionNumber: string;
  text: string;
  type: DynamicType;
  options?: DynamicOption[];
  allowAttachment?: boolean;
  optionRequiresAttachment?: Record<string, boolean>;
}
