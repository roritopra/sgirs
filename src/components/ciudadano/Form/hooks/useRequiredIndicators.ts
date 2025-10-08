/**
 * Hook para cargar y gestionar indicadores requeridos dinámicamente
 */

import { useState, useEffect } from "react";
import { useFormContext } from "../FormContext";
import {
  getOpcionesRespuesta,
  getPreguntaPorNumero,
} from "@/services/ciudadano/FormService/questions.service";
import { obtenerIndicadoresPorRespuestas } from "@/services/ciudadano/FormService/indicators.service";
import { INDICATOR_QUESTION_NUMBERS, INDICATOR_FIELD_MAPPING } from "../stepper.constants";
import { getYesOptionIdForPregunta } from "../stepper.utils";
import type { StepNumber } from "../stepper.types";

export function useRequiredIndicators(currentStep: StepNumber) {
  const { state } = useFormContext();
  const [requiredIndicators, setRequiredIndicators] = useState<any[]>([]);
  const [indicatorsLoading, setIndicatorsLoading] = useState(false);

  useEffect(() => {
    const loadRequiredIndicators = async () => {
      if (currentStep !== 13) return;

      try {
        setIndicatorsLoading(true);
        const [opcionesResponse, ...preguntas] = await Promise.all([
          getOpcionesRespuesta(),
          ...INDICATOR_QUESTION_NUMBERS.map((n) => getPreguntaPorNumero(n)),
        ]);

        const preguntasData = preguntas as any[];
        const opciones = opcionesResponse.data as any[];

        const respuestasIndicadores: Array<{ id_pregunta: string; id_opcion_respuesta: string }> = [];

        preguntasData.forEach((preg, idx) => {
          const num = INDICATOR_QUESTION_NUMBERS[idx];
          const field = INDICATOR_FIELD_MAPPING[num];
          const val = state[field] as any;

          if (val === true) {
            const yesId = getYesOptionIdForPregunta(preg.id, opciones);
            if (yesId) respuestasIndicadores.push({ id_pregunta: preg.id, id_opcion_respuesta: yesId });
          }
        });

        if (respuestasIndicadores.length === 0) {
          setRequiredIndicators([]);
          return;
        }

        const dynamicIndicators = await obtenerIndicadoresPorRespuestas({ respuestas: respuestasIndicadores });
        setRequiredIndicators(dynamicIndicators || []);
      } catch (e) {
        setRequiredIndicators([]);
      } finally {
        setIndicatorsLoading(false);
      }
    };

    loadRequiredIndicators();
  }, [
    currentStep,
    state.unidadAlmacenamiento,
    state.aforoResiduos,
    state.generaOrganicos,
    state.generaAprovechables,
    state.programaComunicacion,
  ]);

  return { requiredIndicators, indicatorsLoading };
}
