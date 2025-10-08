import { get } from '@/utils/shared/apiUtils';

export type DistribucionACU = {
  tipo: 'Tiene gestor' | 'No tiene gestor' | string;
  cantidad: number;
};

export async function getDistribucionEstablecimientosACU(options: { periodo?: string } = {}): Promise<DistribucionACU[]> {
  const { periodo } = options;
  const base = '/api/v1/dashboard/acu/distribuccion-establecimientos';
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
