import { get } from '@/utils/shared/apiUtils';

export type CardsRespelRaeeRcd = {
  est_rec_aut_respel: number;
  est_sin_rec_aut_respel: number;
  est_rec_aut_rcd: number;
  est_sin_rec_aut_rcd: number;
  est_rec_aut_raee: number;
  est_sin_rec_aut_raee: number;
  total_reportes: number;
};

// Endpoint: /api/v1/dashboard/cards/respel-raee-rcd
export async function getCardsRespelRaeeRcd(options: { periodo?: string } = {}): Promise<CardsRespelRaeeRcd> {
  const { periodo } = options;
  const base = '/api/v1/dashboard/cards/respel-raee-rcd';
  const url = periodo ? `${base}?periodo=${encodeURIComponent(periodo)}` : base;
  const res = await get<any>(url);

  const src = typeof res === 'object' && res && !Array.isArray(res) ? res : {};
  const obj = (src?.data && typeof src.data === 'object' ? src.data : src) as any;

  return {
    est_rec_aut_respel: Number(obj?.est_rec_aut_respel ?? 0),
    est_sin_rec_aut_respel: Number(obj?.est_sin_rec_aut_respel ?? 0),
    est_rec_aut_rcd: Number(obj?.est_rec_aut_rcd ?? 0),
    est_sin_rec_aut_rcd: Number(obj?.est_sin_rec_aut_rcd ?? 0),
    est_rec_aut_raee: Number(obj?.est_rec_aut_raee ?? 0),
    est_sin_rec_aut_raee: Number(obj?.est_sin_rec_aut_raee ?? 0),
    total_reportes: Number(obj?.total_reportes ?? 0),
  };
}
