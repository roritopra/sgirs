import { useEffect } from "react";
import { useFormContext } from "../FormContext";
import {
  getOpcionesRespuesta,
  getPreguntaPorNumero,
} from "@/services/ciudadano/FormService/questions.service";
import {
  obtenerIndicadoresPorRespuestas,
  getPartialIndicators,
} from "@/services/ciudadano/FormService/indicators.service";
import { INDICATOR_QUESTION_NUMBERS, INDICATOR_FIELD_MAPPING, API_TO_UI_MONTHS } from "../stepper.constants";
import { getYesOptionIdForPregunta, normalize } from "../stepper.utils";
import type { StepNumber } from "../stepper.types";

export function usePrefillIndicators(
  currentStep: StepNumber,
  periodId: string | null,
  indicatorsPrefilled: boolean,
  setIndicatorsPrefilled: (value: boolean) => void
) {
  const { state, updateForm } = useFormContext();

  useEffect(() => {
    const prefillIndicatorsIfReady = async () => {
      if (currentStep !== 13) return;
      if (indicatorsPrefilled) return;
      if (!periodId) return;

      try {
        // Cargar parciales directamente
        const partial = await getPartialIndicators(periodId).catch(() => null);
        const respuestasParciales: any[] = Array.isArray((partial as any)?.respuestas)
          ? (partial as any).respuestas
          : Array.isArray((partial as any)?.data?.respuestas)
          ? (partial as any).data.respuestas
          : [];

        if (respuestasParciales.length === 0) return;

        // Determinar indicadores dinámicos habilitados con el estado actual
        const [opResp, ...pregs] = await Promise.all([
          getOpcionesRespuesta(),
          ...INDICATOR_QUESTION_NUMBERS.map((n) => getPreguntaPorNumero(n)),
        ]);
        const opts = opResp.data as any[];

        const respuestasIndicadores: Array<{ id_pregunta: string; id_opcion_respuesta: string }> = [];

        (pregs as any[]).forEach((preg, idx) => {
          const num = INDICATOR_QUESTION_NUMBERS[idx];
          const field = INDICATOR_FIELD_MAPPING[num];
          const val = state[field] as any;
          if (val === true) {
            const yesId = getYesOptionIdForPregunta(preg.id, opts);
            if (yesId) respuestasIndicadores.push({ id_pregunta: preg.id, id_opcion_respuesta: yesId });
          }
        });

        if (respuestasIndicadores.length === 0) return;

        const dyn = (await obtenerIndicadoresPorRespuestas({ respuestas: respuestasIndicadores })) as any[];
        if (!dyn || dyn.length === 0) return;

        const byName: Record<string, any> = {};
        dyn.forEach((d) => {
          byName[normalize(String(d.nombre_indicador || ""))] = d;
        });

        const indicatorsUpdate: any = { ...(state.indicadores as any) };

        for (const item of respuestasParciales) {
          const di = byName[normalize(String(item.nombre_indicador || ""))];
          if (!di) continue; // Indicador no habilitado actualmente

          if (Array.isArray(item.variables)) {
            const num = di.num_indicador as number;
            const key = `indicador${num}` as keyof typeof indicatorsUpdate;
            const group = indicatorsUpdate[key];
            if (!group || !group.meses) continue;

            const dynVars: any[] = di.variables || [];
            for (const v of item.variables) {
              const varIdx = dynVars.findIndex(
                (dv: any) => normalize(String(dv.nombre_variable || "")) === normalize(String(v.nombre_variable || ""))
              );
              if (varIdx < 0) continue;
              const meses = v.respuesta_por_mes || {};
              for (const [apiMes, val] of Object.entries(meses)) {
                const uiMes = API_TO_UI_MONTHS[apiMes as keyof typeof API_TO_UI_MONTHS];
                if (!uiMes || !group.meses[uiMes]) continue;
                const mesData = group.meses[uiMes];
                const fields = Object.keys(mesData);
                const fieldName = fields[varIdx];
                if (!fieldName) continue;
                group.meses[uiMes] = { ...mesData, [fieldName]: String(val ?? 0) };
              }
            }
            indicatorsUpdate[key] = group;
          } else if (Array.isArray(item.respuestas) && di.es_uar) {
            const preguntasUAR: any[] = di.preguntas || [];
            const condiciones: any = { ...indicatorsUpdate.indicador4.condiciones };
            for (const r of item.respuestas) {
              const idx = preguntasUAR.findIndex(
                (p: any) => normalize(String(p.pregunta || "")) === normalize(String(r.pregunta || ""))
              );
              if (idx >= 0) {
                condiciones[`condicion${idx + 1}`] = String(r.respuesta || "").toLowerCase().startsWith("s");
              }
            }
            indicatorsUpdate.indicador4 = {
              ...indicatorsUpdate.indicador4,
              condiciones,
            };
          }
        }

        updateForm({ indicadores: indicatorsUpdate });
        setIndicatorsPrefilled(true);
      } catch (err) {
        console.warn("Prefill indicadores (Step 13) omitido:", err);
      }
    };

    prefillIndicatorsIfReady();
  }, [
    currentStep,
    periodId,
    indicatorsPrefilled,
    state.unidadAlmacenamiento,
    state.aforoResiduos,
    state.generaOrganicos,
    state.generaAprovechables,
    state.programaComunicacion,
  ]);
}
