import { get } from '@/utils/shared/apiUtils';
import type { Comuna } from '@/components/funcionario/MapTableCard';

// Endpoint: /api/v1/dashboard/comuna/establecimientos
// Response ejemplo:
// [ { id: 1, comuna: 'Comuna 14', cantidad: 7, porcentaje: 9.33 }, ... ]
export async function getDistribucionPorComunaSinGestor(options: { periodo?: string; tipo_residuo?: string } = {}): Promise<Comuna[]> {
  const { periodo, tipo_residuo } = options;
  const base = '/api/v1/dashboard/comuna/establecimientos';
  const qs = new URLSearchParams();
  if (periodo) qs.set('periodo', periodo);
  if (tipo_residuo) qs.set('tipo_residuo', tipo_residuo);
  const url = qs.toString() ? `${base}?${qs.toString()}` : base;
  const res = await get<any>(url);

  const arr: any[] = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

  return arr.map((r, idx) => {
    const id = typeof r?.id === 'number' ? r.id : idx + 1;
    const comunaStr: string = String(r?.comuna ?? '').toLowerCase();
    const comunaNumMatch = comunaStr.match(/(\d{1,2})$/);
    const comunaNum = comunaNumMatch ? Number(comunaNumMatch[1]) : Number(r?.comuna ?? 0);
    const porcentaje = typeof r?.porcentaje === 'number' ? r.porcentaje : Number(r?.porcentaje ?? 0);

    return {
      id,
      comuna: comunaNum,
      cantidad: Number(r?.cantidad ?? 0),
      porcentaje, // ya viene en 0-100
    } as Comuna;
  });
}
