import { mockComunasOro } from '@/mock/comunasOro';
import { get } from '@/utils/shared/apiUtils';

export type RankingComuna = {
  id?: number;
  comuna: number;
  cantidad: number;
  porcentaje: number;
};

const ENDPOINT = '/api/v1/dashboard/ra/ranking-por-comuna';

export async function getRankingPorComuna(
  tipoGestor: 'oro' | 'no_oro' | 'gen_res_aprov' = 'oro',
  useMockOrOptions: boolean | { periodo?: string; useMock?: boolean } = false
): Promise<RankingComuna[]> {
  const useMock = typeof useMockOrOptions === 'boolean' ? useMockOrOptions : Boolean(useMockOrOptions.useMock);
  const periodo = typeof useMockOrOptions === 'object' ? useMockOrOptions.periodo : undefined;

  if (useMock) {
    return mockComunasOro as RankingComuna[];
  }

  const qs = new URLSearchParams();
  qs.set('tipo_gestor', tipoGestor);
  if (periodo) qs.set('periodo', periodo);

  const url = `${ENDPOINT}?${qs.toString()}`;
  return await get<RankingComuna[]>(url);
}

// Compatibilidad hacia atrás si aún se usa en otras partes
export async function getComunasOro(useMock: boolean = false) {
  return getRankingPorComuna('oro', useMock);
}
