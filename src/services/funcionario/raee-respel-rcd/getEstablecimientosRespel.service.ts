import { get } from '@/utils/shared/apiUtils';

export interface EstablecimientoRespel {
  id?: string;
  nombre: string;
  responsable: string;
  direccion: string;
  telefono: string;
  barrio: string;
  comuna: number | string;
  estado?: 'gestor_aut' | 'gestor_no_aut';
  sector?: string;
}

export interface EstablecimientosRespelResponse {
  data: EstablecimientoRespel[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetEstablecimientosRespelParams {
  search?: string;
  estado?: 'gestor_aut' | 'gestor_no_aut';
  page?: number;
  limit?: number;
  periodo?: string;
}

const normalize = (item: any, params?: GetEstablecimientosRespelParams): EstablecimientoRespel => ({
  id: String(item?.id ?? ''),
  nombre: String(
    item?.nombre ??
      item?.establecimiento ??
      item?.nombre_establecimiento ??
      item?.razon_social ??
      item?.razón_social ??
      '(Sin nombre)'
  ),
  responsable: String(item?.responsable ?? item?.contacto ?? item?.representante ?? ''),
  direccion: String(item?.direccion ?? item?.dirección ?? item?.dir ?? ''),
  telefono: String(item?.telefono ?? item?.teléfono ?? item?.celular ?? item?.tel ?? ''),
  barrio: String(item?.barrio ?? ''),
  sector: item?.sector ? String(item.sector) : undefined,
  comuna: (() => {
    const raw = item?.comuna ?? item?.id_comuna ?? item?.numero_comuna;
    if (raw === null || raw === undefined) return '';
    if (typeof raw === 'string' && raw.trim().toLowerCase().startsWith('comuna')) return raw;
    const num = Number(raw);
    if (typeof raw === 'number') return Number.isNaN(raw) ? '' : raw;
    return Number.isFinite(num) && !Number.isNaN(num) ? num : String(raw);
  })(),
  estado: (() => {
    const raw = String(item?.estado ?? '').toLowerCase();
    if (raw.includes('aut')) return 'gestor_aut';
    if (raw.includes('sin')) return 'gestor_no_aut';
    return (params?.estado as any) || undefined;
  })(),
});

export async function getEstablecimientosRespel(
  params?: GetEstablecimientosRespelParams
): Promise<EstablecimientosRespelResponse> {
  const sp = new URLSearchParams();
  if (params?.search) sp.append('search', params.search);
  if (params?.estado) sp.append('estado', params.estado);
  if (params?.page) sp.append('page', String(params.page));
  if (params?.limit) sp.append('limit', String(params.limit));
  if (params?.periodo) sp.append('periodo', params.periodo);

  const url = `/api/v1/dashboard/RESPEL/recolecciones/establecimientos${sp.toString() ? `?${sp.toString()}` : ''}`;
  const res = await get<any>(url);

  if (Array.isArray(res)) {
    const arr = (res as any[]).map((i) => normalize(i, params));
    const limit = params?.limit || 20;
    const page = params?.page || 1;
    return {
      data: arr,
      total: arr.length,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(arr.length / limit)),
    };
  }

  if (res && Array.isArray(res.data)) {
    const data = (res.data as any[]).map((i) => normalize(i, params));
    return {
      data,
      total: Number(res.total ?? data.length),
      page: Number(res.page ?? params?.page ?? 1),
      limit: Number(res.limit ?? params?.limit ?? 20),
      totalPages: Number(res.totalPages ?? Math.max(1, Math.ceil((res.total ?? data.length) / (res.limit ?? params?.limit ?? 20)))),
    };
  }

  return {
    data: [],
    total: 0,
    page: params?.page || 1,
    limit: params?.limit || 20,
    totalPages: 1,
  };
}
