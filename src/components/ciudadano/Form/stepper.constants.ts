/**
 * Constantes para el componente Stepper
 */

import type { MonthKeyUI, MonthKeyAPI, StepNumber } from "./stepper.types";

/**
 * Mapeo de números de pregunta por step
 * Basado en los Steps existentes del formulario
 */
export const STEP_QUESTION_NUMBERS: Record<StepNumber, number[]> = {
  1: [1],
  2: [2],
  3: [3],
  4: [4, 5, 6, 7],
  5: [8, 9, 10],
  6: [11, 12, 13, 15, 16],
  7: [17, 18, 19],
  8: [20, 21, 22, 23, 24],
  9: [25, 26, 27, 28],
  10: [29, 30, 31, 32],
  11: [33, 34, 35],
  12: [36, 37, 38, 39, 40, 41, 42, 43, 44],
  13: [], // Indicadores (no tiene preguntas directas)
};

/**
 * Mapeo de número de pregunta a step del formulario
 * Usado para auto-navegación después del prefill
 */
export const QUESTION_NUMBER_TO_STEP: Record<number, StepNumber> = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 4,
  6: 4,
  7: 4,
  8: 5,
  9: 5,
  10: 5,
  11: 6,
  12: 6,
  13: 6,
  15: 6,
  16: 6,
  17: 7,
  18: 7,
  19: 7,
  20: 8,
  21: 8,
  22: 8,
  23: 8,
  24: 8,
  25: 9,
  26: 9,
  27: 9,
  28: 9,
  29: 10,
  30: 10,
  31: 10,
  32: 10,
  33: 11,
  34: 11,
  35: 11,
  36: 12,
  37: 12,
  38: 12,
  39: 12,
  40: 12,
  41: 12,
  42: 12,
  43: 12,
  44: 12,
};

/**
 * Meses en formato API (nombres completos en español)
 */
export const API_MONTHS: readonly MonthKeyAPI[] = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

/**
 * Mapeo de meses UI (abreviados) a meses API (completos)
 */
export const UI_TO_API_MONTHS: Record<MonthKeyUI, MonthKeyAPI> = {
  ene: "enero",
  feb: "febrero",
  mar: "marzo",
  abr: "abril",
  may: "mayo",
  jun: "junio",
  jul: "julio",
  ago: "agosto",
  sep: "septiembre",
  oct: "octubre",
  nov: "noviembre",
  dic: "diciembre",
};

/**
 * Mapeo de meses API (completos) a meses UI (abreviados)
 */
export const API_TO_UI_MONTHS: Record<MonthKeyAPI, MonthKeyUI> = {
  enero: "ene",
  febrero: "feb",
  marzo: "mar",
  abril: "abr",
  mayo: "may",
  junio: "jun",
  julio: "jul",
  agosto: "ago",
  septiembre: "sep",
  octubre: "oct",
  noviembre: "nov",
  diciembre: "dic",
};

/**
 * Meses del primer semestre (I)
 */
export const FIRST_SEMESTER_MONTHS: MonthKeyUI[] = ["ene", "feb", "mar", "abr", "may", "jun"];

/**
 * Meses del segundo semestre (II)
 */
export const SECOND_SEMESTER_MONTHS: MonthKeyUI[] = ["jul", "ago", "sep", "oct", "nov", "dic"];

/**
 * Números de preguntas que habilitan indicadores dinámicos
 */
export const INDICATOR_QUESTION_NUMBERS = [7, 10, 11, 17, 42] as const;

/**
 * Mapeo de preguntas de indicadores a campos del estado del formulario
 */
export const INDICATOR_FIELD_MAPPING: Record<
  (typeof INDICATOR_QUESTION_NUMBERS)[number],
  "unidadAlmacenamiento" | "aforoResiduos" | "generaOrganicos" | "generaAprovechables" | "programaComunicacion"
> = {
  7: "unidadAlmacenamiento",
  10: "aforoResiduos",
  11: "generaOrganicos",
  17: "generaAprovechables",
  42: "programaComunicacion",
};

/**
 * Mapeo de número de pregunta a campo de archivo en el payload de upload
 */
export const FILE_UPLOAD_MAPPING: Array<{ num: number; field: string }> = [
  { num: 1, field: "manual_sgirs" },
  { num: 2, field: "esquema_organizacional_sgirs" },
  { num: 3, field: "caracterizacion_residuos_solidos" },
  { num: 10, field: "certificados_aforo_residuos_ordinarios" },
  { num: 12, field: "certificados_recoleccion_rso" },
  { num: 16, field: "registro_fotografico_aprovechamiento_rso" },
  { num: 19, field: "certificados_aprovechamiento_residuos" },
  { num: 24, field: "contrato_ccu_gestor_aprovechamiento" },
  { num: 26, field: "certificados_recoleccion_acu" },
  { num: 31, field: "certificados_recoleccion_raee" },
  { num: 34, field: "certificados_recoleccion_rcd" },
  { num: 38, field: "certificados_recoleccion_respel" },
  { num: 43, field: "evidencias_actividades_iec" },
  { num: 44, field: "tablas_acciones_mejora" },
];

/**
 * Mapeo de números de pregunta estáticas (Steps 9-12) para prefill
 */
export const STATIC_PREFILL_QUESTIONS = {
  ACU: [25, 26, 27, 28],
  RAEE: [29, 30, 31, 32],
  RCD: [33, 34, 35],
  RESPEL: [36, 37, 38, 39],
  VOLUMINOSOS: [40, 41, 42, 43],
} as const;

/**
 * Títulos de los steps del formulario
 */
export const STEP_TITLES: Record<StepNumber, string> = {
  1: "Documentación del SGIRS",
  2: "Organización y Roles",
  3: "Caracterización de Residuos",
  4: "Separación y Almacenamiento",
  5: "Recolección de Residuos No Aprovechables",
  6: "Residuos Orgánicos",
  7: "Residuos Aprovechables",
  8: "Gestores de Residuos Aprovechables",
  9: "Aceite de Cocina Usado (ACU)",
  10: "Residuos de Aparatos Eléctricos y Electrónicos (RAEE)",
  11: "Residuos de Construcción y Demolición (RCD)",
  12: "Residuos Peligrosos y Mejora Continua",
  13: "Indicadores del SGIRS",
};
