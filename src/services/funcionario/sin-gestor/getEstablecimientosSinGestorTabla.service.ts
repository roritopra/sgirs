import { get } from '@/utils/shared/apiUtils';
import type { Establecimiento } from '@/components/funcionario/EstablecimientosTabla';

export type EstablecimientosTablaResponse = {
  page: number;
  limit: number;
  total: number;
  data: Establecimiento[];
};

function normalize(item: any): Establecimiento {
  const nombre = item?.nombre ?? item?.establecimiento ?? '';
  return {
    nombre,
    responsable: item?.responsable ?? '',
    direccion: item?.direccion ?? '',
    telefono: item?.telefono ?? '',
    barrio: item?.barrio ?? '',
    comuna: item?.comuna ?? '',
    sector: item?.sector ?? '',
  };
}

// Endpoint: /api/v1/dashboard/comuna/establecimientos/table
export async function getEstablecimientosSinGestorTabla(params: {
  search?: string;
  page?: number;
  limit?: number; // default 20
  periodo?: string;
  tipo_residuo?: string;
}): Promise<EstablecimientosTablaResponse> {
  const { search, page = 1, limit = 20, periodo, tipo_residuo } = params;
  const qs = new URLSearchParams();
  if (search) qs.set('search', search);
  if (page) qs.set('page', String(page));
  if (limit) qs.set('limit', String(limit));
  if (periodo) qs.set('periodo', periodo);
  if (tipo_residuo) qs.set('tipo_residuo', tipo_residuo);

  const url = `/api/v1/dashboard/comuna/establecimientos/table?${qs.toString()}`;
  const res = await get<any>(url);

  if (Array.isArray(res)) {
    const data = (res as any[]).map(normalize);
    return { data, page, limit, total: data.length };
  }

  const dataArr: any[] = Array.isArray(res?.data) ? res.data : [];
  return {
    page: typeof res?.page === 'number' ? res.page : page,
    limit: typeof res?.limit === 'number' ? res.limit : limit,
    total: typeof res?.total === 'number' ? res.total : dataArr.length,
    data: dataArr.map(normalize),
  };
}
