'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Comuna } from './MapTableCard';

interface ChoroplethMapCaliProps {
	data: Comuna[];
}

const ChoroplethMapCali: React.FC<ChoroplethMapCaliProps> = ({ data }) => {
	const mapRef = useRef<HTMLDivElement | null>(null);
	const mapInstance = useRef<L.Map | null>(null);
	const geoDataRef = useRef<any | null>(null);
	const layerRef = useRef<L.GeoJSON<any> | null>(null);
	const dataRef = useRef<Comuna[]>(data);

	// Mantener la última data en un ref para callbacks
	useEffect(() => {
		dataRef.current = data;
	}, [data]);

	// Inicializar el mapa solo una vez
	useEffect(() => {
		if (!mapRef.current || mapInstance.current) return;
		const map = L.map(mapRef.current, {
			zoomControl: true,
			attributionControl: false,
		}).setView([3.451, -76.532], 12);
		mapInstance.current = map;

		return () => {
			// Limpieza al desmontar
			if (mapInstance.current) {
				mapInstance.current.remove();
				mapInstance.current = null;
				layerRef.current = null;
				geoDataRef.current = null;
			}
		};
	}, []);

	// Cargar el GeoJSON una sola vez
	useEffect(() => {
		if (!mapInstance.current || geoDataRef.current) return;
		let cancelled = false;
		fetch('/data/comunas_cali.geojson')
			.then((response) => response.json())
			.then((geoData) => {
				if (cancelled) return;
				geoDataRef.current = geoData;
				// Crear capa inicial
				if (mapInstance.current) {
					const layer = buildLayer(geoDataRef.current, dataRef.current);
					layer.addTo(mapInstance.current);
					layerRef.current = layer;
				}
			})
			.catch(() => {/* noop */});

		return () => {
			cancelled = true;
		};
	}, []);

	// Actualizar capa cuando cambie la data
	useEffect(() => {
		if (!mapInstance.current || !geoDataRef.current) return;
		// Reemplazar capa para recalcular estilos y tooltips
		if (layerRef.current) {
			try {
				layerRef.current.remove();
			} catch {}
			layerRef.current = null;
		}
		const layer = buildLayer(geoDataRef.current, dataRef.current);
		layer.addTo(mapInstance.current);
		layerRef.current = layer;
	}, [data]);

	const getColor = (density: number) => {
		return density > 800
			? '#395312'
			: density > 600
			? '#5F8244'
			: density > 400
			? '#5F8B1D'
			: density > 200
			? '#81b237ff'
			: density > 100
			? '#cce3a8ff'
			: density > 50
			? '#e5ffbbff'
			: density > 0
			? '#f9ffefff'
			: '#ffffff';
	};

	const buildLayer = (geoData: any, items: Comuna[]) => {
		const style = (feature: any) => {
			const comunaId = Number(feature?.properties?.comuna);
			const match = items.find((c) => Number(c.comuna) === comunaId);
			return {
				fillColor: match ? getColor(Number(match.cantidad || 0)) : '#ffffff',
				weight: 2,
				opacity: 1,
				color: '#395312',
				fillOpacity: 0.9,
			} as L.PathOptions;
		};

		const onEachFeature = (feature: any, layer: L.Layer) => {
			const comunaId = Number(feature?.properties?.comuna);
			const match = items.find((c) => Number(c.comuna) === comunaId);
			if (match && (layer as any).bindTooltip) {
				const pct = typeof match.porcentaje === 'number' ? match.porcentaje.toFixed(1) : '0.0';
				(layer as any).bindTooltip(`${comunaId}: ${match.cantidad} (${pct}%)`, { sticky: true });
			}
		};

		return L.geoJSON(geoData, { style, onEachFeature });
	};

	return (
		<div style={{ position: 'relative' }}>
			<div ref={mapRef} style={{ height: '500px', width: '100%' }} />

			{/* Leyenda */}
			<div
				style={{
					position: 'absolute',
					bottom: '10px',
					right: '10px',
					backgroundColor: 'white',
					padding: '10px',
					borderRadius: '5px',
					boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
					zIndex: 1000,
				}}
			>
				<div>
					<i style={{ background: '#395312', width: 15, height: 15, display: 'inline-block', marginRight: 5 }} />{' '}
					{'> 800'}
				</div>
				<div>
					<i style={{ background: '#5F8244', width: 15, height: 15, display: 'inline-block', marginRight: 5 }} />{' '}
					{'600 - 800'}
				</div>
				<div>
					<i style={{ background: '#5F8B1D', width: 15, height: 15, display: 'inline-block', marginRight: 5 }} />{' '}
					{'400 - 600'}
				</div>
				<div>
					<i style={{ background: '#81b237ff', width: 15, height: 15, display: 'inline-block', marginRight: 5 }} />{' '}
					{'200 - 400'}
				</div>
				<div>
					<i style={{ background: '#bce979ff', width: 15, height: 15, display: 'inline-block', marginRight: 5 }} />{' '}
					{'100 - 200'}
				</div>
				<div>
					<i style={{ background: '#e5ffbbff', width: 15, height: 15, display: 'inline-block', marginRight: 5 }} />{' '}
					{'50 - 100'}
				</div>
				<div>
					<i style={{ background: '#f9ffefff', width: 15, height: 15, display: 'inline-block', marginRight: 5 }} />{' '}
					{'0 - 50'}
				</div>
			</div>
		</div>
	);
};

export default ChoroplethMapCali;
