"use client";

import { Accordion, AccordionItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import {
  DocumentTextIcon,
  TrashIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { RespuestasPeriodo, RespuestaItem } from "@/services/ciudadano/ansewerForm.service";
import { getIndicatorsAnswers, IndicatorsAnswersResponse } from "@/services/ciudadano/FormService/indicators.service";

// Tipo para las preguntas de cada categoría
type CategoryQuestion = {
  id: number;
  question: string;
  answer: string;
  archivo_anexo?: string | null;
  nombre_anexo?: string | null;
};

type CategoryKey =
  | "documentation"
  | "organization"
  | "separation"
  | "collection"
  | "organic"
  | "recyclable"
  | "oil"
  | "raee"
  | "rcd"
  | "respel"
  | "indicators";

const CATEGORY_MAP: Record<CategoryKey, number[]> = {
  documentation: [1],
  organization: [2],
  separation: [4, 5, 6, 7],
  collection: [8, 9, 10],
  organic: [11, 12, 13, 14, 15, 16],
  recyclable: [17, 18, 19, 20, 21, 22, 23, 24],
  oil: [25, 26, 27, 28],
  raee: [29, 30, 31, 32],
  rcd: [33, 34, 35],
  respel: [36, 37, 38, 39, 40, 41, 42, 43, 44],
  indicators: [],
};

function buildCategoryQuestions(periodData: RespuestasPeriodo): Record<CategoryKey, CategoryQuestion[]> {
  const result: Record<CategoryKey, CategoryQuestion[]> = {
    documentation: [],
    organization: [],
    separation: [],
    collection: [],
    organic: [],
    recyclable: [],
    oil: [],
    raee: [],
    rcd: [],
    respel: [],
    indicators: [],
  };

  const toNumber = (s: string): number | null => {
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  for (const r of periodData.respuestas_usuario as RespuestaItem[]) {
    const num = toNumber(r.num_pregunta);
    if (num === null) continue;

    const entry: CategoryQuestion = {
      id: num,
      question: r.pregunta,
      answer: r.opcion_respuesta,
      archivo_anexo: r.archivo_anexo,
      nombre_anexo: r.nombre_anexo ?? null,
    };

    (Object.keys(CATEGORY_MAP) as CategoryKey[]).forEach((key) => {
      if (CATEGORY_MAP[key].includes(num)) {
        result[key].push(entry);
      }
    });
  }

  // Ordenar por id dentro de cada categoría
  (Object.keys(result) as CategoryKey[]).forEach((k) => {
    result[k].sort((a, b) => a.id - b.id);
  });

  return result;
}

// Componente para mostrar las preguntas de cada categoría
const CategoryDetail = ({ questions }: { questions: CategoryQuestion[] }) => {
  if (!questions || questions.length === 0) {
    return (
      <div className="mt-3">
        <p className="text-sm text-gray-500 italic">No hay detalles aún.</p>
      </div>
    );
  }
  return (
    <div className="mt-3 space-y-2">
      {questions.map((q) => (
        <div key={q.id} className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-gray-700">{q.question}</p>
          <p className="text-gray-900">{q.answer}</p>
          {(q.nombre_anexo || q.archivo_anexo) && (
            <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
              <PaperClipIcon className="w-4 h-4 text-gray-500" aria-hidden="true" />
              {q.nombre_anexo && <span>{q.nombre_anexo}</span>}
              {q.archivo_anexo && (
                <a
                  href={q.archivo_anexo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Abrir
                </a>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default function SummaryReport({ periodData, periodId }: { periodData: RespuestasPeriodo; periodId?: string }) {
  // Estado para controlar qué categorías están expandidas
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]));
  const categoryQuestions = buildCategoryQuestions(periodData);

  // Resúmenes dinámicos por categoría basados en respuestas reales
  const yn = (val?: string) => {
    const t = String(val || "").trim().toLowerCase();
    return t === "sí" || t === "si" || t === "true";
  };

  const getAnswerForNum = (n: number): string | null => {
    const list = (periodData.respuestas_usuario || []).filter(
      (r: any) => Number(r.num_pregunta) === n
    ) as RespuestaItem[];
    if (list.length === 0) return null;
    const yes = list.find((r) => yn(r.opcion_respuesta));
    return (yes || list[0]).opcion_respuesta || null;
  };

  const docHasManual = yn(getAnswerForNum(1) || undefined);
  const orgDefined = yn(getAnswerForNum(2) || undefined);
  const sepFuente = yn(getAnswerForNum(4) || undefined);
  const mobiliario = yn(getAnswerForNum(5) || undefined);
  const planoRutas = yn(getAnswerForNum(6) || undefined);
  const uar = yn(getAnswerForNum(7) || undefined);
  const servicioAseo = yn(getAnswerForNum(8) || undefined);
  const generaOrganicos = yn(getAnswerForNum(11) || undefined);
  const generaAprovechables = yn(getAnswerForNum(17) || undefined);
  const generaACU = yn(getAnswerForNum(25) || undefined);
  const generaRAEE = yn(getAnswerForNum(29) || undefined);
  const generaRCD = yn(getAnswerForNum(33) || undefined);
  const generaRESPEL = yn(getAnswerForNum(36) || undefined);

  const [indAnswers, setIndAnswers] = useState<IndicatorsAnswersResponse | null>(null);
  const [indLoading, setIndLoading] = useState(false);
  const [indError, setIndError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!periodId) return;
      try {
        setIndLoading(true);
        setIndError(null);
        const data = await getIndicatorsAnswers(periodId);
        if (!active) return;
        setIndAnswers(data);
      } catch (e: any) {
        if (!active) return;
        setIndError(e?.message || "Error al cargar indicadores");
      } finally {
        if (active) setIndLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [periodId]);

  const monthShort: Record<string, string> = useMemo(() => ({
    enero: "ene",
    febrero: "feb",
    marzo: "mar",
    abril: "abr",
    mayo: "may",
    junio: "jun",
    julio: "jul",
    agosto: "ago",
    septiembre: "sep",
    octubre: "oct",
    noviembre: "nov",
    diciembre: "dic",
  }), []);

  const IndicatorsDetail = ({ items }: { items: any[] }) => {
    if (!items || items.length === 0) {
      return (
        <div className="mt-3">
          <p className="text-sm text-gray-500 italic">No hay detalles aún.</p>
        </div>
      );
    }
    return (
      <div className="mt-3 space-y-3">
        {items.map((it, idx) => {
          const nombre = (it as any).nombre_indicador as string;
          const variables = (it as any).variables as any[] | undefined;
          const preguntas = (it as any).respuestas as any[] | undefined;
          return (
            <div key={`${nombre}-${idx}`} className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-700">{nombre}</p>
              {Array.isArray(variables) && variables.length > 0 && (
                <div className="mt-2 space-y-1">
                  {variables.map((v, i) => {
                    const rpm = (v?.respuesta_por_mes || {}) as Record<string, number>;
                    const nonZero = Object.entries(rpm)
                      .filter(([, val]) => Number(val) !== 0)
                      .map(([k, val]) => `${monthShort[k] ?? k}: ${val}`)
                      .join(" · ");
                    return (
                      <div key={`var-${i}`} className="text-sm text-gray-700">
                        <span className="font-medium">{v?.nombre_variable}:</span>{" "}
                        <span className="text-gray-600">{nonZero || "Sin datos"}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {Array.isArray(preguntas) && preguntas.length > 0 && (
                <div className="mt-2 grid grid-cols-1 gap-1">
                  {preguntas.map((p, j) => (
                    <div key={`q-${j}`} className="text-sm text-gray-700">
                      <span className="font-medium">{p.pregunta}:</span>{" "}
                      <span className="text-gray-600">{p.respuesta}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <section className="w-full p-4 bg-[#e8faf0] rounded-2xl">
      <div className="mb-6 p-4 bg-white rounded-xl shadow-form-card">
        <div className="space-y-1">
          <Accordion 
            selectedKeys={selectedKeys}
            onSelectionChange={setSelectedKeys as any}
            variant="bordered"
            showDivider
            className="flex flex-col gap-2"
          >
            {/* Documentación */}
            <AccordionItem
              key="documentation"
              aria-label="Documentación"
              startContent={
                <div className="bg-green-100 p-1.5 rounded-md">
                  <DocumentTextIcon className="text-green-600 w-6 h-6" />
                </div>
              }
              title={
                <div>
                  <p className="font-medium">Documentación:</p>
                  <p className="text-sm text-gray-600">
                    {docHasManual ? "Cuenta con manual SGIRS" : "No cuenta con manual SGIRS"}
                  </p>
                </div>
              }
            >
              <CategoryDetail questions={categoryQuestions.documentation} />
            </AccordionItem>

            {/* Organización */}
            <AccordionItem
              key="organization"
              aria-label="Estructura organizacional"
              startContent={
                <div className="bg-blue-100 p-1.5 rounded-md">
                  <Image src="/onigram.svg" alt="Logo" width={24} height={24} />
                </div>
              }
              title={
                <div>
                  <p className="font-medium">Estructura organizacional:</p>
                  <p className="text-sm text-gray-600">{orgDefined ? "Definida" : "No definida"}</p>
                </div>
              }
            >
              <CategoryDetail questions={categoryQuestions.organization} />
            </AccordionItem>

            {/* Separación y Almacenamiento */}
            <AccordionItem
              key="separation"
              aria-label="Separación y Almacenamiento"
              startContent={
                <div className="bg-amber-100 p-1.5 rounded-md">
                  <TrashIcon className="text-amber-600 w-6 h-6" />
                </div>
              }
              title={
                <div>
                  <p className="font-medium">Separación y Almacenamiento:</p>
                  <p className="text-sm text-gray-600">
                    {`Separación en fuente: ${sepFuente ? "Sí" : "No"}, Mobiliario: ${mobiliario ? "Sí" : "No"}, Plano: ${planoRutas ? "Sí" : "No"}, UAR: ${uar ? "Sí" : "No"}`}
                  </p>
                </div>
              }
            >
              <CategoryDetail questions={categoryQuestions.separation} />
            </AccordionItem>

            {/* Recolección No Aprovechables */}
            <AccordionItem
              key="collection"
              aria-label="Recolección No Aprovechables"
              startContent={
                <div className="bg-purple-100 p-1.5 rounded-md">
                  <Image
                    src="/trash-truck.svg"
                    alt="Logo"
                    width={24}
                    height={24}
                  />
                </div>
              }
              title={
                <div>
                  <p className="font-medium">Recolección No Aprovechables:</p>
                  <p className="text-sm text-gray-600">
                    {`Servicio de aseo: ${servicioAseo ? "Sí" : "No"}`}
                  </p>
                </div>
              }
            >
              <CategoryDetail questions={categoryQuestions.collection} />
            </AccordionItem>

            {/* Residuos Orgánicos */}
            <AccordionItem
              key="organic"
              aria-label="Residuos orgánicos"
              startContent={
                <div className="bg-green-100 p-1.5 rounded-md">
                  <Image src="/apple.svg" alt="Logo" width={24} height={24} />
                </div>
              }
              title={
                <div>
                  <p className="font-medium">Residuos orgánicos:</p>
                  <p className="text-sm text-gray-600">
                    {generaOrganicos ? "Genera residuos orgánicos" : "No genera residuos orgánicos"}
                  </p>
                </div>
              }
            >
              <CategoryDetail questions={categoryQuestions.organic} />
            </AccordionItem>

            {/* Residuos Aprovechables */}
            <AccordionItem
              key="recyclable"
              aria-label="Residuos aprovechables"
              startContent={
                <div className="bg-blue-100 p-1.5 rounded-md">
                  <Icon icon="lucide:recycle" className="text-blue-600 w-6 h-6" />
                </div>
              }
              title={
                <div>
                  <p className="font-medium">Residuos aprovechables:</p>
                  <p className="text-sm text-gray-600">
                    {generaAprovechables ? "Genera residuos aprovechables" : "No genera residuos aprovechables"}
                  </p>
                </div>
              }
            >
              <CategoryDetail questions={categoryQuestions.recyclable} />
            </AccordionItem>

            {/* Aceite de Cocina Usado */}
            <AccordionItem
              key="oil"
              aria-label="Aceite de cocina usado"
              startContent={
                <div className="bg-yellow-100 p-1.5 rounded-md">
                  <Icon
                    icon="lucide:droplet"
                    className="text-yellow-600 w-6 h-6"
                  />
                </div>
              }
              title={
                <div>
                  <p className="font-medium">Aceite de cocina usado:</p>
                  <p className="text-sm text-gray-600">{generaACU ? "Genera ACU" : "No genera ACU"}</p>
                </div>
              }
            >
              <CategoryDetail questions={categoryQuestions.oil} />
            </AccordionItem>

            {/* RAEE */}
            <AccordionItem
              key="raee"
              aria-label="RAEE"
              startContent={
                <div className="bg-gray-100 p-1.5 rounded-md">
                  <Image src="/laptop.svg" alt="Logo" width={24} height={24} />
                </div>
              }
              title={
                <div>
                  <p className="font-medium">RAEE:</p>
                  <p className="text-sm text-gray-600">{generaRAEE ? "Genera RAEE" : "No genera RAEE"}</p>
                </div>
              }
            >
              <CategoryDetail questions={categoryQuestions.raee} />
            </AccordionItem>

            {/* RCD */}
            <AccordionItem
              key="rcd"
              aria-label="RCD"
              startContent={
                <div className="bg-orange-100 p-1.5 rounded-md">
                  <Image src="/brick.svg" alt="Logo" width={24} height={24} />
                </div>
              }
              title={
                <div>
                  <p className="font-medium">RCD:</p>
                  <p className="text-sm text-gray-600">{generaRCD ? "Genera RCD" : "No genera RCD"}</p>
                </div>
              }
            >
              <CategoryDetail questions={categoryQuestions.rcd} />
            </AccordionItem>

            {/* RESPEL */}
            <AccordionItem
              key="respel"
              aria-label="RESPEL"
              startContent={
                <div className="bg-red-100 p-1.5 rounded-md">
                  <Icon
                    icon="lucide:alert-triangle"
                    className="text-red-600 w-5 h-5"
                  />
                </div>
              }
              title={
                <div>
                  <p className="font-medium">RESPEL:</p>
                  <p className="text-sm text-gray-600">{generaRESPEL ? "Genera RESPEL" : "No genera RESPEL"}</p>
                </div>
              }
            >
              <CategoryDetail questions={categoryQuestions.respel} />
            </AccordionItem>

            {/* Indicadores */}
            <AccordionItem
              key="indicators"
              aria-label="Indicadores"
              startContent={
                <div className="bg-indigo-100 p-1.5 rounded-md">
                  <Icon
                    icon="lucide:bar-chart-2"
                    className="text-indigo-600 w-5 h-5"
                  />
                </div>
              }
              title={
                <div>
                  <p className="font-medium">Indicadores:</p>
                  <p className="text-sm text-gray-600">
                    {indLoading
                      ? "Cargando indicadores..."
                      : indError
                      ? "Error al cargar indicadores"
                      : !indAnswers || indAnswers.respuestas.length === 0
                      ? "No hay indicadores reportados"
                      : `${indAnswers.respuestas.length} indicadores reportados`}
                  </p>
                </div>
              }
            >
              {indLoading && (
                <div className="mt-3">
                  <p className="text-sm text-gray-500">Cargando...</p>
                </div>
              )}
              {indError && !indLoading && (
                <div className="mt-3">
                  <p className="text-sm text-red-500">{indError}</p>
                </div>
              )}
              {!indLoading && !indError && indAnswers && (
                <IndicatorsDetail items={indAnswers.respuestas} />
              )}
              {!indLoading && !indError && !indAnswers && (
                <CategoryDetail questions={categoryQuestions.indicators} />
              )}
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  );
}
