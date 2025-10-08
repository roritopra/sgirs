import { get } from '@/utils/shared/apiUtils';

export type PeriodoItem = {
  id_periodo_encuesta: string;
  periodo: string;
};

export type CiudadanoSectorEstrategico = {
  id: string;
  nombre: string;
  establecimiento: string;
  nit: string;
  email: string;
};

export type PeriodosEstablecimientoResponse = {
  ciudadano_sector_estrategico: CiudadanoSectorEstrategico;
  periodos: PeriodoItem[];
};

export async function getPeriodosEstablecimiento(nit: string): Promise<PeriodosEstablecimientoResponse> {
  const endpoint = `/api/v1/periodos-encuesta/${nit}/periodos`;
  return await get<PeriodosEstablecimientoResponse>(endpoint);
}
