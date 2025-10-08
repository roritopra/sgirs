'use client';

import { useState, useEffect } from 'react';
import { Autocomplete, AutocompleteItem, Button, Spinner, Chip } from '@heroui/react';
import { get } from '@/utils/shared/apiUtils';
import { patch } from '@/utils/shared/apiUtils';
import { useActivePeriod } from '@/hooks/useActivePeriod';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';
import { fetchActivePeriod } from '@/store/slices/activePeriodSlice';
import AlertConfirm from '@/components/shared/AlertDialog/AlertConfirm';
 

type PeriodoEncuesta = {
	id: string;
	periodo: string;
	fecha_inicio: string | null;
	fecha_fin: string | null;
	activo: boolean;
	status: boolean;
};

// PATCH para activar/desactivar encuesta (API oficial)
async function actualizarEstadoEncuesta(id: string, activo: boolean) {
	const url = `/api/v1/periodos-encuesta/${id}/activo`;
	return patch(url, { activo });
}

//GET para listar periodos (siempre per_page=50)
async function listarPeriodos(): Promise<PeriodoEncuesta[]> {
  const url = `/api/v1/periodos-encuesta?page=1&per_page=50`;
  const data = await get<{ data: PeriodoEncuesta[] }>(url);
  return data.data;
}

export default function EncuestasPage() {
  const dispatch = useDispatch<AppDispatch>();
  const active = useActivePeriod();
  const [periodos, setPeriodos] = useState<PeriodoEncuesta[]>([]);
  const [encuestaActual, setEncuestaActual] = useState<PeriodoEncuesta | null>(null);
  const [nuevoPeriodoId, setNuevoPeriodoId] = useState('');
  const [mensajeInactivo, setMensajeInactivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [terminando, setTerminando] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [enviandoMensaje, setEnviandoMensaje] = useState(false);
  const [version, setVersion] = useState(0);
  const [ultimoMensaje, setUltimoMensaje] = useState<string | null>(null);

  async function loadPeriodos() {
    try {
      setLoading(true);
      const data = await listarPeriodos();
      setPeriodos(data);
      const activo = data.find((p) => p.activo) || null;
      setEncuestaActual(activo);
      if (!activo) {
        const mensajes = await get<any>(`/api/v1/mensajes/`);
        const lista: any[] = Array.isArray(mensajes) ? mensajes : (mensajes?.data ?? []);
        setUltimoMensaje(lista?.[0]?.contenido ?? null);
      } else {
        setUltimoMensaje(null);
      }
    } catch (err: any) {
      setError(err?.message || 'Error al listar periodos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPeriodos();
  }, []);

  // Terminar período activo (usando hook para id actual)
  const handleTerminarPeriodo = async () => {
    if (!active?.id) return;
    try {
      setTerminando(true);
      // Desactivar período actual
      await actualizarEstadoEncuesta(active.id, false);
      // Refrescar estado global del periodo activo
      dispatch(fetchActivePeriod());
      await loadPeriodos();
      setVersion((v) => v + 1);
      setTimeout(() => {
        if (typeof window !== 'undefined') window.location.reload();
      }, 300);
    } catch {
      alert('No se pudo terminar la encuesta');
    } finally {
      setTerminando(false);
    }
  };

  // Enviar mensaje (solo cuando no hay período activo)
  const handleEnviarMensaje = async () => {
    if (!mensajeInactivo.trim()) return;
    try {
      setEnviandoMensaje(true);
      const mensajes = await get<any>(`/api/v1/mensajes/`);
      const lista: any[] = Array.isArray(mensajes) ? mensajes : (mensajes?.data ?? []);
      const ultimo = lista[0];
      if (ultimo?.id) {
        await patch(`/api/v1/mensajes/${ultimo.id}`, { contenido: mensajeInactivo.trim() });
      }
      setMensajeInactivo('');
    } catch {
      alert('No se pudo enviar el mensaje');
    } finally {
      setEnviandoMensaje(false);
    }
  };

  //Reactivar
  const handleReactivarEncuesta = async () => {
    if (encuestaActual) {
      try {
        await actualizarEstadoEncuesta(encuestaActual.id, true);
        setEncuestaActual({ ...encuestaActual, activo: true });
      } catch {
        alert('No se pudo reactivar la encuesta');
      }
    }
  };

  //Habilitar un nuevo periodo
  const handleHabilitarEncuesta = async () => {
    if (!nuevoPeriodoId) return;

    try {
      await actualizarEstadoEncuesta(nuevoPeriodoId, true);

      const periodoSeleccionado = periodos.find((p) => p.id === nuevoPeriodoId) || null;
      if (periodoSeleccionado) {
        setEncuestaActual({ ...periodoSeleccionado, activo: true });
      }

      setNuevoPeriodoId('');
      setMensajeInactivo('');
      await loadPeriodos();
      setVersion((v) => v + 1);
      setTimeout(() => {
        if (typeof window !== 'undefined') window.location.reload();
      }, 300);
    } catch {
      alert('No se pudo habilitar la encuesta');
    }
  };

  return (
    <div key={version} className='p-6'>
      <h2 className='font-semibold text-lg mb-6'>Estado Actual de Encuestas</h2>

      {loading && <p className='mb-4 text-gray-600'>Cargando encuestas...</p>}
      {error && <p className='mb-4 text-red-600'>Error: {error}</p>}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Card: Encuesta activa (usando hook) */}
        <div className='border rounded-lg p-4 shadow-sm'>
          {active?.periodo ? (
            <>
              <h3 className='font-bold text-gray-800'>{active.periodo}</h3>

              <span
                className={`inline-block text-sm px-4 py-1 rounded-[15px] mt-1 ${
                  active.activo ? 'bg-[#5F8B1D] text-white' : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                {active.activo ? 'Activa' : 'Inactiva'}
              </span>

              {active.activo ? (
                <div className='mt-4'>
                  <Button
                    color='danger'
                    onPress={() => setConfirmOpen(true)}
                    isDisabled={terminando}
                    className='w-full'
                  >
                    {terminando ? (
                      <span className='inline-flex items-center gap-2'>
                        <Spinner size='sm' /> Terminando período...
                      </span>
                    ) : (
                      'Terminar período'
                    )}
                  </Button>
                </div>
              ) : (
                <div className='mt-4 space-y-3'>
                  <p className='text-gray-700'>No hay encuestas activas en este momento.</p>
                  {ultimoMensaje && (
                    <div>
                      <span className='block text-sm text-gray-600 mb-1'>Mensaje vigente</span>
                      <Chip color='primary' variant='flat' aria-label='Mensaje vigente'>
                        {ultimoMensaje}
                      </Chip>
                    </div>
                  )}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Mensaje para los usuarios</label>
                    <input
                      type='text'
                      value={mensajeInactivo}
                      onChange={(e) => setMensajeInactivo(e.target.value)}
                      placeholder='Ej: La encuesta se publicará pronto'
                      className='border px-3 py-2 rounded w-full focus:ring-2 focus:ring-green-600 focus:outline-none'
                      aria-label='Mensaje para los usuarios'
                    />
                  </div>
                  <Button
                    color='primary'
                    onPress={handleEnviarMensaje}
                    isDisabled={!mensajeInactivo.trim() || enviandoMensaje}
                    className='w-full'
                  >
                    {enviandoMensaje ? (
                      <span className='inline-flex items-center gap-2'>
                        <Spinner size='sm' /> Enviando mensaje...
                      </span>
                    ) : (
                      'Enviar mensaje'
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              <h3 className='font-bold text-gray-800'>Estado de encuesta</h3>
              <p className='text-gray-700 mt-1'>No hay encuestas activas en este momento.</p>
              {ultimoMensaje && (
                <div className='mt-2'>
                  <span className='block text-sm text-gray-600 mb-1'>Mensaje vigente</span>
                  <Chip color='primary' variant='flat' aria-label='Mensaje vigente'>
                    {ultimoMensaje}
                  </Chip>
                </div>
              )}
              <div className='mt-4 space-y-3'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Mensaje para los usuarios</label>
                <input
                  type='text'
                  value={mensajeInactivo}
                  onChange={(e) => setMensajeInactivo(e.target.value)}
                  placeholder='Ej: La encuesta se publicará pronto'
                  className='border px-3 py-2 rounded w-full focus:ring-2 focus:ring-green-600 focus:outline-none'
                  aria-label='Mensaje para los usuarios'
                />
                <Button
                  color='primary'
                  onPress={handleEnviarMensaje}
                  isDisabled={!mensajeInactivo.trim() || enviandoMensaje}
                  className='w-full'
                >
                  {enviandoMensaje ? (
                    <span className='inline-flex items-center gap-2'>
                      <Spinner size='sm' /> Enviando mensaje...
                    </span>
                  ) : (
                    'Enviar mensaje'
                  )}
                </Button>
              </div>
            </>
          )}
        </div>

        <AlertConfirm
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title='Confirmar desactivación'
          message={`Vas a desactivar el período "${active?.periodo ?? ''}". ¿Deseas continuar?`}
          confirmText='Sí, terminar'
          cancelText='Cancelar'
          onConfirm={async () => {
            await handleTerminarPeriodo();
          }}
          type='warning'
          confirmColor='danger'
        />

        {/* Card: Habilitar nueva encuesta */}
        <div className='border rounded-lg p-4 shadow-sm'>
          <h3 className='font-bold text-gray-800'>Habilitar nueva encuesta</h3>

          <Autocomplete
            label='Seleccionar período'
            placeholder='Seleccione un período'
            selectedKey={nuevoPeriodoId || null}
            onSelectionChange={(key) => setNuevoPeriodoId(key ? String(key) : '')}
            className='mb-4'
          >
            {[...periodos]
              .sort((a, b) => a.periodo.localeCompare(b.periodo, 'es'))
              .map((p) => (
                <AutocompleteItem key={p.id} textValue={p.periodo} aria-label={`Periodo ${p.periodo}`}>
                  {p.periodo}
                </AutocompleteItem>
              ))}
          </Autocomplete>


					<button
						onClick={handleHabilitarEncuesta}
						className='w-full px-4 py-2 rounded-[9px] text-white flex items-center justify-center gap-2'
						style={{ backgroundColor: '#5F8244' }}
					>
						Habilitar encuesta
					</button>
				</div>
			</div>
		</div>
	);
}
