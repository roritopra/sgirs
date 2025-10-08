'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, Tab } from '@heroui/react';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import SummaryReport from '@/components/ciudadano/SummaryReport';
import { getPeriodosEstablecimiento, type PeriodosEstablecimientoResponse, type PeriodoItem } from '@/services/funcionario/buscador/getPeriodosEstablecimiento.service';
import { getRespuestasUsuario, type RespuestasUsuarioResponse } from '@/services/funcionario/buscador/getRespuestasUsuario.service';

export default function BusinessDetails() {
	const params = useParams();
	const router = useRouter();
	const nit = params.nit as string;
	
	const [periodosData, setPeriodosData] = useState<PeriodosEstablecimientoResponse | null>(null);
	const [respuestasData, setRespuestasData] = useState<RespuestasUsuarioResponse | null>(null);
	const [selectedPeriodo, setSelectedPeriodo] = useState<PeriodoItem | null>(null);
	const [selectedTabKey, setSelectedTabKey] = useState<string>('');
	const [isLoadingPeriodos, setIsLoadingPeriodos] = useState(true);
	const [isLoadingRespuestas, setIsLoadingRespuestas] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (nit) {
			loadPeriodos();
		}
	}, [nit]);

	useEffect(() => {
		if (selectedPeriodo && nit) {
			loadRespuestas();
		}
	}, [selectedPeriodo, nit]);

	const loadPeriodos = async () => {
		try {
			setIsLoadingPeriodos(true);
			setError(null);
			const data = await getPeriodosEstablecimiento(nit);
			setPeriodosData(data);
			// Seleccionar automáticamente el primer periodo si existe
			if (data.periodos.length > 0) {
				setSelectedPeriodo(data.periodos[0]);
				setSelectedTabKey(data.periodos[0].id_periodo_encuesta);
			}
		} catch (err) {
			setError('Error al cargar los periodos del establecimiento');
			console.error('Error loading periodos:', err);
		} finally {
			setIsLoadingPeriodos(false);
		}
	};

	const loadRespuestas = async () => {
		if (!selectedPeriodo) return;
		
		try {
			setIsLoadingRespuestas(true);
			setError(null);
			const data = await getRespuestasUsuario(nit, selectedPeriodo.id_periodo_encuesta);
			setRespuestasData(data);
		} catch (err) {
			setError('Error al cargar las respuestas del establecimiento');
			console.error('Error loading respuestas:', err);
		} finally {
			setIsLoadingRespuestas(false);
		}
	};

	const handleTabChange = (key: React.Key) => {
		const keyStr = key.toString();
		
		// Evitar deseleccionar si se hace clic en el mismo tab
		if (keyStr === selectedTabKey) {
			return;
		}
		
		const periodo = periodosData?.periodos.find(p => p.id_periodo_encuesta === keyStr);
		if (periodo) {
			setSelectedPeriodo(periodo);
			setSelectedTabKey(keyStr);
			setRespuestasData(null);
		}
	};

	const handleGoBack = () => {
		router.push('/funcionario/buscador');
	};

	if (isLoadingPeriodos) {
		return (
			<div className='w-full min-h-screen p-6 bg-white flex items-center justify-center'>
				<div className='flex items-center gap-3'>
					<Loader2 className='w-6 h-6 animate-spin text-[#5F8244]' />
					<p className='text-gray-600'>Cargando información del establecimiento...</p>
				</div>
			</div>
		);
	}

	if (error && !periodosData) {
		return (
			<div className='w-full min-h-screen p-6 bg-white flex items-center justify-center'>
				<div className='text-center'>
					<AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
					<h3 className='text-lg font-medium text-gray-900 mb-2'>Error al cargar los datos</h3>
					<p className='text-gray-500 mb-4'>{error}</p>
					<button
						onClick={handleGoBack}
						className='px-4 py-2 bg-[#5F8244] text-white rounded-md hover:bg-[#395312] transition-colors'
					>
						Volver al buscador
					</button>
				</div>
			</div>
		);
	}

	// Mostrar mensaje cuando no hay periodos disponibles
	if (periodosData && (!periodosData.periodos || periodosData.periodos.length === 0)) {
		return (
			<div className='w-full min-h-screen p-6 bg-white'>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-6'>
					<div>
						<div className='flex items-center gap-3 mb-2'>
							<button
								onClick={handleGoBack}
								className='p-2 hover:bg-gray-100 rounded-md transition-colors'
								aria-label='Volver al buscador'
							>
								<ArrowLeft className='w-5 h-5 text-gray-600' />
							</button>
							<CardTitle className='text-xl font-semibold text-foreground'>Detalles del Establecimiento</CardTitle>
						</div>
						<p className='text-sm text-muted-foreground mt-1'>
							{periodosData.ciudadano_sector_estrategico.establecimiento}
						</p>
					</div>
				</CardHeader>

				<CardContent className='space-y-6'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div className='space-y-4'>
							<div>
								<h3 className='text-sm font-medium text-muted-foreground mb-1'>NIT</h3>
								<p className='text-sm text-foreground'>
									{periodosData.ciudadano_sector_estrategico.nit}
								</p>
							</div>
						</div>
						<div className='space-y-4'>
							<div>
								<h3 className='text-sm font-medium text-muted-foreground mb-1'>Correo Electrónico</h3>
								<p className='text-sm text-foreground'>
									{periodosData.ciudadano_sector_estrategico.email}
								</p>
							</div>
						</div>
					</div>

					<div className='flex items-center justify-center py-16'>
						<div className='text-center'>
							<AlertCircle className='w-16 h-16 text-gray-400 mx-auto mb-4' />
							<h3 className='text-xl font-medium text-gray-900 mb-2'>No hay datos disponibles</h3>
							<p className='text-gray-500 mb-6'>
								Este establecimiento no tiene períodos de reporte registrados en el sistema.
							</p>
							<button
								onClick={handleGoBack}
								className='px-4 py-2 bg-[#5F8244] text-white rounded-md hover:bg-[#395312] transition-colors'
							>
								Volver al buscador
							</button>
						</div>
					</div>
				</CardContent>
			</div>
		);
	}

	return (
		<div className='w-full min-h-screen p-6 bg-white'>
			<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-6'>
				<div>
					<div className='flex items-center gap-3 mb-2'>
						<button
							onClick={handleGoBack}
							className='p-2 hover:bg-gray-100 rounded-md transition-colors'
							aria-label='Volver al buscador'
						>
							<ArrowLeft className='w-5 h-5 text-gray-600' />
						</button>
						<CardTitle className='text-xl font-semibold text-foreground'>Detalles del Establecimiento</CardTitle>
					</div>
					<p className='text-sm text-muted-foreground mt-1'>
						{periodosData?.ciudadano_sector_estrategico.establecimiento || 'Cargando...'}
					</p>
				</div>
			</CardHeader>

			<CardContent className='space-y-6'>
				{error && (
					<div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3'>
						<AlertCircle className='w-5 h-5 text-red-500 flex-shrink-0' />
						<p className='text-red-700'>{error}</p>
					</div>
				)}

				<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
					<div className='space-y-4'>
						<div>
							<h3 className='text-sm font-medium text-muted-foreground mb-1'>NIT</h3>
							<p className='text-sm text-foreground'>
								{respuestasData?.ciudadano_sector_estrategico.nit || periodosData?.ciudadano_sector_estrategico.nit || nit}
							</p>
						</div>
						<div>
							<h3 className='text-sm font-medium text-muted-foreground mb-1'>Dirección</h3>
							<p className='text-sm text-foreground'>
								{respuestasData?.ciudadano_sector_estrategico.direccion || 'No disponible'}
							</p>
						</div>
					</div>
					<div className='space-y-4'>
						<div>
							<h3 className='text-sm font-medium text-muted-foreground mb-1'>Correo Electrónico</h3>
							<p className='text-sm text-foreground'>
								{respuestasData?.ciudadano_sector_estrategico.email || periodosData?.ciudadano_sector_estrategico.email || 'No disponible'}
							</p>
						</div>
						<div>
							<h3 className='text-sm font-medium text-muted-foreground mb-1'>Teléfono</h3>
							<p className='text-sm text-foreground'>
								{respuestasData?.ciudadano_sector_estrategico.num_cel || 'No disponible'}
							</p>
						</div>
					</div>
				</div>

				<div className='space-y-3'>
					<h3 className='text-lg font-medium text-foreground'>Períodos de reporte</h3>
					{periodosData?.periodos && periodosData.periodos.length > 0 ? (
						<Tabs
							selectedKey={selectedTabKey}
							onSelectionChange={handleTabChange}
							color='primary'
							variant='underlined'
							className='w-full'
						>
							{periodosData.periodos.map((periodo) => (
								<Tab
									key={periodo.id_periodo_encuesta}
									title={`Período ${periodo.periodo}`}
								/>
							))}
						</Tabs>
					) : (
						<p className='text-sm text-gray-500'>No hay períodos disponibles</p>
					)}
				</div>

				<div className='space-y-3'>
					{isLoadingRespuestas && (
						<div className='flex items-center justify-center py-8'>
							<div className='flex items-center gap-3'>
								<Loader2 className='w-5 h-5 animate-spin text-[#5F8244]' />
								<p className='text-gray-600'>Cargando respuestas del período...</p>
							</div>
						</div>
					)}

					{respuestasData && !isLoadingRespuestas && (
						<div>
							<h3 className='text-lg font-medium text-foreground mb-4'>
								Respuestas del período {selectedPeriodo?.periodo}
							</h3>
							<SummaryReport periodData={{
								respuestas_usuario: respuestasData.formulario.respuestas_usuario
							}} />
						</div>
					)}

					{!selectedPeriodo && !isLoadingRespuestas && periodosData && (
						<div className='text-center py-8'>
							<p className='text-gray-500'>Selecciona un período para ver las respuestas</p>
						</div>
					)}
				</div>
			</CardContent>
		</div>
	);
}
