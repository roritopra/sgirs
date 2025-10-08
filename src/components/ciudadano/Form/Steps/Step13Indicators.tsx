import { Input, Card, CardBody, RadioGroup, Radio } from "@heroui/react";
import { useFormContext } from "../FormContext";
import { useEffect, useMemo, useState } from "react";
import { useActivePeriod } from "@/hooks/useActivePeriod";
import { obtenerIndicadoresPorRespuestas, DynamicIndicator, IndicatorRequest } from '@/services/ciudadano/FormService/indicators.service';
import { getPreguntaPorNumero, getOpcionesRespuesta } from '@/services/ciudadano/FormService/questions.service';
import { Pregunta, OpcionRespuesta } from '@/types/ciudadano/typeQuestions.types';
import { CitizenFormSkeleton } from "@/components/skeletons/CitizenFormSkeleton";
 

const nombresMeses: Record<string, string> = {
  ene: "Enero",
  feb: "Febrero",
  mar: "Marzo",
  abr: "Abril",
  may: "Mayo",
  jun: "Junio",
  jul: "Julio",
  ago: "Agosto",
  sep: "Septiembre",
  oct: "Octubre",
  nov: "Noviembre",
  dic: "Diciembre",
};

export const Step13Indicators = () => {
  const { state, updateForm } = useFormContext();
  const { indicadores } = state;
  const { periodo } = useActivePeriod();
  const mesesToRender = periodo?.includes("-II")
    ? ["jul", "ago", "sep", "oct", "nov", "dic"]
    : ["ene", "feb", "mar", "abr", "may", "jun"];
  

  // Estado para indicadores dinámicos
  const [dynamicIndicators, setDynamicIndicators] = useState<DynamicIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questionsData, setQuestionsData] = useState<Record<number, { pregunta: Pregunta; opciones: OpcionRespuesta[] }>>({});
  const [touchedCells, setTouchedCells] = useState<Record<string, boolean>>({});

  const normalize = (s: string) =>
    String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .trim();

  // Mapeo de preguntas relevantes para indicadores
  const questionNumbers = [7, 10, 11, 17, 42];
  const fieldMapping = {
    7: 'unidadAlmacenamiento',
    10: 'aforoResiduos', 
    11: 'generaOrganicos',
    17: 'generaAprovechables',
    42: 'programaComunicacion'
  } as const;

  // Cargar datos de preguntas al montar el componente
  useEffect(() => {
    const loadQuestionsData = async () => {
      try {
        const [opcionesResponse, ...preguntasPromises] = await Promise.all([
          getOpcionesRespuesta(),
          ...questionNumbers.map(num => getPreguntaPorNumero(num))
        ]);

        const opciones = opcionesResponse.data;
        const preguntas = preguntasPromises;

        const questionsDataMap: Record<number, { pregunta: Pregunta; opciones: OpcionRespuesta[] }> = {};

        preguntas.forEach((pregunta, index) => {
          const questionNum = questionNumbers[index];
          const preguntaOpciones = opciones.filter(opcion => opcion.id_pregunta === pregunta.id);
          questionsDataMap[questionNum] = {
            pregunta,
            opciones: preguntaOpciones
          };
        });

        setQuestionsData(questionsDataMap);
        console.log('✅ Datos de preguntas cargados:', questionsDataMap);
      } catch (error) {
        console.error('❌ Error cargando datos de preguntas:', error);
      }
    };

    loadQuestionsData();
  }, []);

  // Función para obtener el ID de opción "Sí" para una pregunta
  const getYesOptionId = (questionNum: number): string | null => {
    const questionData = questionsData[questionNum];
    if (!questionData) return null;

    // Buscar la opción que corresponde a "Sí"
    const yesOption = questionData.opciones.find(opcion => 
      opcion.opcion_respuesta.toLowerCase().includes('sí') || 
      opcion.opcion_respuesta.toLowerCase().includes('si') ||
      opcion.opcion_respuesta.toLowerCase() === 'true'
    );

    return yesOption?.id || null;
  };

  // Función para construir el request de indicadores
  const buildIndicatorsRequest = (): IndicatorRequest | null => {
    const respuestas: Array<{ id_pregunta: string; id_opcion_respuesta: string }> = [];
    
    // Verificar cada pregunta que puede habilitar indicadores
    questionNumbers.forEach(questionNum => {
      const fieldName = fieldMapping[questionNum as keyof typeof fieldMapping];
      const fieldValue = state[fieldName as keyof typeof state];
      
      // Si la respuesta es afirmativa, agregar al request
      if (fieldValue === true) {
        const questionData = questionsData[questionNum];
        const yesOptionId = getYesOptionId(questionNum);
        
        if (questionData && yesOptionId) {
          respuestas.push({
            id_pregunta: questionData.pregunta.id,
            id_opcion_respuesta: yesOptionId
          });
        }
      }
    });
    
    const request = respuestas.length > 0 ? { respuestas } : null;
    
    // Console log para debug
    if (request) {
      console.log('🔍 Request body para indicadores dinámicos:', JSON.stringify(request, null, 2));
    }
    
    return request;
  };

  // Cargar indicadores dinámicos cuando cambie el estado o se carguen los datos de preguntas
  useEffect(() => {
    const loadDynamicIndicators = async () => {
      // Solo proceder si ya tenemos los datos de las preguntas
      if (Object.keys(questionsData).length === 0) {
        setLoading(true);
        return;
      }
      
      const request = buildIndicatorsRequest();
      if (!request) {
        setDynamicIndicators([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const indicators = await obtenerIndicadoresPorRespuestas(request);
        setDynamicIndicators(indicators);
      } catch (error) {
        console.error("Error obteniendo indicadores dinámicos:", error);
        setError("Error al cargar los indicadores dinámicos");
        setDynamicIndicators([]);
      } finally {
        setLoading(false);
      }
    };

    loadDynamicIndicators();
  }, [state.unidadAlmacenamiento, state.aforoResiduos, state.generaOrganicos, state.generaAprovechables, state.programaComunicacion, questionsData]);

  // Función para calcular el resultado del indicador 1
  const calcularResultadoIndicador1 = (mes: string) => {
    const ejecutadas = parseFloat(indicadores.indicador1.meses[mes].ejecutadas) || 0;
    const programadas = parseFloat(indicadores.indicador1.meses[mes].programadas) || 0;
    
    if (programadas === 0) return "0";
    const num = Math.min(ejecutadas, programadas);
    return ((num / programadas) * 100).toFixed(2);
  };

  // Función para calcular el resultado del indicador 2
  const calcularResultadoIndicador2 = (mes: string) => {
    const aprovechados = parseFloat(indicadores.indicador2.meses[mes].aprovechados) || 0;
    const generados = parseFloat(indicadores.indicador2.meses[mes].generados) || 0;
    
    if (generados === 0) return "0";
    const num = Math.min(aprovechados, generados);
    return ((num / generados) * 100).toFixed(2);
  };

  // Función para actualizar los datos del indicador 1
  const updateIndicador1 = (mes: string, field: string, value: string) => {
    updateForm({
      indicadores: {
        ...indicadores,
        indicador1: {
          ...indicadores.indicador1,
          meses: {
            ...indicadores.indicador1.meses,
            [mes]: {
              ...indicadores.indicador1.meses[mes],
              [field]: value,
            },
          },
        },
      },
    });
  };

  // Función para actualizar los datos del indicador 2
  const updateIndicador2 = (mes: string, field: string, value: string) => {
    updateForm({
      indicadores: {
        ...indicadores,
        indicador2: {
          ...indicadores.indicador2,
          meses: {
            ...indicadores.indicador2.meses,
            [mes]: {
              ...indicadores.indicador2.meses[mes],
              [field]: value,
            },
          },
        },
      },
    });
  };

  // Función para actualizar los datos del indicador 3
  const updateIndicador3 = (mes: string, value: string) => {
    updateForm({
      indicadores: {
        ...indicadores,
        indicador3: {
          ...indicadores.indicador3,
          meses: {
            ...indicadores.indicador3.meses,
            [mes]: {
              volumen: value,
            },
          },
        },
      },
    });
  };

  // Función para actualizar los datos del indicador 5
  const updateIndicador5 = (mes: string, field: string, value: string) => {
    updateForm({
      indicadores: {
        ...indicadores,
        indicador5: {
          ...indicadores.indicador5,
          meses: {
            ...indicadores.indicador5.meses,
            [mes]: {
              ...indicadores.indicador5.meses[mes],
              [field]: value,
            },
          },
        },
      },
    });
  };

  // Función para calcular el resultado del indicador 5
  const calcularResultadoIndicador5 = (mes: string) => {
    const rsoGestores = parseFloat(indicadores.indicador5.meses[mes].rsoGestores) || 0;
    const residuosGenerados = parseFloat(indicadores.indicador5.meses[mes].residuosGenerados) || 0;
    
    if (residuosGenerados === 0) return "0";
    const num = Math.min(rsoGestores, residuosGenerados);
    return ((num / residuosGenerados) * 100).toFixed(2);
  };

  // Función para calcular el porcentaje de cumplimiento del indicador 4
  const calcularPorcentajeIndicador4 = () => {
    const condiciones = indicadores.indicador4.condiciones;
    const totalCondiciones = Object.keys(condiciones).length;
    let condicionesCumplidas = 0;
    
    // Contar condiciones cumplidas (true)
    Object.values(condiciones).forEach(value => {
      if (value === true) condicionesCumplidas++;
    });
    
    // Verificar si todas las condiciones han sido respondidas
    const todasRespondidas = !Object.values(condiciones).some(value => value === null);
    
    if (!todasRespondidas) return null;
    
    return (condicionesCumplidas / totalCondiciones) * 100;
  };

  // Función para obtener el nivel de cumplimiento basado en el porcentaje
  const getNivelCumplimiento = (porcentaje: number | null) => {
    if (porcentaje === null) return "Pendiente de evaluación";
    if (porcentaje === 100) return "Cumple totalmente (100%)";
    if (porcentaje >= 60) return "Cumple parcialmente (60% - 99.9%)";
    return "No cumple (<60%)";
  };

  // Función para actualizar una condición específica del indicador 4
  const updateCondicionIndicador4 = (condicion: string, value: boolean) => {
    updateForm({
      indicadores: {
        ...indicadores,
        indicador4: {
          ...indicadores.indicador4,
          condiciones: {
            ...indicadores.indicador4.condiciones,
            [condicion]: value
          }
        }
      }
    });
  };

  // Función para calcular el total acumulado del indicador 3
  const calcularTotalIndicador3 = () => {
    let total = 0;
    for (const mes of mesesToRender) {
      total += parseFloat(indicadores.indicador3.meses[mes]?.volumen || "0") || 0;
    }
    return total.toFixed(2);
  };

  // Funciones auxiliares para manejar valores de indicadores dinámicos
  const getIndicatorValue = (indicatorNum: number, mes: string, variableIndex: number): string => {
    const indicatorKey = `indicador${indicatorNum}` as keyof typeof indicadores;
    const indicator = indicadores[indicatorKey] as any;
    if (!indicator || !('meses' in indicator)) return "";
    const mesData = indicator.meses?.[mes];
    if (!mesData) return "";
    const fields = Object.keys(mesData);
    return fields[variableIndex] ? String((mesData as any)[fields[variableIndex]] ?? "") : "";
  };

  // Función para renderizar un indicador dinámico
  const renderDynamicIndicator = (indicator: DynamicIndicator) => {
    if (indicator.es_uar) {
      return renderUARIndicator(indicator);
    } else {
      return renderRegularIndicator(indicator);
    }
  };

  // Cálculo de sección incompleta para mostrar alerta contextual
  const indicatorsIncomplete = useMemo(() => {
    try {
      if (loading) return false;
      if (!dynamicIndicators || dynamicIndicators.length === 0) return false;

      for (const indicator of dynamicIndicators) {
        if ((indicator as any).es_uar) {
          const vals = Object.values(indicadores.indicador4.condiciones);
          if (vals.some((v) => v === null)) return true;
          continue;
        }
        const num = (indicator as any).num_indicador as number;
        const key = `indicador${num}` as keyof typeof indicadores;
        const group: any = (indicadores as any)[key];
        if (!group || !group.meses) return true;
        const varsCount = Math.max(1, ((indicator as any).variables || []).length);
        for (const mes of mesesToRender) {
          const mesData = group.meses[mes];
          if (!mesData) return true;
          const fields = Object.keys(mesData);
          for (let i = 0; i < Math.min(varsCount, fields.length); i++) {
            const val = (mesData as any)[fields[i]];
            if (val === "" || val === null || typeof val === "undefined") return true;
          }
        }
      }
      return false;
    } catch {
      return false;
    }
  }, [loading, dynamicIndicators, indicadores, mesesToRender]);

  // Función para renderizar indicador regular (con variables)
  const renderRegularIndicator = (indicator: DynamicIndicator) => {
    const variables = indicator.variables || [];
    const cellKey = (num: number, mesKey: string, varIdx: number) => `${num}-${mesKey}-${varIdx}`;
    
    return (
      <Card key={indicator.num_indicador} className="mb-8">
        <CardBody>
          <h4 className="text-base font-semibold text-gray-900 mb-2">
            Indicador {indicator.num_indicador}: {indicator.nombre_indicador}
          </h4>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Mes</th>
                  {variables.map((variable, index) => (
                    <th key={index} className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                      {variable.nombre_variable}
                    </th>
                  ))}
                  {variables.length === 2 && (
                    <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Resultado (%)</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {mesesToRender.map((mes) => (
                  <tr key={mes} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">
                      {nombresMeses[mes as keyof typeof nombresMeses]}
                    </td>
                    {variables.map((variable, index) => {
                      const emptyInvalid = Boolean(touchedCells[cellKey(indicator.num_indicador, mes, index)]) && String(getIndicatorValue(indicator.num_indicador, mes, index) ?? "").trim() === "";

                      // Índices por nombre para Indicador 1
                      let idxEjec = -1;
                      let idxProg = -1;
                      if (indicator.num_indicador === 1) {
                        variables.forEach((v, i) => {
                          const n = normalize(v.nombre_variable);
                          if (idxEjec < 0 && (n.includes("ejecutada") || n.includes("ejecutadas"))) idxEjec = i;
                          if (idxProg < 0 && (n.includes("programada") || n.includes("programadas"))) idxProg = i;
                        });
                      }

                      // Índices por nombre para Indicador 2
                      let idxAprov = -1;
                      let idxGenerad = -1;
                      if (indicator.num_indicador === 2) {
                        variables.forEach((v, i) => {
                          const n = normalize(v.nombre_variable);
                          if (idxAprov < 0 && (n.includes("aprovechad"))) idxAprov = i; // aprovechado(s)
                          if (idxGenerad < 0 && (n.includes("generad"))) idxGenerad = i; // generado(s)
                        });
                      }

                      // Índices por nombre para Indicador 5
                      let idxRsoGest = -1;
                      let idxResGen = -1;
                      if (indicator.num_indicador === 5) {
                        variables.forEach((v, i) => {
                          const n = normalize(v.nombre_variable);
                          if (idxRsoGest < 0 && (n.includes("rso") || n.includes("gestor") || n.includes("gestores") || n.includes("gestionad"))) idxRsoGest = i;
                          if (idxResGen < 0 && (n.includes("generad") || n.includes("residuo"))) idxResGen = i;
                        });
                      }

                      const vEjec = idxEjec >= 0 ? parseFloat(String(getIndicatorValue(indicator.num_indicador, mes, idxEjec) ?? "0")) || 0 : 0;
                      const vProg = idxProg >= 0 ? parseFloat(String(getIndicatorValue(indicator.num_indicador, mes, idxProg) ?? "0")) || 0 : 0;
                      const vAprov = idxAprov >= 0 ? parseFloat(String(getIndicatorValue(indicator.num_indicador, mes, idxAprov) ?? "0")) || 0 : 0;
                      const vGenerad = idxGenerad >= 0 ? parseFloat(String(getIndicatorValue(indicator.num_indicador, mes, idxGenerad) ?? "0")) || 0 : 0;
                      const vRsoGest = idxRsoGest >= 0 ? parseFloat(String(getIndicatorValue(indicator.num_indicador, mes, idxRsoGest) ?? "0")) || 0 : 0;
                      const vResGen = idxResGen >= 0 ? parseFloat(String(getIndicatorValue(indicator.num_indicador, mes, idxResGen) ?? "0")) || 0 : 0;

                      const relationInvalid1 = indicator.num_indicador === 1 && idxEjec >= 0 && idxProg >= 0 && vEjec > vProg;
                      const relationInvalid1ThisCell = relationInvalid1 && index === idxEjec;

                      const relationInvalid2 = indicator.num_indicador === 2 && idxAprov >= 0 && idxGenerad >= 0 && vAprov > vGenerad;
                      const relationInvalid2ThisCell = relationInvalid2 && index === idxAprov;
                      const relationInvalid5 = indicator.num_indicador === 5 && idxRsoGest >= 0 && idxResGen >= 0 && vRsoGest > vResGen;
                      const relationInvalid5ThisCell = relationInvalid5 && index === idxRsoGest;

                      const isInvalid = emptyInvalid || relationInvalid1ThisCell || relationInvalid2ThisCell || relationInvalid5ThisCell;

                      return (
                        <td key={index} className="border border-gray-200 px-4 py-2">
                          <Input
                            type="number"
                            min="0"
                            value={getIndicatorValue(indicator.num_indicador, mes, index)}
                            onValueChange={(value) => {
                              updateIndicatorValue(indicator.num_indicador, mes, index, value);
                              const key = cellKey(indicator.num_indicador, mes, index);
                              if (String(value ?? "").trim() !== "") {
                                setTouchedCells((prev) => ({ ...prev, [key]: false }));
                              }
                            }}
                            onBlur={() => {
                              const key = cellKey(indicator.num_indicador, mes, index);
                              const v = getIndicatorValue(indicator.num_indicador, mes, index);
                              if (String(v ?? "").trim() === "") {
                                setTouchedCells((prev) => ({ ...prev, [key]: true }));
                              }
                            }}
                            isInvalid={isInvalid}
                            aria-invalid={isInvalid}
                            placeholder="0"
                            size="sm"
                            className="max-w-[120px]"
                          />
                          {indicator.num_indicador === 1 && relationInvalid1 && index === idxEjec && (
                            <p className="mt-1 text-xs text-red-600" role="status" aria-live="polite">
                              El valor de "Ejecutadas" no puede ser mayor que "Programadas".
                            </p>
                          )}
                          {indicator.num_indicador === 2 && relationInvalid2 && index === idxAprov && (
                            <p className="mt-1 text-xs text-red-600" role="status" aria-live="polite">
                              El valor de "Aprovechados" no puede ser mayor que "Generados".
                            </p>
                          )}
                          {indicator.num_indicador === 5 && relationInvalid5 && index === idxRsoGest && (
                            <p className="mt-1 text-xs text-red-600" role="status" aria-live="polite">
                              El valor de "RSO gestionados" no puede ser mayor que "Residuos generados".
                            </p>
                          )}
                        </td>
                      );
                    })}
                    {variables.length === 2 && (
                      <td className="border border-gray-200 px-4 py-2 text-sm font-medium">
                        {calculatePercentage(indicator.num_indicador, mes)}%
                      </td>
                    )}
                  </tr>
                ))}
                {indicator.num_indicador === 3 && (
                  <tr className="bg-gray-50 font-medium">
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">Total</td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900 font-semibold">
                      {calculateTotal(indicator.num_indicador)} m³
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    );
  };

  // Función para renderizar indicador UAR
  const renderUARIndicator = (indicator: DynamicIndicator) => {
    const preguntas = indicator.preguntas || [];
    return (
      <Card key={indicator.num_indicador} className="mb-8">
        <CardBody>
          <h4 className="text-base font-semibold text-gray-900 mb-2">
            Indicador {indicator.num_indicador}: {indicator.nombre_indicador}
          </h4>
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Condiciones técnicas que cumple la UAR:
            </p>
            <div className="space-y-4 border border-gray-200 rounded-md p-4">
              {preguntas.map((pregunta, index) => (
                <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                  <p className="text-sm text-gray-800 mb-2">{pregunta.pregunta}</p>
                  <div className="flex items-center gap-4">
                    <RadioGroup
                      orientation="horizontal"
                      value={
                        indicadores.indicador4.condiciones[`condicion${index + 1}` as keyof typeof indicadores.indicador4.condiciones] === null
                          ? undefined
                          : String(
                              indicadores.indicador4.condiciones[
                                `condicion${index + 1}` as keyof typeof indicadores.indicador4.condiciones
                              ]
                            )
                      }
                      onValueChange={(val) => updateCondicionIndicador4(`condicion${index + 1}`, val === "true")}
                    >
                      <Radio value="true">Sí</Radio>
                      <Radio value="false">No</Radio>
                    </RadioGroup>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4 p-4 bg-blue-50 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Resultado de la evaluación:</p>
                <p className="text-lg font-semibold text-blue-900">
                  {calcularPorcentajeIndicador4() !== null 
                    ? `${calcularPorcentajeIndicador4()?.toFixed(2)}%` 
                    : "Pendiente de evaluación completa"}
                </p>
              </div>
              <div className="bg-white px-3 py-2 rounded-md border border-blue-200">
                <p className="text-sm font-medium text-blue-800">Nivel de cumplimiento:</p>
                <p className="text-sm font-semibold">
                  {getNivelCumplimiento(calcularPorcentajeIndicador4())}
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };

  const updateIndicatorValue = (indicatorNum: number, mes: string, variableIndex: number, value: string) => {
    const indicatorKey = `indicador${indicatorNum}` as keyof typeof indicadores;
    const indicator = indicadores[indicatorKey];
    if (!indicator || !('meses' in indicator)) return;
    const mesData = indicator.meses[mes];
    if (!mesData) return;

    const fields = Object.keys(mesData);
    const fieldName = fields[variableIndex];
    if (!fieldName) return;

    // Construir el nuevo estado del mes
    const nextMesData: Record<string, any> = { ...mesData, [fieldName]: value };

    updateForm({
      indicadores: {
        ...indicadores,
        [indicatorKey]: {
          ...indicator,
          meses: {
            ...indicator.meses,
            [mes]: nextMesData,
          },
        },
      },
    });
  };

  const calculatePercentage = (indicatorNum: number, mes: string): string => {
    if (indicatorNum === 1) return calcularResultadoIndicador1(mes);
    if (indicatorNum === 2) return calcularResultadoIndicador2(mes);
    if (indicatorNum === 5) return calcularResultadoIndicador5(mes);
    return "0";
  };

  const calculateTotal = (indicatorNum: number): string => {
    if (indicatorNum === 3) return calcularTotalIndicador3();
    return "0";
  };

  

  if (loading) return <CitizenFormSkeleton />;
  if (error) return <div className="text-red-600 p-4">Error: {error}</div>;

  // Verificar si hay indicadores para mostrar
  const hasIndicators = dynamicIndicators.length > 0;

  return (
    <div>
      <div className="mb-8">
        {hasIndicators && (
          <p className="text-sm text-gray-600 mb-6">
            Complete los siguientes indicadores para evaluar el desempeño del Sistema de Gestión Integral de Residuos Sólidos.
          </p>
        )}
      </div>

      {hasIndicators && indicatorsIncomplete && (
        <div role="alert" aria-live="polite" className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-md">
          <p className="text-sm text-amber-800">
            Para finalizar, completa todas las celdas de los indicadores mostrados para los meses del semestre activo.
          </p>
        </div>
      )}

      {hasIndicators ? (
        /* Renderizar indicadores dinámicos */
        dynamicIndicators.map(indicator => renderDynamicIndicator(indicator))
      ) : (
        /* Mensaje cuando no hay indicadores */
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            No hay indicadores para completar
          </h4>
          <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
            Según las respuestas proporcionadas en el formulario, no se requiere completar indicadores del SGIRS en este momento.
          </p>
          <p className="text-xs text-gray-500">
            Los indicadores se muestran únicamente cuando se responde afirmativamente a preguntas específicas relacionadas con la gestión de residuos.
          </p>
        </div>
      )}
    </div>
  );
};