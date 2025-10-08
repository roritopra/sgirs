'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/funcionario/residuos-aprovechables/Card';
import { QuestionMarkCircleIcon, StarIcon, FaceSmileIcon } from '@heroicons/react/24/outline';
import NumberConversations from '@/components/admin/NumberConversations';
import BarChartCard from '@/components/admin/DistribucionResiduos';
import SentimentAnalysis from '@/components/admin/AnalisisSentimiento';
import TopQuestions from '@/components/admin/PreguntasFrecuentes';
import TopUnansweredQuestions from '@/components/admin/TopUnasweredQuestions';
import { Tabs, Tab, DateRangePicker, Spinner } from '@heroui/react';
import { getCardStats, type DaysFilter, getConversationsByDay, getMessagesByDay, type TimeSeriesPoint, getSentiment, type SentimentResponse, getTopPreguntasFrecuentes, getTopPreguntasNoRespondidas, type TopQuestionItem, getDetallePreguntasNoRespondidas, type UnansweredDetailItem, getDistribucionResiduos, type DistribucionResiduoItem } from '@/services/admin/chatbotDashboard.service';

type Encuesta = {
	nombre: string;
	estado: 'Activa' | 'Inactiva';
	fechaInicio: string;
	fechaFin: string;
};

// Data mock para encuesta actual
const MOCK_ENCUESTA_ACTUAL: Encuesta = {
	nombre: 'Segundo Trimestre 2024',
	estado: 'Activa',
	fechaInicio: '2024/04/01',
	fechaFin: '2024/06/30',
};

// Datos iniciales vacíos para cards
const EMPTY_CARDS_DATA = {
	est_total_preguntas: 0,
	est_preguntas_relevantes: 0,
	est_sentimiento_promedio: 0,
};

// Cambia a true para usar el endpoint real cuando esté listo
const useRealEndpoint = false;

// Pon aquí la URL de tu endpoint real para obtener la encuesta actual
const REAL_ENDPOINT_URL = 'https://tu-api.com/encuesta-actual';

