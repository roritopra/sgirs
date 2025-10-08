import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "../FormContext";
import { DynamicForm } from "../Dynamic/DynamicForm";
import { DynamicQuestion as UIDynamicQuestion } from "../Dynamic/DynamicFormQuestion";
import { getPreguntaPorNumero, getTiposPregunta, getOpcionesRespuesta } from "@/services/ciudadano/FormService/questions.service";
import { groupOpcionesByPregunta, indexById, toDynamicQuestions } from "@/services/ciudadano/FormService/questions.adapter";
import { CitizenFormSkeleton } from "@/components/skeletons/CitizenFormSkeleton";

export const Step5Collection = () => {
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
        const nums = [8, 9, 10];
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
    const id8 = byNum[8];
    const id9 = byNum[9];
    const id10 = byNum[10];
    if (id8) vals[id8] = state.empresaAseo;
    if (id9) vals[id9] = state.frecuenciaRecoleccion;
    if (id10) vals[id10] = state.aforoResiduos;
    return vals;
  }, [questions, byNum, state.empresaAseo, state.frecuenciaRecoleccion, state.aforoResiduos]);

  const attachments = useMemo(() => {
    if (!questions) return {};
    const id10 = byNum[10];
    return id10 ? { [id10]: state.dynamicAttachments?.[id10] } : {};
  }, [questions, byNum, state.dynamicAttachments]);

  const handleValueChange = (id: string, value: any) => {
    updateDynamicAnswer(id, value);
    const num = Number(Object.keys(byNum).find((n) => byNum[Number(n)] === id));
    if (num === 8) updateForm({ empresaAseo: (value ?? undefined) as string | undefined });
    if (num === 9) updateForm({ frecuenciaRecoleccion: (value ?? undefined) as string | undefined });
    if (num === 10) updateForm({ aforoResiduos: value as boolean | null });
  };

  const handleAttachmentChange = (id: string, file: any) => {
    updateDynamicAttachment(id, file || undefined);
  };

  if (loading) return <CitizenFormSkeleton />;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!questions) return null;

  const showAforoInfo = state.aforoResiduos === true;

  return (
    <div>
      <DynamicForm
        questions={questions}
        initialValues={initialValues}
        onValueChange={handleValueChange}
        onAttachmentChange={handleAttachmentChange}
        attachments={attachments}
      />

      {showAforoInfo && (
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-md mt-2">
          <p className="text-sm text-blue-800">
            <strong>Definición de aforo:</strong> El aforo es la medición puntual de la cantidad de residuos sólidos presentados para la recolección por el usuario. Esta medición permite determinar con exactitud la producción de residuos y ajustar las tarifas según el volumen o peso de los residuos generados.
          </p>
        </div>
      )}
    </div>
  );
};