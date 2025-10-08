import { get } from '@/utils/shared/apiUtils';
import type { Comuna } from '@/components/funcionario/MapTableCard';

export interface DistribucionRcdComuna {
  comuna: string | number;
  cantidad: number;
  porcentaje?: number;
}

const normalizar = (items: any[]): Comuna[] =>
  items.map((item, index) => ({
    id: item?.id ?? index + 1,
    comuna: item?.comuna ?? `Comuna ${index + 1}`,
    cantidad: Number(item?.cantidad ?? 0),
    porcentaje: Number(item?.porcentaje ?? 0),
  }));

// Endpoint: /api/v1/dashboard/RCD/distribuccion-por-comuna
export async function getDistribucionRcdPorComuna(autorizado: boolean, options: { periodo?: string } = {}): Promise<Comuna[]> {
  const { periodo } = options;
  const base = `/api/v1/dashboard/RCD/distribuccion-por-comuna?autorizado=${autorizado}`;
  const url = periodo ? `${base}&periodo=${encodeURIComponent(periodo)}` : base;
  const res = await get<DistribucionRcdComuna[] | any>(url);

  const data = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
  return normalizar(data);
}
