import { get } from "@/utils/shared/apiUtils";

export type DaysFilter = "7d" | "30d" | "90d";

export interface CardStatsParams {
  days_filter?: DaysFilter;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
}

export interface CardStatsResponse {
  est_total_preguntas: number;
  est_preguntas_relevantes: number;
  est_sentimiento_promedio: number;
}

function buildQuery(params: CardStatsParams): string {
  const qs = new URLSearchParams();
  if (params.from && params.to) {
    qs.set("from", params.from);
    qs.set("to", params.to);
  } else if (params.days_filter) {
    qs.set("days_filter", params.days_filter);
  } else {
    qs.set("days_filter", "7d");
  }
  return qs.toString();
}

export async function getCardStats(params: CardStatsParams): Promise<CardStatsResponse> {
  const url = `/api/v1/chatbot-dashboard/cards?${buildQuery(params)}`;
  return get<CardStatsResponse>(url);
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export async function getConversationsByDay(params: CardStatsParams): Promise<TimeSeriesPoint[]> {
  const url = `/api/v1/chatbot-dashboard/conversaciones-por-dia?${buildQuery(params)}`;
  return get<TimeSeriesPoint[]>(url);
}

export async function getMessagesByDay(params: CardStatsParams): Promise<TimeSeriesPoint[]> {
  const url = `/api/v1/chatbot-dashboard/mensajes-por-dia?${buildQuery(params)}`;
  return get<TimeSeriesPoint[]>(url);
}

export interface SentimentItem {
  label: "Positivo" | "Neutral" | "Negativo";
  porcentaje: number;
  cantidad: number;
}

export interface SentimentResponse {
  sentimientos: SentimentItem[];
  indicador_sentimiento: number;
}

export async function getSentiment(params: CardStatsParams): Promise<SentimentResponse> {
  const url = `/api/v1/chatbot-dashboard/sentimiento?${buildQuery(params)}`;
  return get<SentimentResponse>(url);
}

export interface TopQuestionItem {
  question: string;
  count: number;
}

export async function getTopPreguntasFrecuentes(params: CardStatsParams): Promise<TopQuestionItem[]> {
  const url = `/api/v1/chatbot-dashboard/top-preguntas-frecuentes?${buildQuery(params)}`;
  return get<TopQuestionItem[]>(url);
}

export async function getTopPreguntasNoRespondidas(params: CardStatsParams): Promise<TopQuestionItem[]> {
  const url = `/api/v1/chatbot-dashboard/top-preguntas-no-respondidas?${buildQuery(params)}`;
  return get<TopQuestionItem[]>(url);
}

export interface UnansweredDetailItem {
  number: string;
  date: string;
  question: string;
  certainty: number;
}

export async function getDetallePreguntasNoRespondidas(
  params: CardStatsParams
): Promise<UnansweredDetailItem[]> {
  const url = `/api/v1/chatbot-dashboard/detalle-preguntas-no-respondidas?${buildQuery(params)}`;
  return get<UnansweredDetailItem[]>(url);
}

export interface DistribucionResiduoItem {
  name: string;
  value: number;
}

export async function getDistribucionResiduos(
  params: CardStatsParams
): Promise<DistribucionResiduoItem[]> {
  const url = `/api/v1/chatbot-dashboard/distribucion-residuos?${buildQuery(params)}`;
  return get<DistribucionResiduoItem[]>(url);
}
