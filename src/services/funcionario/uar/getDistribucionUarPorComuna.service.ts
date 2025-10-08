import { get } from '@/utils/shared/apiUtils';

export interface DistribucionUarComuna {
  comuna: string;
  tiene_uar: number;
  no_tiene_uar: number;
}

export interface DistribucionUarComunaNormalizada {
  comuna: string;
  'Tiene UAR': number;
  'No tiene UAR': number;
  [key: string]: string | number; // Firma de índice para compatibilidad con BarDatum
}

const normalizar = (items: DistribucionUarComuna[]): DistribucionUarComunaNormalizada[] =>
  items.map((item) => ({
    comuna: `Comuna ${item.comuna}`,
    'Tiene UAR': item.tiene_uar,
    'No tiene UAR': item.no_tiene_uar,
  }));

// Endpoint: /api/v1/dashboard/uar/distribucion-por-comuna
export async function getDistribucionUarPorComuna(options: { periodo?: string } = {}): Promise<DistribucionUarComunaNormalizada[]> {
  const { periodo } = options;
  const base = '/api/v1/dashboard/uar/distribucion-por-comuna';
  const url = periodo ? `${base}?periodo=${encodeURIComponent(periodo)}` : base;
  const res = await get<DistribucionUarComuna[]>(url);
  
  const data = Array.isArray(res) ? res : [];
  return normalizar(data);
}
