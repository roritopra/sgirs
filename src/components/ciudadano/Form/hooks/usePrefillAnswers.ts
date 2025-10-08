import { useEffect } from "react";
import { useFormContext } from "../FormContext";
import {
  verifyFormForPeriod,
  getFormAnswersByPeriod,
} from "@/services/ciudadano/FormService/forms.service";
import {
  getOpcionesRespuesta,
  getPreguntaPorNumero,
} from "@/services/ciudadano/FormService/questions.service";
import { QUESTION_NUMBER_TO_STEP } from "../stepper.constants";
import {
  normalize,
  parseBooleanFromLabel,
  groupByPregunta,
  extractMultiSelectIds,
  buildOpcionByIdMap,
  buildOpcionesByPreguntaMap,
} from "../stepper.utils";
import type { RespuestaUsuario, OpcionRespuesta } from "../stepper.types";
import { prefillStaticFields } from "./usePrefillAnswers.helpers";

export function usePrefillAnswers(
  periodId: string | null,
  setIsPrefilling: (value: boolean) => void,
  autoJumpDone: boolean,
  setAutoJumpDone: (value: boolean) => void,
  setCurrentStep: (step: number) => void,
  currentStep: number
) {
  const { state, updateForm } = useFormContext();

  useEffect(() => {
    const prefill = async () => {
      if (!periodId) return;

      try {
        setIsPrefilling(true);
        const verification = await verifyFormForPeriod(periodId);
        const exists = Array.isArray(verification) && verification.length > 0;

        if (!exists) return;

        const answersRaw = await getFormAnswersByPeriod(periodId);
        const list: RespuestaUsuario[] = Array.isArray(answersRaw)
          ? (answersRaw as any[])
          : ((answersRaw as any)?.respuestas_usuario ?? (answersRaw as any)?.data ?? []);

        const opcionesResp = await getOpcionesRespuesta(1, 1000);
        const opcionesByPregunta = buildOpcionesByPreguntaMap(opcionesResp.data);
        const opcionById = buildOpcionByIdMap(opcionesResp.data);

        const nextDynamicAnswers: Record<string, any> = {};
        const nextDynamicAttachments: Record<string, any> = {};
        const staticUpdates: any = {};

        const hasNum = list.some((it) => typeof it?.num_pregunta !== "undefined");

        if (hasNum) {
          await prefillFromNumPregunta(
            list,
            opcionesByPregunta,
            opcionById,
            nextDynamicAnswers,
            nextDynamicAttachments,
            staticUpdates,
            updateForm
          );
        } else {
          await prefillFromIds(
            list,
            opcionesByPregunta,
            opcionById,
            nextDynamicAnswers,
            nextDynamicAttachments,
            staticUpdates
          );
        }

        // Aplicar una sola actualización del estado
        updateForm({
          ...staticUpdates,
          dynamicAnswers: { ...(state.dynamicAnswers || {}), ...nextDynamicAnswers },
          dynamicAttachments: { ...(state.dynamicAttachments || {}), ...nextDynamicAttachments },
        });

        // Auto-salto al último paso respondido
        if (!autoJumpDone && exists) {
          const targetStep = await computeAutoJump(list, hasNum);
          if (targetStep && targetStep !== currentStep) {
            setCurrentStep(targetStep);
            setAutoJumpDone(true);
          }
        }
      } catch (e) {
        console.error("Prefill error:", e);
      } finally {
        setIsPrefilling(false);
      }
    };

    prefill();
  }, [periodId]);
}

/**
 * Prefill cuando la API trae num_pregunta
 */
