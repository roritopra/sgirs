import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "../FormContext";
import { DynamicForm } from "../Dynamic/DynamicForm";
import { DynamicFormQuestion, DynamicQuestion as UIDynamicQuestion } from "../Dynamic/DynamicFormQuestion";

import { getPreguntaPorNumero, getTiposPregunta, getOpcionesRespuesta } from "@/services/ciudadano/FormService/questions.service";
import { groupOpcionesByPregunta, indexById, toDynamicQuestions } from "@/services/ciudadano/FormService/questions.adapter";
import { CitizenFormSkeleton } from "@/components/skeletons/CitizenFormSkeleton";

export const Step12HazardousAndBulky = () => {
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
        const nums = [36, 37, 38, 39, 40, 41, 42, 43, 44];
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
    const id36 = byNum[36];
    const id37 = byNum[37];
    const id38 = byNum[38];
    const id39 = byNum[39];
    const id40 = byNum[40];
    const id41 = byNum[41];
    const id42 = byNum[42];
    const id43 = byNum[43];
    const id44 = byNum[44];
    if (id36) vals[id36] = state.generaRESPEL;
    if (id37) vals[id37] = state.tiposRESPEL || [];
    if (id38) vals[id38] = state.recoleccionRESPEL;
    if (id39) vals[id39] = state.gestorRESPEL;
    if (id40) vals[id40] = state.generaVoluminosos;
    if (id41) vals[id41] = state.tiposVoluminosos || [];
    if (id42) vals[id42] = state.conoceLineasVoluminosos;
    if (id43) vals[id43] = state.programaComunicacion;
    if (id44) vals[id44] = null;
    return vals;
  }, [
    questions,
    byNum,
    state.generaRESPEL,
    state.tiposRESPEL,
    state.recoleccionRESPEL,
    state.gestorRESPEL,
    state.generaVoluminosos,
    state.tiposVoluminosos,
    state.conoceLineasVoluminosos,
    state.programaComunicacion,
  ]);

  const attachments = useMemo(() => {
    if (!questions) return {};
    const id38 = byNum[38];
    const id43 = byNum[43];
    const id44 = byNum[44];
    const map: Record<string, any> = {};
    if (id38) map[id38] = state.dynamicAttachments?.[id38];
    if (id43) map[id43] = state.dynamicAttachments?.[id43];
    if (id44) map[id44] = state.dynamicAttachments?.[id44];
    return map;
  }, [questions, byNum, state.dynamicAttachments]);

  const handleValueChange = (id: string, value: any) => {
    updateDynamicAnswer(id, value);
    const num = Number(Object.keys(byNum).find((n) => byNum[Number(n)] === id));
    if (num === 36) updateForm({ generaRESPEL: value as boolean | null });
    if (num === 37) updateForm({ tiposRESPEL: (value ?? []) as string[] });
    if (num === 38) updateForm({ recoleccionRESPEL: value as boolean | null });
    if (num === 39) updateForm({ gestorRESPEL: (value ?? undefined) as string | undefined });
    if (num === 40) updateForm({ generaVoluminosos: value as boolean | null });
    if (num === 41) updateForm({ tiposVoluminosos: (value ?? []) as string[] });
    if (num === 42) updateForm({ conoceLineasVoluminosos: value as boolean | null });
    if (num === 43) updateForm({ programaComunicacion: value as boolean | null });
  };

  const handleAttachmentChange = (id: string, file: any) => {
    updateDynamicAttachment(id, file || undefined);
  };

  if (loading) return <CitizenFormSkeleton />;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!questions) return null;

  // Condicionales locales
  const id37 = byNum[37];
  const id38 = byNum[38];
  const id39 = byNum[39];
  const id41 = byNum[41];
  const id42 = byNum[42];
  const filtered = questions.filter((q) => {
    if (q.id === id37 || q.id === id38) return state.generaRESPEL === true;
    if (q.id === id39) return state.generaRESPEL === true && state.recoleccionRESPEL === true;
    if (q.id === id41 || q.id === id42) return state.generaVoluminosos === true;
    return true;
  });

  // Nota informativa para la pregunta 37 (visible solo cuando aparece la 37)
  const Note37 = (
    <div className="mb-10 p-3 bg-yellow-50 border border-yellow-100 rounded-md">
      <p className="text-sm text-yellow-800">
        <strong>Nota:</strong> ¿Generas más de 10 kilos de residuos peligrosos al mes? Recuerda inscribirte en la plataforma RUA del IDEAM: {" "}
        <a
          href="https://rua.ideam.gov.co/rua/login.jsf"
          aria-label="RUA del IDEAM en una nueva pestaña"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          https://rua.ideam.gov.co/rua/login.jsf
        </a>
        . Si ya te encuentras inscrito en la plataforma RESPEL del DAGMA, debes migrar tu información a la plataforma RUA del IDEAM en el mismo enlace: {" "}
        <a
          href="https://rua.ideam.gov.co/rua/login.jsf"
          aria-label="RUA del IDEAM en una nueva pestaña"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          https://rua.ideam.gov.co/rua/login.jsf
        </a>
      </p>
    </div>
  );

  // Render: insertar la nota justo debajo de la pregunta 37
  const getNumById = (id: string) => Number(Object.keys(byNum).find((n) => byNum[Number(n)] === id));
  const q37 = filtered.find((q) => q.id === id37);
  const before37 = filtered.filter((q) => getNumById(q.id) < 37);
  const after37 = filtered.filter((q) => getNumById(q.id) > 37);

  return (
    <div>
      <DynamicForm
        questions={before37}
        initialValues={initialValues}
        onValueChange={handleValueChange}
        onAttachmentChange={handleAttachmentChange}
        attachments={attachments}
        onValidationChange={(isValid) => {
          console.log(`Step12 validation (before37): ${isValid}`);
        }}
      />

      {state.generaRESPEL === true && q37 && (
        <>
          <DynamicFormQuestion
            question={q37 as any}
            value={initialValues[id37]}
            onChange={handleValueChange}
          />
          {Note37}
        </>
      )}

      <DynamicForm
        questions={after37}
        initialValues={initialValues}
        onValueChange={handleValueChange}
        onAttachmentChange={handleAttachmentChange}
        attachments={attachments}
        onValidationChange={(isValid) => {
          console.log(`Step12 validation (after37): ${isValid}`);
        }}
      />
    </div>
  );
};