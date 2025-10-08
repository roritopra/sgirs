/**
 * Utilidades y funciones helper para el componente Stepper
 */

import type { OpcionRespuesta, MonthKeyUI } from "./stepper.types";

/**
 * Normaliza strings para comparación insensible a mayúsculas y acentos
 */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

/**
 * Valida si un string es un UUID válido
 */
export function isUUID(v: unknown): v is string {
  return (
    typeof v === "string" &&
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(v)
  );
}

/**
 * Resuelve una respuesta (string, boolean) a su id_opcion_respuesta correspondiente
 */
export function resolveOpcion(
  id_pregunta: string,
  val: any,
  opcionesByPregunta: Record<string, OpcionRespuesta[]>
): string | null {
  const list = opcionesByPregunta[id_pregunta] || [];

  if (typeof val === "string") {
    if (isUUID(val)) return val;
    const found = list.find((o) => normalize(o.opcion_respuesta) === normalize(val));
    return found?.id || null;
  }

  if (typeof val === "boolean") {
    const target = val ? "si" : "no";
    const found = list.find((o) => normalize(o.opcion_respuesta) === target);
    return found?.id || null;
  }

  return null;
}

/**
 * Obtiene el ID de la opción "Sí" para una pregunta específica
 */
export function getYesOptionIdForPregunta(
  preguntaId: string,
  opciones: Array<{ id: string; opcion_respuesta: string; id_pregunta: string }>
): string | null {
  const opts = opciones.filter((o) => o.id_pregunta === preguntaId);
  const yes = opts.find((o) => {
    const t = String(o.opcion_respuesta || "").toLowerCase();
    return t.includes("sí") || t.includes("si") || t === "true";
  });
  return yes?.id || null;
}

/**
 * Obtiene el valor de un indicador específico para un mes y variable
 */
export function getIndicatorValue(
  indicadores: any,
  indicatorNum: number,
  mesKey: MonthKeyUI,
  varIndex: number
): string {
  const key = `indicador${indicatorNum}`;
  const indicator = indicadores[key];

  if (!indicator || !indicator.meses) return "";

  const mesData = indicator.meses[mesKey];
  if (!mesData) return "";

  const fields = Object.keys(mesData);
  const fieldName = fields[varIndex];
  return fieldName ? String(mesData[fieldName] || "") : "";
}

/**
 * Determina los meses a renderizar según el periodo
 */
export function getMonthsForPeriod(periodo: string | null): MonthKeyUI[] {
  if (periodo && periodo.includes("-II")) {
    return ["jul", "ago", "sep", "oct", "nov", "dic"];
  }
  return ["ene", "feb", "mar", "abr", "may", "jun"];
}

/**
 * Convierte un valor de respuesta booleano basado en el label normalizado
 */
export function parseBooleanFromLabel(label: string): boolean | null {
  const normalized = normalize(label);
  if (normalized === "si" || normalized === "si.") return true;
  if (normalized === "no") return false;
  return null;
}

/**
 * Agrupa respuestas por id_pregunta
 */
export function groupByPregunta<T extends { id_pregunta: string }>(items: T[]): Record<string, T[]> {
  return items.reduce((acc, item) => {
    if (!acc[item.id_pregunta]) {
      acc[item.id_pregunta] = [];
    }
    acc[item.id_pregunta].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

/**
 * Extrae IDs de opciones desde respuestas multi-selección
 */
export function extractMultiSelectIds(
  group: Array<{ opcion_respuesta?: string | string[] }>,
  opcionesByPregunta: OpcionRespuesta[]
): string[] {
  const ids: string[] = [];

  for (const g of group) {
    const resp = g.opcion_respuesta;
    if (Array.isArray(resp)) {
      const mapped = resp
        .map((lab: any) => {
          const m = opcionesByPregunta.find((o) => normalize(o.opcion_respuesta) === normalize(String(lab || "")));
          return m?.id;
        })
        .filter(Boolean) as string[];
      ids.push(...mapped);
    } else {
      const m = opcionesByPregunta.find((o) => normalize(o.opcion_respuesta) === normalize(String(resp || "")));
      if (m?.id) ids.push(m.id);
    }
  }

  return Array.from(new Set(ids));
}

/**
 * Construye el mapeo de ID de opción por ID de respuesta
 */
export function buildOpcionByIdMap(opciones: OpcionRespuesta[]): Record<string, string> {
  return opciones.reduce((acc, o) => {
    acc[o.id] = o.opcion_respuesta;
    return acc;
  }, {} as Record<string, string>);
}

/**
 * Construye el mapeo de opciones agrupadas por pregunta
 */
export function buildOpcionesByPreguntaMap(
  opciones: OpcionRespuesta[]
): Record<string, OpcionRespuesta[]> {
  return opciones.reduce((acc, o) => {
    if (!acc[o.id_pregunta]) {
      acc[o.id_pregunta] = [];
    }
    acc[o.id_pregunta].push(o);
    return acc;
  }, {} as Record<string, OpcionRespuesta[]>);
}
