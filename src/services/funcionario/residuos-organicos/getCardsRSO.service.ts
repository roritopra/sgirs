import { get } from '@/utils/shared/apiUtils';

export type CardsRSO = {
  est_generan_rso: number;
  est_con_compostaje: number;
  est_sin_gestion: number;
};

// Endpoint: /api/v1/dashboard/rso/cards-rso
export async function getCardsRSO(options: { periodo?: string } = {}): Promise<CardsRSO> {
  const { periodo } = options;
  const base = '/api/v1/dashboard/rso/cards-rso';
  const url = periodo ? `${base}?periodo=${encodeURIComponent(periodo)}` : base;
  const res = await get<any>(url);

  const src = typeof res === 'object' && res && !Array.isArray(res) ? res : {};
  const obj = (src?.data && typeof src.data === 'object' ? src.data : src) as any;

  return {
    est_generan_rso: Number(obj?.est_generan_rso ?? obj?.est_rso ?? 0),
    est_con_compostaje: Number(obj?.est_con_compostaje ?? obj?.est_compostaje ?? 0),
    est_sin_gestion: Number(obj?.est_sin_gestion ?? 0),
  };
}
