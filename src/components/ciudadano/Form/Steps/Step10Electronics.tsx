import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "../FormContext";
import { DynamicForm } from "../Dynamic/DynamicForm";
import { DynamicQuestion as UIDynamicQuestion } from "../Dynamic/DynamicFormQuestion";
import { getPreguntaPorNumero, getTiposPregunta, getOpcionesRespuesta } from "@/services/ciudadano/FormService/questions.service";
import { groupOpcionesByPregunta, indexById, toDynamicQuestions } from "@/services/ciudadano/FormService/questions.adapter";
import { CitizenFormSkeleton } from "@/components/skeletons/CitizenFormSkeleton";

export const Step10Electronics = () => {
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
        const nums = [29, 30, 31, 32];
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
    const id29 = byNum[29];
    const id30 = byNum[30];
    const id31 = byNum[31];
    const id32 = byNum[32];
    if (id29) vals[id29] = state.generaRAEE;
    if (id30) vals[id30] = state.tiposRAEE || [];
    if (id31) vals[id31] = state.recoleccionRAEE;
    if (id32) vals[id32] = state.gestorRAEE;
    return vals;
  }, [questions, byNum, state.generaRAEE, state.tiposRAEE, state.recoleccionRAEE, state.gestorRAEE]);

  const attachments = useMemo(() => {
    if (!questions) return {};
    const id31 = byNum[31];
    return id31 ? { [id31]: state.dynamicAttachments?.[id31] } : {};
  }, [questions, byNum, state.dynamicAttachments]);

  const handleValueChange = (id: string, value: any) => {
    updateDynamicAnswer(id, value);
    const num = Number(Object.keys(byNum).find((n) => byNum[Number(n)] === id));
    if (num === 29) updateForm({ generaRAEE: value as boolean | null });
    if (num === 30) updateForm({ tiposRAEE: (value ?? []) as string[] });
    if (num === 31) updateForm({ recoleccionRAEE: value as boolean | null });
    if (num === 32) updateForm({ gestorRAEE: (value ?? undefined) as string | undefined });
  };

  const handleAttachmentChange = (id: string, file: any) => {
    updateDynamicAttachment(id, file || undefined);
  };

  if (loading) return <CitizenFormSkeleton />;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!questions) return null;

  // Condicionales locales: 30 y 31 visibles si generaRAEE === true; 32 visible si generaRAEE === true y recoleccionRAEE === true
  const id30 = byNum[30];
  const id31 = byNum[31];
  const id32 = byNum[32];
  const filtered = questions.filter((q) => {
    if (q.id === id32) return state.generaRAEE === true && state.recoleccionRAEE === true;
    if (q.id === id30 || q.id === id31) return state.generaRAEE === true;
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