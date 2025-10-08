import { get } from '@/utils/shared/apiUtils';

export interface RSOComunaPorcentaje {
  id: number;
  comuna: number;
  cantidad: number;
  porcentaje: number;
}

function normalizeItem(item: any): RSOComunaPorcentaje {
  const id = Number(item?.posicion ?? item?.id ?? 0);
  const comunaRaw = item?.comuna;
  const comunaNum = typeof comunaRaw === 'string' ? parseInt(comunaRaw, 10) : Number(comunaRaw ?? 0);
  return {
    id: Number.isFinite(id) ? id : 0,
    comuna: Number.isFinite(comunaNum) ? comunaNum : 0,
    cantidad: Number(item?.cantidad ?? 0),
    porcentaje: Number(item?.porcentaje ?? 0),
  };
}

export async function getGeneranRsoPorComunaPorcentaje(params?: { periodo?: string }): Promise<RSOComunaPorcentaje[]> {
  const qs = new URLSearchParams();
  if (params?.periodo) qs.set('periodo', params.periodo);
  const url = `/api/v1/dashboard/rso/generan-rso-por-comuna-porcentaje?${qs.toString()}`;
  const res = await get<any>(url);
  if (Array.isArray(res)) return res.map(normalizeItem);
  if (res && Array.isArray(res.data)) return res.data.map(normalizeItem);
  return [];
}
