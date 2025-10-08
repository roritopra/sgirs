import type { RespuestaUsuario, OpcionRespuesta } from "../stepper.types";
import { normalize, parseBooleanFromLabel, extractMultiSelectIds } from "../stepper.utils";

export function prefillStaticFields(
  list: RespuestaUsuario[],
  numToQId: Record<number, string>,
  opcionesByPregunta: Record<string, OpcionRespuesta[]>,
  staticUpdates: any,
  updateForm: any
) {
  for (const item of list) {
    const num = Number(item.num_pregunta);
    const lbl = normalize(String(item.opcion_respuesta || ""));
    const boolVal = parseBooleanFromLabel(lbl);

    // Steps 1-5
    if (num === 1) staticUpdates.manualSGIRS = boolVal;
    if (num === 2) staticUpdates.esquemaOrganizacional = boolVal;
    if (num === 3) staticUpdates.caracterizacionResiduos = boolVal;
    if (num === 4) staticUpdates.separacionFuente = boolVal;
    if (num === 5) staticUpdates.mobiliarioSeparacion = boolVal;
    if (num === 6) staticUpdates.planoRutas = boolVal;
    if (num === 7) staticUpdates.unidadAlmacenamiento = boolVal;
    if (num === 8) {
      const qid = numToQId[num];
      const match = (opcionesByPregunta[qid] || []).find((o) => normalize(o.opcion_respuesta) === lbl);
      staticUpdates.empresaAseo = match?.id || "";
    }
    if (num === 9) {
      const qid = numToQId[num];
      const match = (opcionesByPregunta[qid] || []).find((o) => normalize(o.opcion_respuesta) === lbl);
      staticUpdates.frecuenciaRecoleccion = match?.id || "";
    }
    if (num === 10) staticUpdates.aforoResiduos = boolVal;
  }

  // Step 6: Orgánicos (11, 12, 13, 15, 16)
  for (const item of list) {
    const num = Number(item.num_pregunta);
    const lbl = normalize(String(item.opcion_respuesta || ""));
    const boolVal = parseBooleanFromLabel(lbl);
    if (num === 11) updateForm({ generaOrganicos: boolVal });
    if (num === 12) updateForm({ recoleccionOrganicos: boolVal });
    if (num === 13) {
      const qid = numToQId[num];
      const match = (opcionesByPregunta[qid] || []).find((o) => normalize(o.opcion_respuesta) === lbl);
      updateForm({ gestorOrganicos: match?.id || "" });
    }
    if (num === 15) {
      const qid = numToQId[num];
      const match = (opcionesByPregunta[qid] || []).find((o) => normalize(o.opcion_respuesta) === lbl);
      updateForm({ frecuenciaOrganicos: match?.id || "" });
    }
    if (num === 16) updateForm({ aprovechamientoInSitu: boolVal });
  }

  // Step 7: Aprovechables (17, 18, 19)
  for (const item of list) {
    const num = Number(item.num_pregunta);
    const lbl = normalize(String(item.opcion_respuesta || ""));
    const boolVal = parseBooleanFromLabel(lbl);
    if (num === 17) staticUpdates.generaAprovechables = boolVal;
    if (num === 19) staticUpdates.recoleccionAprovechables = boolVal;
  }

  // 18 es multi-selección
  const q18 = numToQId[18];
  if (q18 && (opcionesByPregunta[q18] || []).length > 0) {
    const group18 = list.filter((it) => Number(it.num_pregunta) === 18);
    if (group18.length > 0) {
      const ids = extractMultiSelectIds(group18 as any, opcionesByPregunta[q18] || []);
      staticUpdates.tiposAprovechables = ids;
    }
  }

  // Step 8: Gestores de Aprovechables (20, 21, 22, 23, 24)
  for (const item of list) {
    const num = Number(item.num_pregunta);
    const lbl = normalize(String(item.opcion_respuesta || ""));
    const boolVal = parseBooleanFromLabel(lbl);
    if (num === 20) staticUpdates.esORO = boolVal;
    if (num === 21) staticUpdates.organizacionRecicladores = String(item.opcion_respuesta || "");
    if (num === 22) staticUpdates.gestorNoORO = String(item.opcion_respuesta || "");
    if (num === 23) {
      const qid = numToQId[num];
      const match = (opcionesByPregunta[qid] || []).find((o) => normalize(o.opcion_respuesta) === lbl);
      staticUpdates.frecuenciaAprovechables = match?.id || "";
    }
  }

  // Step 9: ACU (25, 26, 27, 28)
  for (const item of list) {
    const num = Number(item.num_pregunta);
    const lbl = normalize(String(item.opcion_respuesta || ""));
    const boolVal = parseBooleanFromLabel(lbl);
    if (num === 25) staticUpdates.generaACU = boolVal;
    if (num === 26) staticUpdates.recoleccionACU = boolVal;
    if (num === 27) {
      const qid = numToQId[num];
      const match = (opcionesByPregunta[qid] || []).find((o) => normalize(o.opcion_respuesta) === lbl);
      staticUpdates.gestorACU = match?.id || "";
    }
    if (num === 28) {
      const qid = numToQId[num];
      const match = (opcionesByPregunta[qid] || []).find((o) => normalize(o.opcion_respuesta) === lbl);
      staticUpdates.frecuenciaACU = match?.id || "";
    }
  }

  // Step 10: RAEE (29, 30, 31, 32)
  for (const item of list) {
    const num = Number(item.num_pregunta);
    const lbl = normalize(String(item.opcion_respuesta || ""));
    const boolVal = parseBooleanFromLabel(lbl);
    if (num === 29) staticUpdates.generaRAEE = boolVal;
    if (num === 31) staticUpdates.recoleccionRAEE = boolVal;
    if (num === 32) {
      const qid = numToQId[num];
      const match = (opcionesByPregunta[qid] || []).find((o) => normalize(o.opcion_respuesta) === lbl);
      staticUpdates.gestorRAEE = match?.id || "";
    }
  }

  // 30 (multi): tiposRAEE
  const q30 = numToQId[30];
  if (q30 && (opcionesByPregunta[q30] || []).length > 0) {
    const group30 = list.filter((it) => Number(it.num_pregunta) === 30);
    if (group30.length > 0) {
      const ids = extractMultiSelectIds(group30 as any, opcionesByPregunta[q30] || []);
      staticUpdates.tiposRAEE = ids;
    }
  }

  // Step 11: RCD (33, 34, 35)
  for (const item of list) {
    const num = Number(item.num_pregunta);
    const lbl = normalize(String(item.opcion_respuesta || ""));
    const boolVal = parseBooleanFromLabel(lbl);
    if (num === 33) staticUpdates.generaRCD = boolVal;
    if (num === 34) staticUpdates.recoleccionRCD = boolVal;
    if (num === 35) {
      const qid = numToQId[num];
      const match = (opcionesByPregunta[qid] || []).find((o) => normalize(o.opcion_respuesta) === lbl);
      staticUpdates.gestorRCD = match?.id || "";
    }
  }

  // Step 12: RESPEL y Voluminosos (36-44)
  for (const item of list) {
    const num = Number(item.num_pregunta);
    const lbl = normalize(String(item.opcion_respuesta || ""));
    const boolVal = parseBooleanFromLabel(lbl);
    if (num === 36) staticUpdates.generaRESPEL = boolVal;
    if (num === 38) staticUpdates.recoleccionRESPEL = boolVal;
    if (num === 39) {
      const qid = numToQId[num];
      const match = (opcionesByPregunta[qid] || []).find((o) => normalize(o.opcion_respuesta) === lbl);
      staticUpdates.gestorRESPEL = match?.id || "";
    }
    if (num === 40) staticUpdates.generaVoluminosos = boolVal;
    if (num === 42) staticUpdates.conoceLineasVoluminosos = boolVal;
    if (num === 43) staticUpdates.programaComunicacion = boolVal;
  }

  // 37 (multi): tiposRESPEL
  const q37m = numToQId[37];
  if (q37m && (opcionesByPregunta[q37m] || []).length > 0) {
    const group37 = list.filter((it) => Number(it.num_pregunta) === 37);
    if (group37.length > 0) {
      const ids = extractMultiSelectIds(group37 as any, opcionesByPregunta[q37m] || []);
      staticUpdates.tiposRESPEL = ids;
    }
  }

  // 41 (multi): tiposVoluminosos
  const q41m = numToQId[41];
  if (q41m && (opcionesByPregunta[q41m] || []).length > 0) {
    const group41 = list.filter((it) => Number(it.num_pregunta) === 41);
    if (group41.length > 0) {
      const ids = extractMultiSelectIds(group41 as any, opcionesByPregunta[q41m] || []);
      staticUpdates.tiposVoluminosos = ids;
    }
  }
}
