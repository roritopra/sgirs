import { get } from '@/utils/shared/apiUtils';

export type DistribucionVoluminosos = {
  tipo: 'Conocen' | 'No conocen' | string;
  cantidad: number;
};

// Endpoint: /api/v1/dashboard/rv/conocen-linea
export async function getDistribucionVoluminosos(options: { periodo?: string } = {}): Promise<DistribucionVoluminosos[]> {
  const { periodo } = options;
  const base = '/api/v1/dashboard/rv/conocen-linea';
  const url = periodo ? `${base}?periodo=${encodeURIComponent(periodo)}` : base;
  const res = await get<any>(url);

  if (Array.isArray(res)) {
    return res.map((r) => ({
      tipo: r?.tipo ?? '',
      cantidad: typeof r?.cantidad === 'number' ? r.cantidad : Number(r?.cantidad ?? 0),
    }));
  }

  if (Array.isArray(res?.data)) {
    return res.data.map((r: any) => ({
      tipo: r?.tipo ?? '',
      cantidad: typeof r?.cantidad === 'number' ? r.cantidad : Number(r?.cantidad ?? 0),
    }));
  }

  return [];
}
