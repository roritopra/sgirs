import { get } from '@/utils/shared/apiUtils';

const ENDPOINT = '/api/v1/buscador/establecimientos';

export type SearchEstablecimientosParams = {
  page: number;
  limit: number;
  search: string;
  buscar_por: 'nombre' | 'nit' | 'email';
};

export type EstablecimientoApiItem = {
  id: string;
  establecimiento: string;
  responsable: string;
  direccion: string;
  telefono: string;
  nit: string;
};

export type SearchEstablecimientosResponse = {
  data: EstablecimientoApiItem[];
  total: number;
  page: number;
  limit: number;
};

export async function searchEstablecimientos(
  params: SearchEstablecimientosParams
): Promise<SearchEstablecimientosResponse> {
  const searchParams = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
    search: params.search,
    buscar_por: params.buscar_por,
  });

  return await get<SearchEstablecimientosResponse>(`${ENDPOINT}?${searchParams}`);
}
