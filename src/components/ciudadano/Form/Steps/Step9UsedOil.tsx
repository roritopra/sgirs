import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "../FormContext";
import { DynamicForm } from "../Dynamic/DynamicForm";
import { DynamicQuestion as UIDynamicQuestion } from "../Dynamic/DynamicFormQuestion";
import { getPreguntaPorNumero, getTiposPregunta, getOpcionesRespuesta } from "@/services/ciudadano/FormService/questions.service";
import { groupOpcionesByPregunta, indexById, toDynamicQuestions } from "@/services/ciudadano/FormService/questions.adapter";
import { CitizenFormSkeleton } from "@/components/skeletons/CitizenFormSkeleton";

export const Step9UsedOil = () => {
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
        const nums = [25, 26, 27, 28];
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
    const id25 = byNum[25];
    const id26 = byNum[26];
    const id27 = byNum[27];
    const id28 = byNum[28];
    if (id25) vals[id25] = state.generaACU;
    if (id26) vals[id26] = state.recoleccionACU;
    if (id27) vals[id27] = state.gestorACU;
    if (id28) vals[id28] = state.frecuenciaACU;
    return vals;
  }, [questions, byNum, state.generaACU, state.recoleccionACU, state.gestorACU, state.frecuenciaACU]);

  const attachments = useMemo(() => {
    if (!questions) return {};
    const id26 = byNum[26];
    return id26 ? { [id26]: state.dynamicAttachments?.[id26] } : {};
  }, [questions, byNum, state.dynamicAttachments]);

  const handleValueChange = (id: string, value: any) => {
    updateDynamicAnswer(id, value);
    const num = Number(Object.keys(byNum).find((n) => byNum[Number(n)] === id));
    if (num === 25) updateForm({ generaACU: value as boolean | null });
    if (num === 26) updateForm({ recoleccionACU: value as boolean | null });
    if (num === 27) updateForm({ gestorACU: (value ?? undefined) as string | undefined });
    if (num === 28) updateForm({ frecuenciaACU: (value ?? undefined) as string | undefined });
  };

  const handleAttachmentChange = (id: string, file: any) => {
    updateDynamicAttachment(id, file || undefined);
  };

  if (loading) return <CitizenFormSkeleton />;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!questions) return null;

  // Condicionales locales: 26 visible si generaACU === true; 27 y 28 visibles si generaACU === true y recoleccionACU === true
  const id26 = byNum[26];
  const id27 = byNum[27];
  const id28 = byNum[28];
  const filtered = questions.filter((q) => {
    if (q.id === id27 || q.id === id28) return state.generaACU === true && state.recoleccionACU === true;
    if (q.id === id26) return state.generaACU === true;
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