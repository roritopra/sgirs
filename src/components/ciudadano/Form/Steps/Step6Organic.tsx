import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "../FormContext";
import { DynamicForm } from "../Dynamic/DynamicForm";
import { DynamicQuestion as UIDynamicQuestion } from "../Dynamic/DynamicFormQuestion";
import { getPreguntaPorNumero, getTiposPregunta, getOpcionesRespuesta } from "@/services/ciudadano/FormService/questions.service";
import { groupOpcionesByPregunta, indexById, toDynamicQuestions } from "@/services/ciudadano/FormService/questions.adapter";
import { CitizenFormSkeleton } from "@/components/skeletons/CitizenFormSkeleton";

export const Step6Organic = () => {
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
        const nums = [11, 12, 13, 14, 15, 16];

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
    const id11 = byNum[11];
    const id12 = byNum[12];
    const id13 = byNum[13];
    const id14 = byNum[14];
    const id15 = byNum[15];
    const id16 = byNum[16];
    if (id11) vals[id11] = state.generaOrganicos;
    if (id12) vals[id12] = state.recoleccionOrganicos;
    if (id13) vals[id13] = state.gestorOrganicos;
    if (id14) vals[id14] = state.otroGestorOrganicos;
    if (id15) vals[id15] = state.frecuenciaOrganicos;
    if (id16) vals[id16] = state.aprovechamientoInSitu;
    return vals;
  }, [questions, byNum, state.generaOrganicos, state.recoleccionOrganicos, state.gestorOrganicos, state.frecuenciaOrganicos, state.aprovechamientoInSitu]);

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
    if (num === 11) updateForm({ generaOrganicos: value as boolean | null });
    if (num === 12) updateForm({ recoleccionOrganicos: value as boolean | null });
    if (num === 13) updateForm({ gestorOrganicos: value as string | undefined });
    if (num === 14) updateForm({ otroGestorOrganicos: value as string | undefined });
    if (num === 15) updateForm({ frecuenciaOrganicos: value as string | undefined });
    if (num === 16) updateForm({ aprovechamientoInSitu: value as boolean | null });
  };

  const handleAttachmentChange = (id: string, file: any) => {
    updateDynamicAttachment(id, file || undefined);
  };

  // Mostrar pregunta 14 sólo si en la 13 se elige "Otro, ¿Cuál?"
  const normalize = (s: string) => String(s || "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").trim();
  const q13Id = byNum[13];
  const q14Id = byNum[14];
  const q13 = useMemo(() => questions?.find((q) => q.id === q13Id), [questions, q13Id]);
  const selectedQ13 = state.gestorOrganicos as string | undefined;
  const selectedIsOther = useMemo(() => {
    const opts: any[] = (q13 as any)?.options || [];
    const selected = opts.find((o) => o.key === selectedQ13);
    if (!selected) return false;
    return normalize(selected.label).includes("otro");
  }, [q13, selectedQ13]);
  const shouldShowQ14 = Boolean(q14Id) && selectedIsOther;

  // Limpiar automáticamente la 14 cuando deje de mostrarse
  useEffect(() => {
    if (!shouldShowQ14 && q14Id) {
      const hasText = typeof state.otroGestorOrganicos === "string" && state.otroGestorOrganicos.trim() !== "";
      const hasDyn = !!state.dynamicAnswers?.[q14Id];
      if (hasText) updateForm({ otroGestorOrganicos: "" });
      if (hasDyn) updateDynamicAnswer(q14Id, "");
    }
  }, [shouldShowQ14, q14Id, state.otroGestorOrganicos, state.dynamicAnswers, updateForm, updateDynamicAnswer]);

  // Si la 11 es NO, ocultar 12–16 y limpiar su estado solo si hay algo por limpiar
  useEffect(() => {
    if (state.generaOrganicos !== false) return;
    const needsClear = (
      state.recoleccionOrganicos !== null ||
      state.gestorOrganicos !== undefined ||
      (typeof state.otroGestorOrganicos === "string" && state.otroGestorOrganicos.trim() !== "") ||
      state.frecuenciaOrganicos !== undefined ||
      state.aprovechamientoInSitu !== null
    );
    if (!needsClear) return;
    updateForm({
      recoleccionOrganicos: null,
      gestorOrganicos: undefined,
      otroGestorOrganicos: "",
      frecuenciaOrganicos: undefined,
      aprovechamientoInSitu: null,
    });
  }, [
    state.generaOrganicos,
    state.recoleccionOrganicos,
    state.gestorOrganicos,
    state.otroGestorOrganicos,
    state.frecuenciaOrganicos,
    state.aprovechamientoInSitu,
    updateForm,
  ]);

  // Además, limpiar dynamicAnswers y dynamicAttachments de P12–P16 cuando P11 sea NO
  useEffect(() => {
    if (state.generaOrganicos !== false) return;
    const ids = [byNum[12], byNum[13], byNum[14], byNum[15], byNum[16]].filter(Boolean) as string[];
    ids.forEach((qid) => {
      const hasAns = !!state.dynamicAnswers?.[qid];
      const hasAtt = !!state.dynamicAttachments?.[qid];
      if (hasAns) updateDynamicAnswer(qid, "");
      if (hasAtt) updateDynamicAttachment(qid, undefined);
    });
  }, [state.generaOrganicos, byNum, state.dynamicAnswers, state.dynamicAttachments, updateDynamicAnswer, updateDynamicAttachment]);

  const questionsToRender = useMemo(() => {
    if (!questions) return [] as any[];
    // Hasta que la P11 sea "Sí", sólo mostrar la P11 y ocultar 12–16
    if (state.generaOrganicos !== true) {
      const id11 = byNum[11];
      return id11 ? questions.filter((q) => q.id === id11) : [];
    }
    if (shouldShowQ14) return questions;
    return questions.filter((q) => q.id !== q14Id);
  }, [questions, shouldShowQ14, q14Id, state.generaOrganicos, byNum]);

  if (loading) return <CitizenFormSkeleton />;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!questions) return null;

  return (
    <div>
      <DynamicForm
        questions={questionsToRender}
        initialValues={initialValues}
        onValueChange={handleValueChange}
        onAttachmentChange={handleAttachmentChange}
        attachments={attachments}
      />
    </div>
  );
};