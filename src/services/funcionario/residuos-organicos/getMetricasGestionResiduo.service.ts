import { get } from '@/utils/shared/apiUtils';

export type RSOMetricas = {
  entrega_gestor: number;
  tratamiento_in_situ: number;
  no_entrega: number;
};

export async function getMetricasGestionResiduo(params?: { periodo?: string }): Promise<RSOMetricas> {
  const qs = new URLSearchParams();
  if (params?.periodo) qs.set('periodo', params.periodo);
  const url = `/api/v1/dashboard/rso/metricas-gestion-residuo?${qs.toString()}`;
  const res = await get<any>(url);
  return {
    entrega_gestor: Number(res?.entrega_gestor ?? 0),
    tratamiento_in_situ: Number(res?.tratamiento_in_situ ?? 0),
    no_entrega: Number(res?.no_entrega ?? 0),
  };
}
