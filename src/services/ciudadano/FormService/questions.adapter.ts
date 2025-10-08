import { DynamicQuestion as UIDynamicQuestion } from "@/components/ciudadano/Form/Dynamic/DynamicFormQuestion";
import { OpcionRespuesta, Pregunta, TipoPregunta } from "@/types/ciudadano/typeQuestions.types";

const mapTipo = (apiTipo: string): UIDynamicQuestion["type"] => {
  return apiTipo === "Sí/No" ? "S/No" : (apiTipo as UIDynamicQuestion["type"]);
};

export function indexById<T extends { id: string }>(items: T[]): Record<string, T> {
  return items.reduce<Record<string, T>>((acc, it) => {
    acc[it.id] = it;
    return acc;
  }, {});
}

export function groupOpcionesByPregunta(opciones: OpcionRespuesta[]): Record<string, OpcionRespuesta[]> {
  return opciones.reduce<Record<string, OpcionRespuesta[]>>((acc, o) => {
    if (!acc[o.id_pregunta]) acc[o.id_pregunta] = [];
    acc[o.id_pregunta].push(o);
    return acc;
  }, {});
}

export function toDynamicQuestions(
  preguntas: Pregunta[],
  tiposById: Record<string, TipoPregunta>,
  opcionesByPregunta: Record<string, OpcionRespuesta[]>
): UIDynamicQuestion[] {
  return preguntas
    .filter((p) => p.status)
    .sort((a, b) => a.num_pregunta - b.num_pregunta)
    .map((p) => {
      const tipo = tiposById[p.id_tipo_pregunta];
      const opts = (opcionesByPregunta[p.id] || [])
        .filter((o) => o.status)
        .sort((a, b) => a.orden_opcion - b.orden_opcion);

      const optionRequiresAttachment = opts.reduce<Record<string, boolean>>((acc, o) => {
        if (o.anexo_requerido) acc[o.id] = true;
        return acc;
      }, {});

      return {
        id: p.id,
        questionNumber: String(p.num_pregunta),
        text: p.contenido_pregunta,
        type: mapTipo(tipo?.tipo_pregunta || "Texto"),
        options: opts.length ? opts.map((o) => ({ key: o.id, label: o.opcion_respuesta })) : undefined,
        allowAttachment: p.anexo,
        optionRequiresAttachment: Object.keys(optionRequiresAttachment).length > 0 ? optionRequiresAttachment : undefined,
        required: false,
        tooltip: undefined,
        conditionalQuestions: undefined,
        conditionalTriggerValue: undefined,
      } satisfies UIDynamicQuestion;
    });
}
