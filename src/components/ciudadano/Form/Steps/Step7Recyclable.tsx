import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "../FormContext";
import { DynamicForm } from "../Dynamic/DynamicForm";
import { DynamicQuestion as UIDynamicQuestion } from "../Dynamic/DynamicFormQuestion";
import { getPreguntaPorNumero, getTiposPregunta, getOpcionesRespuesta } from "@/services/ciudadano/FormService/questions.service";
import { groupOpcionesByPregunta, indexById, toDynamicQuestions } from "@/services/ciudadano/FormService/questions.adapter";
import { CitizenFormSkeleton } from "@/components/skeletons/CitizenFormSkeleton";

export const Step7Recyclable = () => {
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
        const nums = [17, 18, 19];
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
    const id17 = byNum[17];
    const id18 = byNum[18];
    const id19 = byNum[19];
    if (id17) vals[id17] = state.generaAprovechables;
    if (id18) vals[id18] = state.tiposAprovechables || [];
    if (id19) vals[id19] = state.recoleccionAprovechables;
    return vals;
  }, [questions, byNum, state.generaAprovechables, state.tiposAprovechables, state.recoleccionAprovechables]);

  const attachments = useMemo(() => {
    if (!questions) return {};
    const id19 = byNum[19];
    return id19 ? { [id19]: state.dynamicAttachments?.[id19] } : {};
  }, [questions, byNum, state.dynamicAttachments]);

  const handleValueChange = (id: string, value: any) => {
    updateDynamicAnswer(id, value);
    const num = Number(Object.keys(byNum).find((n) => byNum[Number(n)] === id));
    if (num === 17) updateForm({ generaAprovechables: value as boolean | null });
    if (num === 18) updateForm({ tiposAprovechables: (value as string[]) || [] });
    if (num === 19) updateForm({ recoleccionAprovechables: value as boolean | null });
  };

  const handleAttachmentChange = (id: string, file: any) => {
    updateDynamicAttachment(id, file || undefined);
  };

  if (loading) return <CitizenFormSkeleton />;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!questions) return null;

  // Condicional local: sólo mostrar 18 y 19 si 17 === true
  const id18 = byNum[18];
  const id19 = byNum[19];
  const filteredQuestions = state.generaAprovechables === true && id18 && id19
    ? questions
    : questions.filter((q) => q.id !== id18 && q.id !== id19);

  return (
    <div>
      <DynamicForm
        questions={filteredQuestions}
        initialValues={initialValues}
        onValueChange={handleValueChange}
        onAttachmentChange={handleAttachmentChange}
        attachments={attachments}
      />
    </div>
  );
};