import { get } from '@/utils/shared/apiUtils';

export type DistribucionUar = {
  tipo: string;
  cantidad: number;
};

// Endpoint: /api/v1/dashboard/uar/establecimientos-con-uar
export async function getDistribucionUar(options: { periodo?: string } = {}): Promise<DistribucionUar[]> {
  const { periodo } = options;
  const base = '/api/v1/dashboard/uar/establecimientos-con-uar';
  const url = periodo ? `${base}?periodo=${encodeURIComponent(periodo)}` : base;
  const res = await get<any>(url);

  if (Array.isArray(res)) {
    return res.map((r) => ({
      tipo: r?.tipo ?? '',
      cantidad: typeof r?.cantidad === 'number' ? r.cantidad : Number(r?.cantidad ?? 0),
    }));
  }

  const arr: any[] = Array.isArray(res?.data) ? res.data : [];
  return arr.map((r) => ({
    tipo: r?.tipo ?? '',
    cantidad: typeof r?.cantidad === 'number' ? r.cantidad : Number(r?.cantidad ?? 0),
  }));
}
