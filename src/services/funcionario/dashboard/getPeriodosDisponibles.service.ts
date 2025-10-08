import { get } from '@/utils/shared/apiUtils';

const ENDPOINT = '/api/v1/dashboard/periodos-disponibles';

export async function getPeriodosDisponibles(): Promise<string[]> {
  const res = await get<string[] | { periodos?: string[] }>(ENDPOINT);
  if (Array.isArray(res)) return res;
  if (res && Array.isArray((res as any).periodos)) return (res as any).periodos as string[];
  return [];
}
