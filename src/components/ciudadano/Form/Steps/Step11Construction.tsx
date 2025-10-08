import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "../FormContext";
import { DynamicForm } from "../Dynamic/DynamicForm";
import { DynamicFormQuestion, DynamicQuestion as UIDynamicQuestion } from "../Dynamic/DynamicFormQuestion";

import { getPreguntaPorNumero, getTiposPregunta, getOpcionesRespuesta } from "@/services/ciudadano/FormService/questions.service";
import { groupOpcionesByPregunta, indexById, toDynamicQuestions } from "@/services/ciudadano/FormService/questions.adapter";
import { CitizenFormSkeleton } from "@/components/skeletons/CitizenFormSkeleton";

export const Step11Construction = () => {
  const { state, updateForm, updateDynamicAnswer, updateDynamicAttachment } = useFormContext();

  const [questions, setQuestions] = useState<UIDynamicQuestion[] | null>(null);
  const [byNum, setByNum] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const nums = [33, 34, 35];
        const [tipos, opciones, ...pregs] = await Promise.all([
          getTiposPregunta(),
          getOpcionesRespuesta(1, 500),
          ...nums.map((n) => getPreguntaPorNumero(n)),
        ]);

        const tiposById = indexById(tipos);
        const opcionesByPregunta = groupOpcionesByPregunta(opciones.data);
        const preguntas = pregs as any[];
        const dyn = toDynamicQuestions(preguntas as any, tiposById, opcionesByPregunta);

        const mapNumToId: Record<number, string> = {};
        preguntas.forEach((p: any) => {
          mapNumToId[p.num_pregunta] = p.id;
        });

        if (!mounted) return;
        setQuestions(dyn);
        setByNum(mapNumToId);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Error cargando preguntas");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const initialValues = useMemo(() => {
    if (!questions) return {};
    const vals: Record<string, any> = {};
    const id33 = byNum[33];
    const id34 = byNum[34];
    const id35 = byNum[35];
    if (id33) vals[id33] = state.generaRCD;
    if (id34) vals[id34] = state.recoleccionRCD;
    if (id35) vals[id35] = state.gestorRCD;
    return vals;
  }, [questions, byNum, state.generaRCD, state.recoleccionRCD, state.gestorRCD]);

  const attachments = useMemo(() => {
    if (!questions) return {};
    const id34 = byNum[34];
    return id34 ? { [id34]: state.dynamicAttachments?.[id34] } : {};
  }, [questions, byNum, state.dynamicAttachments]);

  const handleValueChange = (id: string, value: any) => {
    updateDynamicAnswer(id, value);
    const num = Number(Object.keys(byNum).find((n) => byNum[Number(n)] === id));
    if (num === 33) updateForm({ generaRCD: value as boolean | null });
    if (num === 34) updateForm({ recoleccionRCD: value as boolean | null });
    if (num === 35) updateForm({ gestorRCD: (value ?? undefined) as string | undefined });
  };

  const handleAttachmentChange = (id: string, file: any) => {
    updateDynamicAttachment(id, file || undefined);
  };

  if (loading) return <CitizenFormSkeleton />;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!questions) return null;

  // Nota informativa persistente (se muestra junto a la pregunta 33)
  const Note = (
    <div className="mb-10 p-3 bg-yellow-50 border border-yellow-100 rounded-md">
      <p className="text-sm text-yellow-800">
        <strong>Nota:</strong> Recuerda que si el área de la construcción es mayor a 2.000 m²,  y cumples con uno de los siguientes requisitos: 1) requiere la expedición de licencia de construcción y/o licencia de intervención y ocupación del espacio público. 2) los proyectos que requieren licencia ambiental, es considerado Gran Generador de RCD, y debe dar cumplimiento a lo establecido en las resoluciones 0472 de 2017 y 1257 de 2021, ambas expedidas por Minambiente.
      </p>
    </div>
  );

  // Condicionales locales: 34 visible si generaRCD === true; 35 visible si generaRCD === true y recoleccionRCD === true
  const id33 = byNum[33];
  const id34 = byNum[34];
  const id35 = byNum[35];
  const filtered = questions.filter((q) => {
    if (q.id === id35) return state.generaRCD === true && state.recoleccionRCD === true;
    if (q.id === id34) return state.generaRCD === true;
    return true;
  });
  const firstQuestion = questions.find((q) => q.id === id33);
  const restQuestions = filtered.filter((q) => q.id !== id33);

  return (
    <div>
      <div className="mb-8">
        {firstQuestion && (
          <DynamicFormQuestion
            question={firstQuestion}
            value={initialValues[id33]}
            onChange={handleValueChange}
          />
        )}
        {Note}
        <DynamicForm
          questions={restQuestions}
          initialValues={initialValues}
          onValueChange={handleValueChange}
          onAttachmentChange={handleAttachmentChange}
          attachments={attachments}
        />
      </div>
    </div>
  );
};