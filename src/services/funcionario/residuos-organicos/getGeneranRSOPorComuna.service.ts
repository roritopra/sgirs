import { get } from '@/utils/shared/apiUtils';

const ENDPOINT = '/api/v1/dashboard/rso/generan-rso-por-comuna';

export type RSOComunaApiItem = {
  comuna: string; // e.g. "14"
  entrega: number;
  no_entrega: number;
};

export async function getGeneranRSOPorComuna(options: { periodo?: string } = {}): Promise<RSOComunaApiItem[]> {
  const { periodo } = options;
  const url = periodo ? `${ENDPOINT}?periodo=${encodeURIComponent(periodo)}` : ENDPOINT;
  return await get<RSOComunaApiItem[]>(url);
}
