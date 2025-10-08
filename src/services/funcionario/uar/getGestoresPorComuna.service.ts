import { get } from '@/utils/shared/apiUtils';

export type GestorComunas = {
  gestor: string;
  comunas_presencia: Array<string | number>;
};

// Endpoint: /api/v1/dashboard/gestores/oro-por-comuna
export async function getGestoresPorComuna(options: { periodo?: string } = {}): Promise<GestorComunas[]> {
  const { periodo } = options;
  const base = '/api/v1/dashboard/gestores/oro-por-comuna';
  const url = periodo ? `${base}?periodo=${encodeURIComponent(periodo)}` : base;
  const res = await get<any>(url);

  if (Array.isArray(res)) {
    return res.map((r) => ({
      gestor: String(r?.gestor ?? ''),
      comunas_presencia: Array.isArray(r?.comunas_presencia) ? r.comunas_presencia : [],
    }));
  }

  const arr: any[] = Array.isArray(res?.data) ? res.data : [];
  return arr.map((r) => ({
    gestor: String(r?.gestor ?? ''),
    comunas_presencia: Array.isArray(r?.comunas_presencia) ? r.comunas_presencia : [],
  }));
}
