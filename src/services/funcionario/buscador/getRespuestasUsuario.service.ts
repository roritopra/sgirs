import { get } from '@/utils/shared/apiUtils';

export type RespuestaUsuarioItem = {
  id: string;
  pregunta: string;
  num_pregunta: string;
  opcion_respuesta: string;
  archivo_anexo: string | null;
  archivo_url: string | null;
};

export type CiudadanoSectorEstrategicoDetalle = {
  nombre: string;
  establecimiento: string;
  nit: string;
  direccion: string;
  email: string;
  num_cel: string;
};

export type FormularioDetalle = {
  id_encuesta: string;
  periodo_encuesta: string;
  completado: boolean;
  updated_at: string;
  respuestas_usuario: RespuestaUsuarioItem[];
};

export type RespuestasUsuarioResponse = {
  ciudadano_sector_estrategico: CiudadanoSectorEstrategicoDetalle;
  formulario: FormularioDetalle;
};

export async function getRespuestasUsuario(
  nit: string, 
  idPeriodoEncuesta: string
): Promise<RespuestasUsuarioResponse> {
  const endpoint = `/api/v1/respuestas-usuario/respuestas-usuario/${nit}/respuestas/${idPeriodoEncuesta}`;
  return await get<RespuestasUsuarioResponse>(endpoint);
}
