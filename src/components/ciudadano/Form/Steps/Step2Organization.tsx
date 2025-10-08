import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "../FormContext";
import { DynamicForm } from "../Dynamic/DynamicForm";
import { DynamicQuestion as UIDynamicQuestion } from "../Dynamic/DynamicFormQuestion";
import { getPreguntaPorNumero, getTiposPregunta, getOpcionesRespuesta } from "@/services/ciudadano/FormService/questions.service";
import { groupOpcionesByPregunta, indexById, toDynamicQuestions } from "@/services/ciudadano/FormService/questions.adapter";
import { CitizenFormSkeleton } from "@/components/skeletons/CitizenFormSkeleton";

export const Step2Organization = () => {
  const { state, updateForm, updateDynamicAnswer, updateDynamicAttachment } = useFormContext();

  const [questions, setQuestions] = useState<UIDynamicQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [pregunta, tipos, opciones] = await Promise.all([
          getPreguntaPorNumero(2),
          getTiposPregunta(),
          getOpcionesRespuesta(1, 500),
        ]);
        const tiposById = indexById(tipos);
        const opcionesByPregunta = groupOpcionesByPregunta(opciones.data);
        const dyn = toDynamicQuestions([pregunta], tiposById, opcionesByPregunta);
        if (mounted) setQuestions(dyn);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Error cargando pregunta");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const initialValues = useMemo(() => {
    return questions && questions.length > 0 ? { [questions[0].id]: state.esquemaOrganizacional } : {};
  }, [questions, state.esquemaOrganizacional]);

  const attachments = useMemo(() => {
    return questions && questions.length > 0 ? { [questions[0].id]: state.dynamicAttachments?.[questions[0].id] } : {};
  }, [questions, state.dynamicAttachments]);

  const handleValueChange = (id: string, value: any) => {
    updateDynamicAnswer(id, value);
    updateForm({ esquemaOrganizacional: value as boolean | null });
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