async function prefillFromNumPregunta(
  list: RespuestaUsuario[],
  opcionesByPregunta: Record<string, OpcionRespuesta[]>,
  opcionById: Record<string, string>,
  nextDynamicAnswers: Record<string, any>,
  nextDynamicAttachments: Record<string, any>,
  staticUpdates: any,
  updateForm: any
) {
  const numsUnique = Array.from(
    new Set(
      list
        .map((it) => Number(it.num_pregunta))
        .filter((n) => Number.isFinite(n))
    )
  );

  const preguntaObjs = await Promise.all(
    numsUnique.map((n) => getPreguntaPorNumero(n).catch(() => null))
  );
  const numToQId: Record<number, string> = {};
  preguntaObjs.forEach((q, idx) => {
    if (q?.id) numToQId[numsUnique[idx]] = q.id;
  });

  const grouped = groupByPregunta(
    list.map((item) => ({
      ...item,
      id_pregunta: numToQId[Number(item.num_pregunta)] || "",
    })).filter((item) => item.id_pregunta)
  );

  for (const [qid, group] of Object.entries(grouped)) {
    const first = group[0] || {};
    const firstResp = first.opcion_respuesta;

    if (Array.isArray(firstResp)) {
      const options = opcionesByPregunta[qid] || [];
      const ids = extractMultiSelectIds(group as any, options);
      if (ids.length > 0) {
        nextDynamicAnswers[qid] = Array.from(new Set(ids));
      }
    } else {
      const label = String(firstResp || "");
      const boolVal = parseBooleanFromLabel(label);

      if (boolVal !== null) {
        nextDynamicAnswers[qid] = boolVal;
      } else {
        const options = opcionesByPregunta[qid] || [];
        const match = options.find((o) => normalize(o.opcion_respuesta) === normalize(label));
        if (group.length > 1) {
          const ids = extractMultiSelectIds(group as any, options);
          if (ids.length > 0) nextDynamicAnswers[qid] = Array.from(new Set(ids));
        } else if (match) {
          nextDynamicAnswers[qid] = match.id;
        }
      }
    }

    const withFile = group.find((g: any) => g.archivo_anexo && String(g.archivo_anexo).length > 0);
    if (withFile) {
      const url = String(withFile.archivo_anexo);
      const name = String(withFile.nombre_anexo || url.split("/").pop() || "Documento.pdf");
      nextDynamicAttachments[qid] = { name, size: 0, type: "application/pdf", url };
    }
  }

  // Mapeo de campos estáticos
  prefillStaticFields(list, numToQId, opcionesByPregunta, staticUpdates, updateForm);
}

/**
 * Prefill cuando la API ya trae IDs directamente
 */
async function prefillFromIds(
  list: RespuestaUsuario[],
  opcionesByPregunta: Record<string, OpcionRespuesta[]>,
  opcionById: Record<string, string>,
  nextDynamicAnswers: Record<string, any>,
  nextDynamicAttachments: Record<string, any>,
  staticUpdates: any
) {
  const byPregunta = groupByPregunta(list);

  for (const [id_pregunta, group] of Object.entries(byPregunta)) {
    const opts = group as any[];
    if (opts.length > 1) {
      const ids = opts.map((g) => g.id_opcion_respuesta).filter(Boolean);
      nextDynamicAnswers[id_pregunta] = ids;
    } else if (opts.length === 1) {
      const item = opts[0];
      const label = opcionById[item.id_opcion_respuesta] || "";
      const boolVal = parseBooleanFromLabel(label);
      if (boolVal !== null) {
        nextDynamicAnswers[id_pregunta] = boolVal;
      } else {
        nextDynamicAnswers[id_pregunta] = item.id_opcion_respuesta;
      }
    }

    const withFile = (group as any[]).find((g) => g.archivo_anexo && String(g.archivo_anexo).length > 0);
    if (withFile) {
      const url = String(withFile.archivo_anexo);
      const name = String(withFile.nombre_anexo || url.split("/").pop() || "Documento.pdf");
      nextDynamicAttachments[id_pregunta] = { name, size: 0, type: "application/pdf", url };
    }
  }

  // Mapeo de Steps 7-12 cuando vienen IDs
  await prefillStepsFromIds(list, byPregunta, opcionById, staticUpdates);
}

/**
 * Computa el step objetivo para auto-navegación
 */
