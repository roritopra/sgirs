import { get } from '@/utils/shared/apiUtils';
import { mockDistribucionUsuarios } from '@/mock/distribucionUsuarios';

//endpoint
const ENDPOINT = '/api/v1/dashboard/ra/oro-vs-no-oro-ccu';

export type DistribucionUsuariosItem = {
  tipo: string;
  tiene_ccu: number;
  no_tiene_ccu: number;
};

export async function getDistribucionUsuarios(
  options: { periodo?: string; useMock?: boolean } = {}
): Promise<DistribucionUsuariosItem[]> {
  const { periodo, useMock = false } = options;
  if (useMock) return mockDistribucionUsuarios as DistribucionUsuariosItem[];
  const url = periodo ? `${ENDPOINT}?periodo=${encodeURIComponent(periodo)}` : ENDPOINT;
  return await get<DistribucionUsuariosItem[]>(url);
}
