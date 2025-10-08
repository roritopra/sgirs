import { Button, Card, CardBody, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { DocumentTextIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useFormContext } from "./FormContext";
import { useEffect, useMemo, useState } from "react";
import { getOpcionesRespuesta, getPreguntaPorNumero } from "@/services/ciudadano/FormService/questions.service";
import { obtenerIndicadoresPorRespuestas } from "@/services/ciudadano/FormService/indicators.service";
import { getCertificateUrl } from "@/services/ciudadano/ansewerForm.service";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActivePeriod } from "@/hooks/useActivePeriod";

export const FormSummary = () => {
  const { state, setCurrentStep } = useFormContext();
  const router = useRouter();
  const [idToLabel, setIdToLabel] = useState<Record<string, string>>({});
  const { periodo, id: activePeriodId } = useActivePeriod();
  const mesesToRender = periodo?.includes("-II")
    ? ["jul", "ago", "sep", "oct", "nov", "dic"]
    : ["ene", "feb", "mar", "abr", "may", "jun"];

  // Indicadores activos para el usuario
  const [activeIndicatorNums, setActiveIndicatorNums] = useState<number[]>([]);
  const [indicatorsLoading, setIndicatorsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const resp = await getOpcionesRespuesta();
        const map: Record<string, string> = {};
        for (const o of resp.data || []) {
          if (o?.id) map[o.id] = o.opcion_respuesta;
        }
        setIdToLabel(map);
      } catch (e) {
        // noop
      }
    };
    loadOptions();
  }, []);

  // Cargar indicadores activos igual que en Step 13
  useEffect(() => {
    const loadActiveIndicators = async () => {
      try {
        setIndicatorsLoading(true);
        const questionNumbers = [7, 10, 11, 17, 42] as const;
        const fieldMapping: Record<(typeof questionNumbers)[number], keyof typeof state> = {
          7: "unidadAlmacenamiento",
          10: "aforoResiduos",
          11: "generaOrganicos",
          17: "generaAprovechables",
          42: "programaComunicacion",
        } as any;

        const [opcionesResponse, ...preguntas] = await Promise.all([
          getOpcionesRespuesta(),
          ...questionNumbers.map((n) => getPreguntaPorNumero(n)),
        ]);

        const preguntasData = preguntas as any[];
        const opciones = opcionesResponse.data as any[];

        const getYesOptionIdForPregunta = (preguntaId: string) => {
          const opts = opciones.filter((o) => o.id_pregunta === preguntaId);
          const yes = opts.find((o) => {
            const t = String(o.opcion_respuesta || "").toLowerCase();
            return t.includes("sí") || t.includes("si") || t === "true";
          });
          return yes?.id || null;
        };

        const respuestasIndicadores: Array<{ id_pregunta: string; id_opcion_respuesta: string }> = [];
        preguntasData.forEach((preg, idx) => {
          const num = questionNumbers[idx];
          const field = fieldMapping[num];
          const val = state[field] as any;
          if (val === true) {
            const yesId = getYesOptionIdForPregunta(preg.id);
            if (yesId) respuestasIndicadores.push({ id_pregunta: preg.id, id_opcion_respuesta: yesId });
          }
        });

        if (respuestasIndicadores.length === 0) {
          setActiveIndicatorNums([]);
          return;
        }

        const dynamicIndicators = await obtenerIndicadoresPorRespuestas({ respuestas: respuestasIndicadores });
        const nums = Array.isArray(dynamicIndicators)
          ? dynamicIndicators.map((di: any) => Number(di.num_indicador)).filter((n: any) => Number.isFinite(n))
          : [];
        setActiveIndicatorNums(nums);
      } catch (e) {
        setActiveIndicatorNums([]);
      } finally {
        setIndicatorsLoading(false);
      }
    };

    loadActiveIndicators();
  }, [state.unidadAlmacenamiento, state.aforoResiduos, state.generaOrganicos, state.generaAprovechables, state.programaComunicacion]);

  // Helper function to get company name from key
  const getCompanyName = (key: string): string => idToLabel[key] || key;

  // Helper function to get frequency name from key
  const getFrequencyName = (key: string): string => idToLabel[key] || key;

  // Helper function to get gestor name from key
  const getGestorName = (key: string, type: string): string => {
    // This would be expanded with all the gestor options
    return key;
  };

  // Helper function to format boolean values
  const formatBoolean = (value: boolean | null): string => {
    if (value === null) return "No especificado";
    return value ? "Sí" : "No";
  };

  // Helper function to format array values
  const formatArray = (array: string[]): string => {
    if (array.length === 0) return "Ninguno";
    return array.map((id) => idToLabel[id] || id).join(", ");
  };

  // Helper function to get cumplimiento text
  const getCumplimientoText = (key: string): string => {
    const options = {
      "cumpleTotalmente": "Cumple totalmente (100%)",
      "cumpleParcialmente": "Cumple parcialmente (60% - 99,9%)",
      "noCumple": "No cumple (<60%)",
    };
    return options[key as keyof typeof options] || "";
  };

  // Helper function to calculate UAR compliance percentage
  const calcularPorcentajeUAR = () => {
    const condiciones = state.indicadores.indicador4.condiciones;
    const totalCondiciones = Object.keys(condiciones).length;
    let condicionesCumplidas = 0;

    Object.values(condiciones).forEach(value => {
      if (value === true) condicionesCumplidas++;
    });

    const todasRespondidas = !Object.values(condiciones).some(value => value === null);
    if (!todasRespondidas) return "No evaluado";

    const porcentaje = (condicionesCumplidas / totalCondiciones) * 100;

    if (porcentaje === 100) return "Cumple totalmente (100%)";
    if (porcentaje >= 60) return `Cumple parcialmente (${porcentaje.toFixed(1)}%)`;
    return `No cumple (${porcentaje.toFixed(1)}%)`;
  };

  const handleEditSection = (step: number) => {
    setCurrentStep(step);
  };

  async function handleDownloadCertificate() {
    try {
      if (!activePeriodId) return;
      setIsDownloading(true);
      const pendingWindow = window.open("about:blank", "_blank");
      const url = await getCertificateUrl(activePeriodId);
      if (url) {
        if (pendingWindow) {
          pendingWindow.location.href = url;
        } else {
          window.location.href = url;
        }
      }
    } catch (e) {
      console.error("Error al descargar certificado:", e);
    } finally {
      setIsDownloading(false);
    }
  }

  const isIndicator1Complete = useMemo(() => {
    try {
      for (const mes of mesesToRender) {
        const m = state.indicadores.indicador1.meses[mes];
        if (!m) return false;
        if (String(m.ejecutadas || "").trim() === "" || String(m.programadas || "").trim() === "") return false;
      }
      return true;
    } catch {
      return false;
    }
  }, [state.indicadores.indicador1.meses, mesesToRender]);

  const isIndicator2Complete = useMemo(() => {
    try {
      for (const mes of mesesToRender) {
        const m = state.indicadores.indicador2.meses[mes];
        if (!m) return false;
        if (String(m.aprovechados || "").trim() === "" || String(m.generados || "").trim() === "") return false;
      }
      return true;
    } catch {
      return false;
    }
  }, [state.indicadores.indicador2.meses, mesesToRender]);

  const isIndicator3Complete = useMemo(() => {
    try {
      for (const mes of mesesToRender) {
        const m = state.indicadores.indicador3.meses[mes];
        if (!m) return false;
        if (String(m.volumen || "").trim() === "") return false;
      }
      return true;
    } catch {
      return false;
    }
  }, [state.indicadores.indicador3.meses, mesesToRender]);

  const isIndicator5Complete = useMemo(() => {
    try {
      for (const mes of mesesToRender) {
        const m = state.indicadores.indicador5.meses[mes];
        if (!m) return false;
        if (String(m.rsoGestores || "").trim() === "" || String(m.residuosGenerados || "").trim() === "") return false;
      }
      return true;
    } catch {
      return false;
    }
  }, [state.indicadores.indicador5.meses, mesesToRender]);

  return (
    <div>
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 p-4 rounded-full">
            <Icon icon="lucide:check" className="text-green-600 w-8 h-8" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">¡Formulario Completado!</h2>
        <p className="text-gray-600 mt-2">
          Ha completado exitosamente todas las secciones del formulario SGIRS.
        </p>
      </div>

      <Card className="mb-6">
        <CardBody>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Resumen de su información:</h3>

          <div className="space-y-4">
            {/* Documentación */}
            <div className="flex items-center gap-2">
              <div className="bg-green-100 p-1.5 rounded-md">
                <DocumentTextIcon className="text-green-600 w-6 h-6" />
              </div>
              <div>
                <p className="font-medium">Documentación:</p>
                <p className="text-sm text-gray-600">
                  {state.manualSGIRS === true ? "Cuenta con manual SGIRS" : "No cuenta con manual SGIRS"}
                </p>
              </div>
            </div>

            <Divider />

            {/* Organización */}
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-1.5 rounded-md">
                <Image src="/onigram.svg" alt="Logo" width={24} height={24} />
              </div>
              <div>
                <p className="font-medium">Estructura organizacional:</p>
                <p className="text-sm text-gray-600">
                  {state.esquemaOrganizacional === true ? "Definida" : "No definida"}
                </p>
              </div>
            </div>

            <Divider />

            {/* Separación y Almacenamiento */}
            <div className="flex items-center gap-2">
              <div className="bg-amber-100 p-1.5 rounded-md">
                <TrashIcon className="text-amber-600 w-6 h-6" />
              </div>
              <div>
                <p className="font-medium">Separación y Almacenamiento:</p>
                <p className="text-sm text-gray-600">
                  Separación en fuente: {formatBoolean(state.separacionFuente)},
                  Mobiliario adecuado: {formatBoolean(state.mobiliarioSeparacion)},
                  Plano de rutas: {formatBoolean(state.planoRutas)},
                  UAR: {formatBoolean(state.unidadAlmacenamiento)}
                </p>
              </div>
            </div>

            <Divider />

            {/* Recolección No Aprovechables */}
            <div className="flex items-center gap-2">
              <div className="bg-purple-100 p-1.5 rounded-md">
                <Image src="/trash-truck.svg" alt="Logo" width={24} height={24} />
              </div>
              <div>
                <p className="font-medium">Recolección No Aprovechables:</p>
                <p className="text-sm text-gray-600">
                  Empresa: {getCompanyName(state.empresaAseo)},
                  Frecuencia: {getFrequencyName(state.frecuenciaRecoleccion)}
                </p>
              </div>
            </div>

            <Divider />

            {/* Residuos Orgánicos */}
            <div className="flex items-center gap-2">
              <div className="bg-green-100 p-1.5 rounded-md">
                <Image src="/apple.svg" alt="Logo" width={24} height={24} />
              </div>
              <div>
                <p className="font-medium">Residuos orgánicos:</p>
                <p className="text-sm text-gray-600">
                  {state.generaOrganicos === true ? "Genera residuos orgánicos" : "No genera residuos orgánicos"}
                  {state.generaOrganicos && state.recoleccionOrganicos && ", Solicita recolección"}
                </p>
              </div>
            </div>

            <Divider />

            {/* Residuos Aprovechables */}
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-1.5 rounded-md">
                <Icon icon="lucide:recycle" className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <p className="font-medium">Residuos aprovechables:</p>
                <p className="text-sm text-gray-600">
                  {state.generaAprovechables === true ?
                    `Genera: ${formatArray(state.tiposAprovechables)}` :
                    "No genera residuos aprovechables"}
                </p>
              </div>
            </div>

            <Divider />

            {/* Aceite de Cocina Usado */}
            <div className="flex items-center gap-2">
              <div className="bg-yellow-100 p-1.5 rounded-md">
                <Icon icon="lucide:droplet" className="text-yellow-600 w-6 h-6" />
              </div>
              <div>
                <p className="font-medium">Aceite de cocina usado:</p>
                <p className="text-sm text-gray-600">
                  {state.generaACU === true ? "Genera ACU" : "No genera ACU"}
                </p>
              </div>
            </div>

            <Divider />

            {/* RAEE */}
            <div className="flex items-center gap-2">
              <div className="bg-gray-100 p-1.5 rounded-md">
                <Image src="/laptop.svg" alt="Logo" width={24} height={24} />
              </div>
              <div>
                <p className="font-medium">RAEE:</p>
                <p className="text-sm text-gray-600">
                  {state.generaRAEE === true ?
                    `Genera RAEE (${state.tiposRAEE.length} tipos)` :
                    "No genera RAEE"}
                </p>
              </div>
            </div>

            <Divider />

            {/* RCD */}
            <div className="flex items-center gap-2">
              <div className="bg-orange-100 p-1.5 rounded-md">
                <Image src="/brick.svg" alt="Logo" width={24} height={24} />
              </div>
              <div>
                <p className="font-medium">RCD:</p>
                <p className="text-sm text-gray-600">
                  {state.generaRCD === true ? "Genera RCD" : "No genera RCD"}
                </p>
              </div>
            </div>

            <Divider />

            {/* RESPEL */}
            <div className="flex items-center gap-2">
              <div className="bg-red-100 p-1.5 rounded-md">
                <Icon icon="lucide:alert-triangle" className="text-red-600 w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">RESPEL:</p>
                <p className="text-sm text-gray-600">
                  {state.generaRESPEL === true ?
                    `Genera RESPEL (${state.tiposRESPEL.length} tipos)` :
                    "No genera RESPEL"}
                </p>
              </div>
            </div>

            {/* Add Indicators Summary */}
            <Divider />

            <div className="flex items-center gap-2">
              <div className="bg-indigo-100 p-1.5 rounded-md">
                <Icon icon="lucide:bar-chart-2" className="text-indigo-600 w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Indicadores:</p>
                <p className="text-sm text-gray-600">
                  {indicatorsLoading ? (
                    "Cargando indicadores..."
                  ) : activeIndicatorNums.length === 0 ? (
                    "No se habilitaron indicadores para este periodo"
                  ) : (
                    [
                      activeIndicatorNums.includes(4) ? `UAR: ${calcularPorcentajeUAR()}` : null,
                      activeIndicatorNums.includes(1) ? `Actividades IEC: ${isIndicator1Complete ? "Completado" : "No completado"}` : null,
                      activeIndicatorNums.includes(2) ? `Residuos aprovechables: ${isIndicator2Complete ? "Completado" : "No completado"}` : null,
                      activeIndicatorNums.includes(3) ? `Volumen RSO: ${isIndicator3Complete ? "Completado" : "No completado"}` : null,
                      activeIndicatorNums.includes(5) ? `RSO gestionados: ${isIndicator5Complete ? "Completado" : "No completado"}` : null,
                    ].filter(Boolean).join(", ")
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="text-center mt-8" role="region" aria-label="Form completion actions">
        <p className="text-gray-600 mb-4">
          Su formulario ha sido finalizado. Puede consultar sus resultados en Mis reportes o descargar su certificado.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="bordered"
            size="lg"
            endContent={<Icon icon="lucide:download" />}
            onPress={handleDownloadCertificate}
            isDisabled={!activePeriodId}
            isLoading={isDownloading}
            aria-label="Download certificate"
          >
            Descargar certificado
          </Button>
          <Button
            color="primary"
            size="lg"
            endContent={<Icon icon="lucide:list" />}
            onPress={() => router.push("/ciudadano/reportes")}
            aria-label="View my reports"
          >
            Ver mis reportes
          </Button>
        </div>
      </div>

    </div>
  );
};