async function computeAutoJump(list: RespuestaUsuario[], hasNum: boolean): Promise<number> {
  let lastNum = 0;
  let answered43 = false;

  if (hasNum) {
    for (const it of list) {
      const n = Number(it.num_pregunta);
      if (Number.isFinite(n)) {
        lastNum = Math.max(lastNum, n);
        if (n === 43) answered43 = true;
      }
    }
  } else {
    const allNums = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
      11, 12, 13, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
      25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44,
    ];
    const preguntasAll = await Promise.all(
      allNums.map((n) => getPreguntaPorNumero(n).catch(() => null))
    );
    const idToNum: Record<string, number> = {};
    preguntasAll.forEach((q, idx) => {
      if (q?.id) idToNum[q.id] = allNums[idx];
    });
    for (const it of list) {
      const n = idToNum[it.id_pregunta];
      if (Number.isFinite(n)) {
        lastNum = Math.max(lastNum, n);
      }
    }

    try {
      const p43 = await getPreguntaPorNumero(43).catch(() => null);
      const id43 = p43?.id;
      if (id43) {
        answered43 = list.some((it) => it.id_pregunta === id43);
      }
    } catch {}
  }

  return answered43 ? 13 : (QUESTION_NUMBER_TO_STEP[lastNum] || 1);
}

/**
 * Mapeo adicional de Steps 7-12 cuando vienen IDs
 */
