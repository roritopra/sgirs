"use client";
import { ResponsiveBar } from "@nivo/bar";
import { useEffect, useMemo, useState } from "react";
import { getMetricasGestionResiduo, type RSOMetricas } from "@/services/funcionario/residuos-organicos/getMetricasGestionResiduo.service";

export default function RSOMetricasBar({ periodo }: { periodo?: string }) {
  const [data, setData] = useState<RSOMetricas | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await getMetricasGestionResiduo({ periodo });
        setData(res);
      } catch (e) {
        setData(null);
        setError("No se pudieron cargar las métricas de gestión de residuo");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [periodo]);

  const chartData = useMemo(() => {
    if (!data) return [] as Array<{ categoria: string; valor: number; color: string }>;
    return [
      { categoria: "Entrega a gestor", valor: data.entrega_gestor, color: "#7FB927" },
      { categoria: "Tratamiento in situ", valor: data.tratamiento_in_situ, color: "#8280FF" },
      { categoria: "No entrega", valor: data.no_entrega, color: "#B0F44A" },
    ];
  }, [data]);

  return (
    <div className="bg-white rounded-xl shadow-sm px-6 pt-6 pb-3 w-full relative" aria-busy={isLoading}>
      <div className="mb-5">
        <h2 className="text-base font-semibold text-gray-900">Métricas de gestión de residuo</h2>
        <p className="text-sm text-gray-500">Entrega a gestor, tratamiento in situ y no entrega</p>
      </div>
      <div className="h-[260px]">
        {isLoading && (
          <div className="absolute inset-0 z-[9999] bg-white/60 backdrop-blur-sm flex items-center justify-center" role="status" aria-live="polite" aria-label="Cargando métricas de gestión de residuo">
            <div className="h-9 w-9 rounded-full border-4 border-[#7FB927] border-t-transparent animate-spin" aria-hidden="true" />
          </div>
        )}
        {!isLoading && error && (
          <div className="p-2 text-center text-sm text-red-600" role="alert" aria-live="polite">{error}</div>
        )}
        {chartData.length > 0 && (
          <ResponsiveBar
            data={chartData}
            keys={["valor"]}
            indexBy="categoria"
            margin={{ top: 20, right: 30, bottom: 70, left: 45 }}
            padding={0.4}
            layout="vertical"
            colors={({ data }) => (data as any).color}
            enableGridX={false}
            enableGridY={true}
            enableLabel={false}
            axisLeft={{
              legend: "Usuarios",
              legendPosition: "middle",
              legendOffset: -38,
            }}
            axisBottom={{
              renderTick: (tick) => {
                const width = 120;
                const height = 60;
                return (
                  <g transform={`translate(${tick.x},${tick.y})`}>
                    <foreignObject x={-width / 2} y={8} width={width} height={height}>
                      <div style={{ width, height, textAlign: "center", whiteSpace: "normal", wordWrap: "break-word", lineHeight: "1.1" }}>
                        <span style={{ display: "inline-block", maxWidth: width }}>{String(tick.value)}</span>
                      </div>
                    </foreignObject>
                  </g>
                );
              },
            }}
            tooltip={({ indexValue, value }) => (
              <div className="bg-white border text-sm px-3 py-1 rounded shadow w-55">
                {indexValue}: <strong>{value as number}</strong>
              </div>
            )}
          />
        )}
      </div>
    </div>
  );
}
