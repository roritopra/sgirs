import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "../FormContext";
import { DynamicForm } from "../Dynamic/DynamicForm";
import { DynamicQuestion as UIDynamicQuestion } from "../Dynamic/DynamicFormQuestion";
import { getPreguntaPorNumero, getTiposPregunta, getOpcionesRespuesta } from "@/services/ciudadano/FormService/questions.service";
import { groupOpcionesByPregunta, indexById, toDynamicQuestions } from "@/services/ciudadano/FormService/questions.adapter";
import { CitizenFormSkeleton } from "@/components/skeletons/CitizenFormSkeleton";

export const Step4Separation = () => {
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
        const nums = [4, 5, 6, 7];
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
    const id4 = byNum[4];
    const id5 = byNum[5];
    const id6 = byNum[6];
    const id7 = byNum[7];
    if (id4) vals[id4] = state.separacionFuente;
    if (id5) vals[id5] = state.mobiliarioSeparacion;
    if (id6) vals[id6] = state.planoRutas;
    if (id7) vals[id7] = state.unidadAlmacenamiento;
    return vals;
  }, [questions, byNum, state.separacionFuente, state.mobiliarioSeparacion, state.planoRutas, state.unidadAlmacenamiento]);

  const attachments = useMemo(() => {
    if (!questions) return {};
    const result: Record<string, any> = {};
    Object.values(byNum).forEach(id => {
      if (state.dynamicAttachments?.[id]) {
        result[id] = state.dynamicAttachments[id];
      }
    });
    return result;
  }, [questions, byNum, state.dynamicAttachments]);

  const handleValueChange = (id: string, value: any) => {
    updateDynamicAnswer(id, value);
    // Reflejar en estado tradicional según num pregunta
    const num = Number(Object.keys(byNum).find((n) => byNum[Number(n)] === id));
    if (num === 4) updateForm({ separacionFuente: value as boolean | null });
    if (num === 5) updateForm({ mobiliarioSeparacion: value as boolean | null });
    if (num === 6) updateForm({ planoRutas: value as boolean | null });
    if (num === 7) updateForm({ unidadAlmacenamiento: value as boolean | null });
  };

  const handleAttachmentChange = (id: string, file: any) => {
    updateDynamicAttachment(id, file || undefined);
  };

  if (loading) return <CitizenFormSkeleton />;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!questions) return null;

  return (
    <div>
      <DynamicForm
        questions={questions}
        initialValues={initialValues}
        onValueChange={handleValueChange}
        onAttachmentChange={handleAttachmentChange}
        attachments={attachments}
      />
    </div>
  );
};