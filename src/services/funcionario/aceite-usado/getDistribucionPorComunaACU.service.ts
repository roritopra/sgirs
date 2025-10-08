import { get } from '@/utils/shared/apiUtils';
import type { Comuna } from '@/components/funcionario/MapTableCard';

// Normaliza el endpoint de ACU al formato requerido por MapTableCard
// Endpoint: /api/v1/dashboard/acu/distribuccion-por-comuna
// Response ejemplo:
// [ { posicion: 1, comuna: 14, cantidad: 4, porcentaje: 0.4 }, ... ]
export async function getDistribucionPorComunaACU(options: { periodo?: string } = {}): Promise<Comuna[]> {
  const { periodo } = options;
  const base = '/api/v1/dashboard/acu/distribuccion-por-comuna';
  const url = periodo ? `${base}?periodo=${encodeURIComponent(periodo)}` : base;
  const res = await get<any>(url);

  const arr: any[] = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

  return arr.map((r, idx) => {
    const posicion = typeof r?.posicion === 'number' ? r.posicion : idx + 1;
    const porcentajeRaw = typeof r?.porcentaje === 'number' ? r.porcentaje : Number(r?.porcentaje ?? 0);

    return {
      id: posicion,
      comuna: Number(r?.comuna ?? 0),
      cantidad: Number(r?.cantidad ?? 0),
      porcentaje: porcentajeRaw <= 1 ? porcentajeRaw * 100 : porcentajeRaw, // MapTableCard espera 0-100
    } as Comuna;
  });
}
