import { get } from '@/utils/shared/apiUtils';

export type EstablecimientoTabla = {
  id?: string;
  nombre: string;
  responsable: string;
  direccion: string;
  telefono: string;
  barrio: string;
  comuna: string | number;
  sector: string;
};

export type EstablecimientosTablaResponse = {
  page: number;
  limit: number;
  total: number;
  data: EstablecimientoTabla[];
};

function normalize(item: any): EstablecimientoTabla {
  const nombre = item?.nombre ?? item?.establecimiento ?? '';
  return {
    id: item?.id,
    nombre,
    responsable: item?.responsable ?? '',
    direccion: item?.direccion ?? '',
    telefono: item?.telefono ?? '',
    barrio: item?.barrio ?? '',
    comuna: item?.comuna ?? '',
    sector: item?.sector ?? '',
  };
}

// Endpoint: /api/v1/dashboard/rv/establecimientos-generan-rv
export async function getEstablecimientosRvTabla(params: {
  search?: string;
  page?: number;
  limit?: number;
  periodo?: string;
}): Promise<EstablecimientosTablaResponse> {
  const { search, page = 1, limit = 20, periodo } = params;
  const qs = new URLSearchParams();
  if (search) qs.set('search', search);
  if (page) qs.set('page', String(page));
  if (limit) qs.set('limit', String(limit));
  if (periodo) qs.set('periodo', periodo);

  const url = `/api/v1/dashboard/rv/establecimientos-generan-rv?${qs.toString()}`;
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