export default function Dashboard() {
	const [encuestaActual, setEncuestaActual] = useState<Encuesta | null>(null);
	const [nuevoPeriodo, setNuevoPeriodo] = useState('');
	const [mensajeInactivo, setMensajeInactivo] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [cardsData, setCardsData] = useState<typeof EMPTY_CARDS_DATA | null>(null);
	const [cardsLoading, setCardsLoading] = useState(false);
	const [cardsError, setCardsError] = useState<string | null>(null);
	const [daysFilter, setDaysFilter] = useState<DaysFilter>('7d');
	const [from, setFrom] = useState<string | null>(null);
	const [to, setTo] = useState<string | null>(null);
	const [convData, setConvData] = useState<TimeSeriesPoint[] | null>(null);
	const [convLoading, setConvLoading] = useState(false);
	const [convError, setConvError] = useState<string | null>(null);
	const [msgData, setMsgData] = useState<TimeSeriesPoint[] | null>(null);
	const [msgLoading, setMsgLoading] = useState(false);
	const [msgError, setMsgError] = useState<string | null>(null);
	const [sentiment, setSentiment] = useState<SentimentResponse | null>(null);
	const [sentLoading, setSentLoading] = useState(false);
	const [sentError, setSentError] = useState<string | null>(null);
	const [topFreq, setTopFreq] = useState<TopQuestionItem[] | null>(null);
	const [topFreqLoading, setTopFreqLoading] = useState(false);
	const [topFreqError, setTopFreqError] = useState<string | null>(null);
	const [topNR, setTopNR] = useState<TopQuestionItem[] | null>(null);
	const [topNRLoading, setTopNRLoading] = useState(false);
	const [topNRError, setTopNRError] = useState<string | null>(null);
	const [unanswered, setUnanswered] = useState<UnansweredDetailItem[] | null>(null);
	const [unansweredLoading, setUnansweredLoading] = useState(false);
	const [unansweredError, setUnansweredError] = useState<string | null>(null);
	const [residuos, setResiduos] = useState<DistribucionResiduoItem[] | null>(null);
	const [resLoading, setResLoading] = useState(false);
	const [resError, setResError] = useState<string | null>(null);

	const formatDate = (d: any): string => {
		if (!d) return '';
		const y = String(d.year).padStart(4, '0');
		const m = String(d.month).padStart(2, '0');
		const day = String(d.day).padStart(2, '0');
		return `${y}-${m}-${day}`;
	};

	// Fetch de cards según filtros
	useEffect(() => {
		let active = true;
		async function fetchCards() {
			setCardsLoading(true);
			setCardsError(null);
			try {
				const params = from && to ? { from, to } : { days_filter: daysFilter };
				const data = await getCardStats(params);
				if (!active) return;
				setCardsData(data);
			} catch (e: any) {
				if (!active) return;
				setCardsError(e?.message || 'Error al cargar métricas');
				setCardsData(null);
			} finally {
				if (!active) return;
				setCardsLoading(false);
			}
		}
		fetchCards();
		return () => {
			active = false;
		};
	}, [daysFilter, from, to]);

	// Fetch: distribución de residuos
	useEffect(() => {
		let active = true;
		async function fetchDistrib() {
			setResLoading(true);
			setResError(null);
			try {
				const params = from && to ? { from, to } : { days_filter: daysFilter };
				const data = await getDistribucionResiduos(params);
				if (!active) return;
				setResiduos(data);
			} catch (e: any) {
				if (!active) return;
				setResError(e?.message || 'Error al cargar distribución de residuos');
				setResiduos(null);
			} finally {
				if (!active) return;
				setResLoading(false);
			}
		}
		fetchDistrib();
		return () => {
			active = false;
		};
	}, [daysFilter, from, to]);

	// Fetch: top preguntas frecuentes
	useEffect(() => {
		let active = true;
		async function fetchTopFreq() {
			setTopFreqLoading(true);
			setTopFreqError(null);
			try {
				const params = from && to ? { from, to } : { days_filter: daysFilter };
				const data = await getTopPreguntasFrecuentes(params);
				if (!active) return;
				setTopFreq(data);
			} catch (e: any) {
				if (!active) return;
				setTopFreqError(e?.message || 'Error al cargar preguntas frecuentes');
				setTopFreq(null);
			} finally {
				if (!active) return;
				setTopFreqLoading(false);
			}
		}
		fetchTopFreq();
		return () => {
			active = false;
		};
	}, [daysFilter, from, to]);

	// Fetch: top preguntas no respondidas
	useEffect(() => {
		let active = true;
		async function fetchTopNR() {
			setTopNRLoading(true);
			setTopNRError(null);
			try {
				const params = from && to ? { from, to } : { days_filter: daysFilter };
				const data = await getTopPreguntasNoRespondidas(params);
				if (!active) return;
				setTopNR(data);
			} catch (e: any) {
				if (!active) return;
				setTopNRError(e?.message || 'Error al cargar preguntas sin responder');
				setTopNR(null);
			} finally {
				if (!active) return;
				setTopNRLoading(false);
			}
		}
		fetchTopNR();
		return () => {
			active = false;
		};
	}, [daysFilter, from, to]);

	// Fetch: conversaciones por día
	useEffect(() => {
		let active = true;
		async function fetchConv() {
			setConvLoading(true);
			setConvError(null);
			try {
				const params = from && to ? { from, to } : { days_filter: daysFilter };
				const data = await getConversationsByDay(params);
				if (!active) return;
				setConvData(data);
			} catch (e: any) {
				if (!active) return;
				setConvError(e?.message || 'Error al cargar conversaciones');
				setConvData(null);
			} finally {
				if (!active) return;
				setConvLoading(false);
			}
		}
		fetchConv();
		return () => {
			active = false;
		};
	}, [daysFilter, from, to]);

	// Fetch: mensajes por día
	useEffect(() => {
		let active = true;
		async function fetchMsg() {
			setMsgLoading(true);
			setMsgError(null);
			try {
				const params = from && to ? { from, to } : { days_filter: daysFilter };
				const data = await getMessagesByDay(params);
				if (!active) return;
				setMsgData(data);
			} catch (e: any) {
				if (!active) return;
				setMsgError(e?.message || 'Error al cargar mensajes');
				setMsgData(null);
			} finally {
				if (!active) return;
				setMsgLoading(false);
			}
		}
		fetchMsg();
		return () => {
			active = false;
		};
	}, [daysFilter, from, to]);

	// Fetch: sentimiento
	useEffect(() => {
		let active = true;
		async function fetchSentiment() {
			setSentLoading(true);
			setSentError(null);
			try {
				const params = from && to ? { from, to } : { days_filter: daysFilter };
				const data = await getSentiment(params);
				if (!active) return;
				setSentiment(data);
			} catch (e: any) {
				if (!active) return;
				setSentError(e?.message || 'Error al cargar sentimiento');
				setSentiment(null);
			} finally {
				if (!active) return;
				setSentLoading(false);
			}
		}
		fetchSentiment();
		return () => {
			active = false;
		};
	}, [daysFilter, from, to]);

	// Fetch: detalle preguntas no respondidas (tabla)
	useEffect(() => {
		let active = true;
		async function fetchUnanswered() {
			setUnansweredLoading(true);
			setUnansweredError(null);
			try {
				const params = from && to ? { from, to } : { days_filter: daysFilter };
				const data = await getDetallePreguntasNoRespondidas(params);
				if (!active) return;
				setUnanswered(data);
			} catch (e: any) {
				if (!active) return;
				setUnansweredError(e?.message || 'Error al cargar preguntas sin responder');
				setUnanswered(null);
			} finally {
				if (!active) return;
				setUnansweredLoading(false);
			}
		}
		fetchUnanswered();
		return () => {
			active = false;
		};
	}, [daysFilter, from, to]);

	useEffect(() => {
		// Por ahora, solo mock para encuesta actual
		setEncuestaActual(MOCK_ENCUESTA_ACTUAL);
	}, []);

	const handleTerminarPeriodo = () => {
		if (encuestaActual) {
			setEncuestaActual({ ...encuestaActual, estado: 'Inactiva' });
		}
	};

	const handleHabilitarEncuesta = () => {
		if (!nuevoPeriodo) return;

		const [fechaInicio, fechaFin] = nuevoPeriodo.split(' - ');

		setNuevoPeriodo('');
		setMensajeInactivo('');
	};

	const handleReactivarEncuesta = () => {
		if (encuestaActual) {
			setEncuestaActual({ ...encuestaActual, estado: 'Activa' });
		}
	};

	return (
		<div className='p-6'>
			<h2 className='font-semibold text-lg mb-6'>Análisis del Chatbot</h2>
			{/* Filtros: Tabs (7d/30d/90d) y DateRangePicker */}
			<div className='mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4'>
				<Tabs
					aria-label='Filtro rápido de días'
					selectedKey={daysFilter}
					onSelectionChange={(key) => {
						setDaysFilter(String(key) as DaysFilter);
						// Al cambiar a un filtro rápido, limpiar rango personalizado
						setFrom(null);
						setTo(null);
					}}
					variant='underlined'
				>
					<Tab key='7d' title='Últimos 7 días' />
					<Tab key='30d' title='Últimos 30 días' />
					<Tab key='90d' title='Últimos 90 días' />
				</Tabs>
				<DateRangePicker
					aria-label='Rango de fechas personalizado'
					label='Rango personalizado'
					variant='bordered'
					visibleMonths={2}
					onChange={(range: any) => {
						const f = formatDate(range?.start);
						const t = formatDate(range?.end);
						if (f && t) {
							setFrom(f);
							setTo(t);
						} else {
							setFrom(null);
							setTo(null);
						}
					}}
				/>
			</div>
			<div className='flex-1 flex flex-col justify-between gap-4'>
				{cardsLoading && (
					<div role='status' aria-live='polite' className='px-2 py-4 text-sm text-gray-600 flex items-center gap-2'>
						<Spinner size='sm' /> Cargando métricas...
					</div>
				)}
				{cardsError && !cardsLoading && (
					<div role='alert' className='px-2 py-4 text-sm text-red-600'>
						Error al cargar métricas: {cardsError}
					</div>
				)}
				{cardsData && !cardsLoading && !cardsError && (
					<div className='flex gap-4'>
						<Card
							title='Total de preguntas'
							value={cardsData.est_total_preguntas}
							icon={QuestionMarkCircleIcon}
							iconColor='#7FB927'
							bgColor='#E4FFBA'
						/>
						<Card
							title='Preguntas relevantes'
							value={cardsData.est_preguntas_relevantes}
							icon={StarIcon}
							iconColor='#8280FF'
							bgColor='#E4E4FF'
							className='w-1/2'
						/>
						<Card
							title='Sentimiento promedio'
							value={cardsData.est_sentimiento_promedio}
							icon={FaceSmileIcon}
							iconColor='#80B3FF'
							bgColor='#E4EEFF'
							className='w-1/2'
						/>
					</div>
				)}
			</div>

			<div className='flex space-x-6 mt-6'>
				<div className='flex-1'>
					{convLoading && (
						<div role='status' aria-live='polite' className='px-2 py-4 text-sm text-gray-600 flex items-center gap-2 bg-white rounded-xl shadow-sm'>
							<Spinner size='sm' /> Cargando conversaciones...
						</div>
					)}
					{convError && !convLoading && (
						<div role='alert' className='px-2 py-4 text-sm text-red-600 bg-white rounded-xl shadow-sm'>
							Error al cargar conversaciones: {convError}
						</div>
					)}
					{!convLoading && !convError && convData && convData.length === 0 && (
						<div role='status' className='px-2 py-4 text-sm text-gray-600 bg-white rounded-xl shadow-sm'>
							No hay datos para mostrar
						</div>
					)}
					{!convLoading && !convError && convData && convData.length > 0 && (
						<NumberConversations
							title='Número de conversaciones por día'
							data={convData}
							yLabel='n de conversaciones'
						/>
					)}
				</div>

				<div className='flex-1'>
					{msgLoading && (
						<div role='status' aria-live='polite' className='px-2 py-4 text-sm text-gray-600 flex items-center gap-2 bg-white rounded-xl shadow-sm'>
							<Spinner size='sm' /> Cargando mensajes...
						</div>
					)}
					{msgError && !msgLoading && (
						<div role='alert' className='px-2 py-4 text-sm text-red-600 bg-white rounded-xl shadow-sm'>
							Error al cargar mensajes: {msgError}
						</div>
					)}
					{!msgLoading && !msgError && msgData && msgData.length === 0 && (
						<div role='status' className='px-2 py-4 text-sm text-gray-600 bg-white rounded-xl shadow-sm'>
							No hay datos para mostrar
						</div>
					)}
					{!msgLoading && !msgError && msgData && msgData.length > 0 && (
						<NumberConversations title='Número de mensajes por día' data={msgData} yLabel='n de mensajes' />
					)}
				</div>
			</div>

			<div className='mt-6'>
				{sentLoading && (
					<div role='status' aria-live='polite' className='px-2 py-4 text-sm text-gray-600 flex items-center gap-2 bg-white rounded-xl shadow-sm'>
						<Spinner size='sm' /> Cargando sentimiento...
					</div>
				)}
				{sentError && !sentLoading && (
					<div role='alert' className='px-2 py-4 text-sm text-red-600 bg-white rounded-xl shadow-sm'>
						Error al cargar sentimiento: {sentError}
					</div>
				)}
				{!sentLoading && !sentError && sentiment && sentiment.sentimientos.length === 0 && (
					<div role='status' className='px-2 py-4 text-sm text-gray-600 bg-white rounded-xl shadow-sm'>
						No hay datos para mostrar
					</div>
				)}
				{!sentLoading && !sentError && sentiment && sentiment.sentimientos.length > 0 && (
					<SentimentAnalysis items={sentiment.sentimientos} indicador={sentiment.indicador_sentimiento} />
				)}
			</div>

			<div className='mt-6 gap-6'>
				<div className='w-full'>
					{topFreqLoading && (
						<div role='status' aria-live='polite' className='px-2 py-4 text-sm text-gray-600 flex items-center gap-2 bg-white rounded-xl shadow-sm'>
							<Spinner size='sm' /> Cargando preguntas frecuentes...
						</div>
					)}
					{topFreqError && !topFreqLoading && (
						<div role='alert' className='px-2 py-4 text-sm text-red-600 bg-white rounded-xl shadow-sm'>
							Error al cargar preguntas frecuentes: {topFreqError}
						</div>
					)}
					{!topFreqLoading && !topFreqError && topFreq && topFreq.length === 0 && (
						<div role='status' className='px-2 py-4 text-sm text-gray-600 bg-white rounded-xl shadow-sm'>
							No hay preguntas
						</div>
					)}
					{!topFreqLoading && !topFreqError && topFreq && topFreq.length > 0 && (
						<TopQuestions
							title='Top 5 preguntas más frecuentes'
							subtitle='Preguntas más realizadas en el período seleccionado'
							data={topFreq}
						/>
					)}
				</div>
			</div>

			<div className='mt-6'>
				{unansweredLoading && (
					<div role='status' aria-live='polite' className='px-2 py-4 text-sm text-gray-600 flex items-center gap-2 bg-white rounded-xl shadow-sm'>
						<Spinner size='sm' /> Cargando detalle de preguntas sin responder...
					</div>
				)}
				{unansweredError && !unansweredLoading && (
					<div role='alert' className='px-2 py-4 text-sm text-red-600 bg-white rounded-xl shadow-sm'>
						Error al cargar preguntas sin responder: {unansweredError}
					</div>
				)}
				{!unansweredLoading && !unansweredError && unanswered && unanswered.length === 0 && (
					<div role='status' className='px-2 py-4 text-sm text-gray-600 bg-white rounded-xl shadow-sm'>
						No hay información de preguntas sin responder
					</div>
				)}
				{!unansweredLoading && !unansweredError && unanswered && unanswered.length > 0 && (
					<TopUnansweredQuestions
						title='Preguntas sin responder'
						subtitle='Preguntas realizadas en el periodo seleccionado y no han tenido respuesta'
						data={unanswered}
					/>
				)}
			</div>

			<div className='mt-6'>
				{resLoading && (
					<div role='status' aria-live='polite' className='px-2 py-4 text-sm text-gray-600 flex items-center gap-2 bg-white rounded-xl shadow-sm'>
						<Spinner size='sm' /> Cargando distribución de residuos...
					</div>
				)}
				{resError && !resLoading && (
					<div role='alert' className='px-2 py-4 text-sm text-red-600 bg-white rounded-xl shadow-sm'>
						Error al cargar distribución de residuos: {resError}
					</div>
				)}
				{!resLoading && !resError && residuos && residuos.length === 0 && (
					<div role='status' className='px-2 py-4 text-sm text-gray-600 bg-white rounded-xl shadow-sm'>
						No hay residuos
					</div>
				)}
				{!resLoading && !resError && residuos && residuos.length > 0 && (
					<BarChartCard
						title='Distribución por Tipo de Residuo'
						subtitle='Frecuencia relativa de preguntas por categoría'
						data={residuos.map((r, i) => ({ ...r, fill: ['#B0D0D3','#F4A7A7','#FBE7C6','#FFF6B7','#C9C9FF','#F8D7FF','#E8FBA7'][i % 7] }))}
						yLabel='Cantidad'
					/>
				)}
			</div>
		</div>
	);
}
