import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "../FormContext";
import { DynamicForm } from "../Dynamic/DynamicForm";
import { DynamicQuestion as UIDynamicQuestion } from "../Dynamic/DynamicFormQuestion";
import { getPreguntaPorNumero, getTiposPregunta, getOpcionesRespuesta } from "@/services/ciudadano/FormService/questions.service";
import { groupOpcionesByPregunta, indexById, toDynamicQuestions } from "@/services/ciudadano/FormService/questions.adapter";
import { CitizenFormSkeleton } from "@/components/skeletons/CitizenFormSkeleton";

export const Step8RecyclableManagers = () => {
  const { state, updateForm, updateDynamicAnswer, updateDynamicAttachment } = useFormContext();

  if (state.generaAprovechables !== true || state.recoleccionAprovechables !== true) {
    return (
      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-blue-800">
          Este paso solo aplica si genera residuos aprovechables y solicita su recolección a través de un gestor.
        </p>
      </div>
    );
  }

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
        const nums = [20, 21, 22, 23, 24];
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
    const id20 = byNum[20];
    const id21 = byNum[21];
    const id22 = byNum[22];
    const id23 = byNum[23];
    const id24 = byNum[24];
    if (id20) vals[id20] = state.esORO;
    if (id21) vals[id21] = state.organizacionRecicladores;
    if (id22) vals[id22] = state.gestorNoORO;
    if (id23) vals[id23] = state.frecuenciaAprovechables;
    if (id24) vals[id24] = state.dynamicAttachments?.[id24] ? true : null; // representar adjunto como boolean si UI lo espera
    return vals;
  }, [questions, byNum, state.esORO, state.organizacionRecicladores, state.gestorNoORO, state.frecuenciaAprovechables, state.dynamicAttachments]);

  const attachments = useMemo(() => {
    if (!questions) return {};
    const id24 = byNum[24];
    return id24 ? { [id24]: state.dynamicAttachments?.[id24] } : {};
  }, [questions, byNum, state.dynamicAttachments]);

  const handleValueChange = (id: string, value: any) => {
    updateDynamicAnswer(id, value);
    const num = Number(Object.keys(byNum).find((n) => byNum[Number(n)] === id));
    if (num === 20) updateForm({ esORO: value as boolean | null });
    if (num === 21) updateForm({ organizacionRecicladores: (value ?? undefined) as string | undefined });
    if (num === 22) updateForm({ gestorNoORO: (value ?? undefined) as string | undefined });
    if (num === 23) updateForm({ frecuenciaAprovechables: (value ?? undefined) as string | undefined });
  };

  const handleAttachmentChange = (id: string, file: any) => {
    updateDynamicAttachment(id, file || undefined);
  };

  if (loading) return <CitizenFormSkeleton />;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!questions) return null;

  // Condicionales locales:
  // - Si esORO === true, mostrar 21; si esORO === false, mostrar 22; si null, ocultar ambos.
  // - Mostrar 24 (CCU) si esORO === true o hay gestorNoORO.
  const id21 = byNum[21];
  const id22 = byNum[22];
  const id24 = byNum[24];
  const filtered = questions.filter((q) => {
    if (q.id === id21) return state.esORO === true;
    if (q.id === id22) return state.esORO === false;
    if (q.id === id24) return state.esORO === true || !!state.gestorNoORO;
    return true;
  });

  return (
    <div>
      <DynamicForm
        questions={filtered}
        initialValues={initialValues}
        onValueChange={handleValueChange}
        onAttachmentChange={handleAttachmentChange}
        attachments={attachments}
      />
    </div>
  );
};