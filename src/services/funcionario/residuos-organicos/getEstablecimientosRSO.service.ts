import { get } from '@/utils/shared/apiUtils';

const ENDPOINT = '/api/v1/dashboard/rso/generan-rso-establecimientos';

export type EstadoRSO = 'entregan' | 'no_entregan';

export type RSOEstablecimiento = {
  nombre: string;
  responsable: string;
  direccion: string;
  telefono: string;
  barrio: string;
  comuna: string | number;
  estado?: string;
  entrega?: boolean;
  sector?: string;
};

export type RSOEstablecimientosResponse = {
  data: RSOEstablecimiento[];
  page: number;
  limit: number;
  total: number;
};

export async function getEstablecimientosRSO(params: {
  estado?: EstadoRSO; // 'entregan' | 'no_entregan'
  search?: string;
  page?: number; // >=1
  limit?: number; // default 20
  periodo?: string;
}): Promise<RSOEstablecimientosResponse> {
  const { estado, search, page = 1, limit = 20, periodo } = params || {};

  const query = new URLSearchParams();
  if (estado) query.set('estado', estado);
  if (search) query.set('search', search);
  if (page) query.set('page', String(page));
  if (limit) query.set('limit', String(limit));
  if (periodo) query.set('periodo', periodo);

  const url = `${ENDPOINT}?${query.toString()}`;
  const res = await get<any>(url);

  const normalize = (item: any): RSOEstablecimiento => {
    const nombre: string =
      item?.nombre ?? item?.establecimiento ?? item?.nombre_establecimiento ?? '';
    const responsable: string =
      item?.responsable ?? item?.nombre_responsable ?? item?.contacto ?? '';
    const direccion: string = item?.direccion ?? item?.dirección ?? item?.address ?? '';
    const telefono: string = item?.telefono ?? item?.tel ?? '';
    const barrio: string = item?.barrio ?? '';
    const comuna: string | number = item?.comuna ?? item?.cod_comuna ?? item?.comuna_id ?? '';
    const estado: string | undefined =
      item?.estado ?? (typeof item?.entrega === 'boolean' ? (item.entrega ? 'entregan' : 'no_entregan') : undefined);
    const entrega: boolean | undefined =
      typeof item?.entrega === 'boolean'
        ? item.entrega
        : (typeof estado === 'string' ? estado === 'entregan' : undefined);

    const sector: string | undefined = item?.sector ? String(item.sector) : undefined;

    return { nombre, responsable, direccion, telefono, barrio, comuna, estado, entrega, sector };
  };

  if (Array.isArray(res)) {
    const mapped = (res as any[]).map(normalize);
    return { data: mapped, page, limit, total: mapped.length };
  }

  // Soportar distintas formas de payload: data, establecimientos
  const arr: any[] | undefined =
    (res && Array.isArray(res.data) && res.data) ||
    (res && Array.isArray(res.establecimientos) && res.establecimientos) ||
    undefined;

  if (arr) {
    const mapped = arr.map(normalize);
    const total = typeof res.total === 'number' ? res.total : mapped.length;
    const currentPage = typeof res.page === 'number' ? res.page : page;
    const currentLimit = typeof res.limit === 'number' ? res.limit : limit;
    return { data: mapped, page: currentPage, limit: currentLimit, total };
  }

  return { data: [], page, limit, total: 0 };
}
