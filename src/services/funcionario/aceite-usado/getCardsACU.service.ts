import { get } from '@/utils/shared/apiUtils';

export type CardsACU = {
  total_est_gen_acu: number;
  total_est_gen_acu_sin_gestor: number;
  total_est_gen_acu_con_gestor: number;
};

// Endpoint: /api/v1/dashboard/cards/acu
export async function getCardsACU(options: { periodo?: string } = {}): Promise<CardsACU> {
  const { periodo } = options;
  const base = '/api/v1/dashboard/cards/acu';
  const url = periodo ? `${base}?periodo=${encodeURIComponent(periodo)}` : base;
  const res = await get<any>(url);

  const src = typeof res === 'object' && res && !Array.isArray(res) ? res : {};
  const obj = (src?.data && typeof src.data === 'object' ? src.data : src) as any;

  return {
    total_est_gen_acu: Number(obj?.total_est_gen_acu ?? 0),
    total_est_gen_acu_sin_gestor: Number(obj?.total_est_gen_acu_sin_gestor ?? 0), 
    total_est_gen_acu_con_gestor: Number(obj?.total_est_gen_acu_con_gestor ?? 0),
  };
}