async function prefillStepsFromIds(
  list: RespuestaUsuario[],
  byPregunta: Record<string, RespuestaUsuario[]>,
  opcionById: Record<string, string>,
  staticUpdates: any
) {
  try {
    const nums = [17, 18, 19, 20, 21, 22, 23, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43];
    const preguntas = await Promise.all(nums.map((n) => getPreguntaPorNumero(n).catch(() => null)));
    const numToId: Record<number, string> = {};
    preguntas.forEach((q, idx) => {
      if (q?.id) numToId[nums[idx]] = q.id;
    });

    // Step 7: Aprovechables (17, 18, 19)
    if (numToId[17] && byPregunta[numToId[17]]?.[0]) {
      const n = normalize(opcionById[byPregunta[numToId[17]][0].id_opcion_respuesta] || "");
      staticUpdates.generaAprovechables = n === "si" ? true : n === "no" ? false : null;
    }
    if (numToId[18] && byPregunta[numToId[18]]) {
      const ids = byPregunta[numToId[18]].map((r) => r.id_opcion_respuesta).filter(Boolean);
      staticUpdates.tiposAprovechables = ids;
    }
    if (numToId[19] && byPregunta[numToId[19]]?.[0]) {
      const n = normalize(opcionById[byPregunta[numToId[19]][0].id_opcion_respuesta] || "");
      staticUpdates.recoleccionAprovechables = n === "si" ? true : n === "no" ? false : null;
    }

    // Step 8: Gestores de Aprovechables (20, 21, 22, 23)
    if (numToId[20] && byPregunta[numToId[20]]?.[0]) {
      const n = normalize(opcionById[byPregunta[numToId[20]][0].id_opcion_respuesta] || "");
      staticUpdates.esORO = n === "si" ? true : n === "no" ? false : null;
    }
    if (numToId[21] && byPregunta[numToId[21]]?.[0]) {
      staticUpdates.organizacionRecicladores = opcionById[byPregunta[numToId[21]][0].id_opcion_respuesta] || "";
    }
    if (numToId[22] && byPregunta[numToId[22]]?.[0]) {
      staticUpdates.gestorNoORO = opcionById[byPregunta[numToId[22]][0].id_opcion_respuesta] || "";
    }
    if (numToId[23] && byPregunta[numToId[23]]?.[0]) {
      staticUpdates.frecuenciaAprovechables = byPregunta[numToId[23]][0].id_opcion_respuesta || "";
    }

    // Step 9: ACU (25, 26, 27, 28)
    if (numToId[25] && byPregunta[numToId[25]]?.[0]) {
      const n = normalize(opcionById[byPregunta[numToId[25]][0].id_opcion_respuesta] || "");
      staticUpdates.generaACU = n === "si" ? true : n === "no" ? false : null;
    }
    if (numToId[26] && byPregunta[numToId[26]]?.[0]) {
      const n = normalize(opcionById[byPregunta[numToId[26]][0].id_opcion_respuesta] || "");
      staticUpdates.recoleccionACU = n === "si" ? true : n === "no" ? false : null;
    }
    if (numToId[27] && byPregunta[numToId[27]]?.[0]) {
      staticUpdates.gestorACU = byPregunta[numToId[27]][0].id_opcion_respuesta || "";
    }
    if (numToId[28] && byPregunta[numToId[28]]?.[0]) {
      staticUpdates.frecuenciaACU = byPregunta[numToId[28]][0].id_opcion_respuesta || "";
    }

    // Step 10: RAEE (29, 30, 31, 32)
    if (numToId[29] && byPregunta[numToId[29]]?.[0]) {
      const n = normalize(opcionById[byPregunta[numToId[29]][0].id_opcion_respuesta] || "");
      staticUpdates.generaRAEE = n === "si" ? true : n === "no" ? false : null;
    }
    if (numToId[30] && byPregunta[numToId[30]]) {
      const ids = byPregunta[numToId[30]].map((r) => r.id_opcion_respuesta).filter(Boolean);
      staticUpdates.tiposRAEE = ids;
    }
    if (numToId[31] && byPregunta[numToId[31]]?.[0]) {
      const n = normalize(opcionById[byPregunta[numToId[31]][0].id_opcion_respuesta] || "");
      staticUpdates.recoleccionRAEE = n === "si" ? true : n === "no" ? false : null;
    }
    if (numToId[32] && byPregunta[numToId[32]]?.[0]) {
      staticUpdates.gestorRAEE = byPregunta[numToId[32]][0].id_opcion_respuesta || "";
    }

    // Step 11: RCD (33, 34, 35)
    if (numToId[33] && byPregunta[numToId[33]]?.[0]) {
      const n = normalize(opcionById[byPregunta[numToId[33]][0].id_opcion_respuesta] || "");
      staticUpdates.generaRCD = n === "si" ? true : n === "no" ? false : null;
    }
    if (numToId[34] && byPregunta[numToId[34]]?.[0]) {
      const n = normalize(opcionById[byPregunta[numToId[34]][0].id_opcion_respuesta] || "");
      staticUpdates.recoleccionRCD = n === "si" ? true : n === "no" ? false : null;
    }
    if (numToId[35] && byPregunta[numToId[35]]?.[0]) {
      staticUpdates.gestorRCD = byPregunta[numToId[35]][0].id_opcion_respuesta || "";
    }

    // Step 12: RESPEL y Voluminosos (36, 37, 38, 39, 40, 41, 42, 43)
    if (numToId[36] && byPregunta[numToId[36]]?.[0]) {
      const n = normalize(opcionById[byPregunta[numToId[36]][0].id_opcion_respuesta] || "");
      staticUpdates.generaRESPEL = n === "si" ? true : n === "no" ? false : null;
    }
    if (numToId[37] && byPregunta[numToId[37]]) {
      const ids = byPregunta[numToId[37]].map((r) => r.id_opcion_respuesta).filter(Boolean);
      staticUpdates.tiposRESPEL = ids;
    }
    if (numToId[38] && byPregunta[numToId[38]]?.[0]) {
      const n = normalize(opcionById[byPregunta[numToId[38]][0].id_opcion_respuesta] || "");
      staticUpdates.recoleccionRESPEL = n === "si" ? true : n === "no" ? false : null;
    }
    if (numToId[39] && byPregunta[numToId[39]]?.[0]) {
      staticUpdates.gestorRESPEL = byPregunta[numToId[39]][0].id_opcion_respuesta || "";
    }
    if (numToId[40] && byPregunta[numToId[40]]?.[0]) {
      const n = normalize(opcionById[byPregunta[numToId[40]][0].id_opcion_respuesta] || "");
      staticUpdates.generaVoluminosos = n === "si" ? true : n === "no" ? false : null;
    }
    if (numToId[41] && byPregunta[numToId[41]]) {
      const ids = byPregunta[numToId[41]].map((r) => r.id_opcion_respuesta).filter(Boolean);
      staticUpdates.tiposVoluminosos = ids;
    }
    if (numToId[42] && byPregunta[numToId[42]]?.[0]) {
      const n = normalize(opcionById[byPregunta[numToId[42]][0].id_opcion_respuesta] || "");
      staticUpdates.conoceLineasVoluminosos = n === "si" ? true : n === "no" ? false : null;
    }
    if (numToId[43] && byPregunta[numToId[43]]?.[0]) {
      const n = normalize(opcionById[byPregunta[numToId[43]][0].id_opcion_respuesta] || "");
      staticUpdates.programaComunicacion = n === "si" ? true : n === "no" ? false : null;
    }
  } catch (e) {
    console.error("Error en prefillStepsFromIds:", e);
  }
}
