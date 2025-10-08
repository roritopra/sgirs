import type { Establecimiento } from '@/components/funcionario/residuos-aprovechables/EstablecimientosTablaCCU';
import { get } from '@/utils/shared/apiUtils';

const normalizar = (items: any[]): Establecimiento[] =>
  items.map((e) => {
    const nombre = e?.nombre ?? e?.establecimiento ?? '';
    const comunaNum = typeof e?.comuna === 'string' ? parseInt(e.comuna, 10) : Number(e?.comuna ?? 0);
    return {
      nombre: String(nombre),
      responsable: String(e?.responsable ?? ''),
      direccion: String(e?.direccion ?? ''),
      telefono: String(e?.telefono ?? ''),
      barrio: String(e?.barrio ?? ''),
      comuna: Number(isNaN(comunaNum) ? 0 : comunaNum),
      estado: 'sin_ccu',
      sector: e?.sector ? String(e.sector) : undefined,
    } satisfies Establecimiento;
  });

export type EstablecimientosSinGestorResponse = {
  page: number;
  limit: number;
  total: number;
  data: Establecimiento[];
};

// Endpoint: /api/v1/dashboard/ra/establecimientos-sin-gestor
export async function getEstablecimientosRASinGestor(params: {
  search?: string;
  page?: number;
  limit?: number; // default 20
  periodo?: string;
}): Promise<EstablecimientosSinGestorResponse> {
  const { search, page = 1, limit = 20, periodo } = params;
  const qs = new URLSearchParams();
  if (search) qs.set('search', search);
  qs.set('page', String(page));
  qs.set('limit', String(limit));
  if (periodo) qs.set('periodo', periodo);

  const url = `/api/v1/dashboard/ra/establecimientos-sin-gestor?${qs.toString()}`;
  const res = await get<{ page: number; limit: number; total: number; data: any[] } | any>(url);

  if (Array.isArray(res)) {
    const data = normalizar(res);
    return { page, limit, total: data.length, data };
  }

  const pageVal = typeof res?.page === 'number' ? res.page : page;
  const limitVal = typeof res?.limit === 'number' ? res.limit : limit;
  const totalVal = typeof res?.total === 'number' ? res.total : Array.isArray(res?.data) ? res.data.length : 0;
  const dataArr: any[] = Array.isArray(res?.data) ? res.data : [];

  return {
    page: pageVal,
    limit: limitVal,
    total: totalVal,
    data: normalizar(dataArr),
  };
}
