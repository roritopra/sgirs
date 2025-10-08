/**
 * Servicio para construcción de payloads y envío de formularios
 */

import type { FormState } from "../FormContext";
import type { 
  AnswerPayload, 
  OpcionRespuesta, 
  DynamicIndicator,
  IndicatorVariable,
  IndicatorsPayload 
} from "../stepper.types";
import { 
  API_MONTHS, 
  UI_TO_API_MONTHS, 
  FILE_UPLOAD_MAPPING 
} from "../stepper.constants";
import { 
  resolveOpcion, 
  getIndicatorValue,
  buildOpcionesByPreguntaMap,
  getMonthsForPeriod 
} from "../stepper.utils";
import { getPreguntaPorNumero } from "@/services/ciudadano/FormService/questions.service";

/**
 * Construye el payload de respuestas para envío
 */
export function buildAnswersPayload(
  dynamicAnswers: Record<string, any>,
  opcionesByPregunta: Record<string, OpcionRespuesta[]>,
  periodId: string,
  usuarioId: string,
  forFinal: boolean = false
): AnswerPayload[] {
  const entries = Object.entries(dynamicAnswers);
  const nowIso = new Date().toISOString();

  return entries.reduce<AnswerPayload[]>((acc, [id_pregunta, value]) => {
    if (value === undefined || value === null || value === "") return acc;

    if (Array.isArray(value)) {
      for (const v of value) {
        const id_opcion_respuesta = resolveOpcion(id_pregunta, v, opcionesByPregunta);
        if (!id_opcion_respuesta) continue;

        acc.push({
          id_pregunta,
          id_opcion_respuesta,
          id_periodo_encuesta: periodId,
          ...(forFinal && { id_usuario: usuarioId }),
          ...(!forFinal && { 
            tipo_pregunta: "OPCION MULTIPLE",
            fecha_respuesta: nowIso,
            status: "no completado" 
          }),
        });
      }
      return acc;
    }

    const id_opcion_respuesta = resolveOpcion(id_pregunta, value, opcionesByPregunta);
    if (!id_opcion_respuesta) return acc;

    acc.push({
      id_pregunta,
      id_opcion_respuesta,
      id_periodo_encuesta: periodId,
      ...(forFinal && { id_usuario: usuarioId }),
      ...(!forFinal && { 
        fecha_respuesta: nowIso,
        status: "no completado" 
      }),
    });

    return acc;
  }, []);
}

/**
 * Construye el payload de indicadores para envío
 */
export async function buildIndicatorsPayload(
  state: FormState,
  dynamicIndicators: DynamicIndicator[],
  periodId: string,
  periodo: string | null,
  partial: boolean = false
): Promise<IndicatorsPayload> {
  const uiMeses = getMonthsForPeriod(periodo);

  const respuestas: any[] = [];

  for (const indicator of dynamicIndicators) {
    if (indicator.es_uar) {
      const preguntasUAR = indicator.preguntas || [];
      const respuestasPreguntas = preguntasUAR.reduce((arr: any[], p: any, idx: number) => {
        const key = `condicion${idx + 1}` as keyof typeof state.indicadores.indicador4.condiciones;
        const v = state.indicadores.indicador4.condiciones[key];
        
        // Para guardado parcial, omitir no iniciadas
        if (partial && (v === null || v === undefined)) return arr;
        
        arr.push({ pregunta: p.pregunta, respuesta: v === true ? "Sí" : "No" });
        return arr;
      }, []);

      if (respuestasPreguntas.length > 0) {
        respuestas.push({ nombre_indicador: indicator.nombre_indicador, respuestas: respuestasPreguntas });
      }
    } else {
      const variables = (indicator.variables || []).reduce((accVars: IndicatorVariable[], v: any, varIndex: number) => {
        // Para guardado parcial, verificar si la variable está iniciada
        if (partial) {
          const started = uiMeses.some((uiMes) => {
            const raw = getIndicatorValue(state.indicadores, indicator.num_indicador, uiMes, varIndex);
            return raw !== null && raw !== undefined && String(raw).trim() !== "";
          });
          if (!started) return accVars;
        }

        const respuesta_por_mes: Record<string, number> = {};
        
        // Inicializar todos los meses en 0
        for (const m of API_MONTHS) {
          respuesta_por_mes[m] = 0;
        }

        // Llenar solo los meses del semestre activo
        for (const uiMes of uiMeses) {
          const apiMes = UI_TO_API_MONTHS[uiMes];
          const raw = getIndicatorValue(state.indicadores, indicator.num_indicador, uiMes, varIndex);
          const num = parseFloat(raw || "0") || 0;
          respuesta_por_mes[apiMes] = num;
        }

        accVars.push({ nombre_variable: v.nombre_variable, respuesta_por_mes });
        return accVars;
      }, [] as IndicatorVariable[]);

      if (variables.length > 0) {
        respuestas.push({ nombre_indicador: indicator.nombre_indicador, variables });
      }
    }
  }

  return {
    periodo_encuesta_id: periodId,
    respuestas,
  };
}

/**
 * Sube archivos adjuntos al servidor
 */
export async function uploadFilesForPeriod(
  periodId: string,
  dynamicAttachments: Record<string, any>,
  uploadAnswerFilesApi: (periodId: string, formData: FormData) => Promise<any>
): Promise<void> {
  try {
    console.log(`[uploadFilesForPeriod] Inicio. Periodo: ${periodId}`);

    const preguntas = await Promise.all(
      FILE_UPLOAD_MAPPING.map((m) => getPreguntaPorNumero(m.num).catch(() => null))
    );

    const numToId: Record<number, string> = {};
    preguntas.forEach((q, idx) => {
      if (q?.id) numToId[FILE_UPLOAD_MAPPING[idx].num] = q.id;
    });

    const fd = new FormData();
    let appended = false;
    const appendedFiles: Array<{ num: number; field: string; qid: string; name: string; size: number }> = [];

    for (const { num, field } of FILE_UPLOAD_MAPPING) {
      const qid = numToId[num];
      const att = qid ? dynamicAttachments?.[qid] : undefined;
      if (att?.file) {
        try {
          fd.append(field, att.file as File, att.file!.name);
          appended = true;
          appendedFiles.push({ num, field, qid, name: att.file!.name, size: att.file!.size });
          console.log(`[uploadFilesForPeriod] Append campo="${field}", P${num}, qid=${qid}, file="${att.file!.name}", size=${att.file!.size}`);
        } catch (e) {
          // si falla adjuntar, omitimos el campo
        }
      }
    }

    if (!appended) {
      console.log(`[uploadFilesForPeriod] Sin archivos nuevos para subir.`);
      return;
    }

    console.log(`[uploadFilesForPeriod] Subiendo ${appendedFiles.length} archivo(s):`, appendedFiles);
    await uploadAnswerFilesApi(periodId, fd);
    console.log(`[uploadFilesForPeriod] Subida exitosa.`);
  } catch (err) {
    console.error("Error subiendo archivos:", err);
    throw err;
  }
}
