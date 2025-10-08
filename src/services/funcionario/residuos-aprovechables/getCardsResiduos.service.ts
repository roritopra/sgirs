import { mockCardsResiduos } from '@/mock/cardsResiduos';
import { get } from '@/utils/shared/apiUtils';

const ENDPOINT = '/api/v1/dashboard/ra/cards-residuos-aprovechables';

export type CardsResiduos = {
  est_aprov_res: number;
  est_gen_res_aprov_no_gestor: number;
  est_gest_no_oro: number;
  est_gest_oro: number;
};

export async function getCardsResiduos(
  options: { periodo?: string; useMock?: boolean } = {}
): Promise<CardsResiduos> {
  const { periodo, useMock = false } = options;
  if (useMock) return mockCardsResiduos as CardsResiduos;

  const url = periodo
    ? `${ENDPOINT}?periodo=${encodeURIComponent(periodo)}`
    : ENDPOINT;
  return await get<CardsResiduos>(url);
}
