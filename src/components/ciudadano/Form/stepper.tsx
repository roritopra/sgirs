import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { addToast } from "@heroui/toast";
import { useFormContext } from "./FormContext";
import { useAuth } from "@/hooks/useAuth";
import { useActivePeriod } from "@/hooks/useActivePeriod";
import {
  Step1Documentation,
  Step2Organization,
  Step3Characterization,
  Step4Separation,
  Step5Collection,
  Step6Organic,
  Step7Recyclable,
  Step8RecyclableManagers,
  Step9UsedOil,
  Step10Electronics,
  Step11Construction,
  Step12HazardousAndBulky,
  Step13Indicators,
} from "./Steps";
import { FormSummary } from "./FormSummary";
import { CitizenFormSkeleton } from "@/components/skeletons/CitizenFormSkeleton";

// Hooks personalizados
import { useStepValidation } from "./hooks/useStepValidation";
import { useRequiredIndicators } from "./hooks/useRequiredIndicators";
import { usePrefillIndicators } from "./hooks/usePrefillIndicators";
import { usePrefillAnswers } from "./hooks/usePrefillAnswers";

// Componentes UI
import { StepperProgress } from "./components/StepperProgress";
import { StepperNavigation } from "./components/StepperNavigation";
import { StepperAlerts } from "./components/StepperAlerts";

// Servicios
import {
  verifyFormForPeriod,
  createForm,
  patchFormAnswers,
  completeForm,
  uploadAnswerFiles,
} from "@/services/ciudadano/FormService/forms.service";
import { getOpcionesRespuesta, getPreguntaPorNumero } from "@/services/ciudadano/FormService/questions.service";
import {
  obtenerIndicadoresPorRespuestas,
  submitIndicators,
  submitIndicatorsPartial,
} from "@/services/ciudadano/FormService/indicators.service";

// Utilidades y constantes
import { buildAnswersPayload, buildIndicatorsPayload, uploadFilesForPeriod } from "./services/formSubmission.service";
import { buildOpcionesByPreguntaMap, getMonthsForPeriod } from "./stepper.utils";
import { STEP_TITLES, INDICATOR_QUESTION_NUMBERS, INDICATOR_FIELD_MAPPING } from "./stepper.constants";
import type { StepNumber } from "./stepper.types";
import type { CompleteAnswer, CompleteFormRequest } from "@/types/ciudadano/form.types";

export const Stepper = () => {
  const {
    currentStep,
    setCurrentStep,
    totalSteps,
    state,
    formSubmitted,
    submitForm,
    updateForm,
  } = useFormContext();

  const { id: usuarioId } = useAuth();
  const { id: periodId, periodo } = useActivePeriod();
  const router = useRouter();

  // Estados locales
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [isPrefilling, setIsPrefilling] = useState(false);
  const [indicatorsPrefilled, setIndicatorsPrefilled] = useState(false);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [showConfirmFinalize, setShowConfirmFinalize] = useState(false);
  const [autoJumpDone, setAutoJumpDone] = useState(false);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([1]));
  const [completedStepsChecked, setCompletedStepsChecked] = useState(false);

  // Hooks personalizados
  const { requiredIndicators, indicatorsLoading } = useRequiredIndicators(currentStep as StepNumber);

  const { isCurrentStepComplete, hasAnyAnswerSelected } = useStepValidation(
    currentStep as StepNumber,
    periodo ?? null,
    requiredIndicators,
    indicatorsLoading
  );

  // Función para verificar si un step específico está completo
  const isStepComplete = (step: number): boolean => {
    try {
      switch (step) {
        case 1:
          return state.manualSGIRS !== null;
        case 2:
          return state.esquemaOrganizacional !== null;
        case 3:
          return state.caracterizacionResiduos !== null;
        case 4:
          return (
            state.separacionFuente !== null &&
            state.mobiliarioSeparacion !== null &&
            state.planoRutas !== null &&
            state.unidadAlmacenamiento !== null
          );
        case 5:
          return (
            state.empresaAseo !== "" &&
            state.frecuenciaRecoleccion !== "" &&
            state.aforoResiduos !== null
          );
        case 6:
          if (state.generaOrganicos === null) return false;
          if (state.generaOrganicos === false) return true;
          if (state.recoleccionOrganicos === null) return false;
          if (state.recoleccionOrganicos === true) {
            if (state.gestorOrganicos === "") return false;
            if (state.gestorOrganicos === "gestor9" && state.otroGestorOrganicos === "") return false;
            if (state.frecuenciaOrganicos === "") return false;
          }
          if (state.aprovechamientoInSitu === null) return false;
          return true;
        case 7:
          if (state.generaAprovechables === null) return false;
          if (state.generaAprovechables === false) return true;
          return state.tiposAprovechables.length > 0 && state.recoleccionAprovechables !== null;
        case 8:
          if (state.generaAprovechables !== true || state.recoleccionAprovechables !== true) return true;
          if (state.esORO === null) return false;
          if (state.esORO === true && state.organizacionRecicladores === "") return false;
          if (state.esORO === false && state.gestorNoORO === "") return false;
          return state.frecuenciaAprovechables !== "";
        case 9:
          if (state.generaACU === null) return false;
          if (state.generaACU === false) return true;
          if (state.recoleccionACU === null) return false;
          if (state.recoleccionACU === true) {
            return state.gestorACU !== "" && state.frecuenciaACU !== "";
          }
          return true;
        case 10:
          if (state.generaRAEE === null) return false;
          if (state.generaRAEE === false) return true;
          if (state.tiposRAEE.length === 0) return false;
          if (state.recoleccionRAEE === null) return false;
          if (state.recoleccionRAEE === true && state.gestorRAEE === "") return false;
          return true;
        case 11:
          if (state.generaRCD === null) return false;
          if (state.generaRCD === false) return true;
          if (state.recoleccionRCD === null) return false;
          if (state.recoleccionRCD === true && state.gestorRCD === "") return false;
          return true;
        case 12:
          if (state.generaRESPEL === null) return false;
          if (state.generaRESPEL === true) {
            if (state.tiposRESPEL.length === 0) return false;
            if (state.recoleccionRESPEL === null) return false;
            if (state.recoleccionRESPEL === true && state.gestorRESPEL === "") return false;
          }
          if (state.generaVoluminosos === null) return false;
          if (state.generaVoluminosos === true) {
            if (state.tiposVoluminosos.length === 0) return false;
            if (state.conoceLineasVoluminosos === null) return false;
          }
          return state.programaComunicacion !== null;
        case 13:
          return isCurrentStepComplete();
        default:
          return false;
      }
    } catch (error) {
      console.error("Error validating step:", error);
      return false;
    }
  };

  // Prefill de respuestas
  usePrefillAnswers(periodId ?? null, setIsPrefilling, autoJumpDone, setAutoJumpDone, setCurrentStep, currentStep);

  // Prefill de indicadores
  usePrefillIndicators(currentStep as StepNumber, periodId ?? null, indicatorsPrefilled, setIndicatorsPrefilled);

  // Resetear banderas al cambiar periodo
  useEffect(() => {
    setIndicatorsPrefilled(false);
    setAutoJumpDone(false);
    setCompletedStepsChecked(false);
    setVisitedSteps(new Set([1]));
  }, [periodId]);

  // Trackear pasos visitados
  useEffect(() => {
    setVisitedSteps((prev) => new Set(prev).add(currentStep));
  }, [currentStep]);

  // Actualizar visitedSteps después del prefill basándose en completitud
  useEffect(() => {
    if (!isPrefilling && !completedStepsChecked && Object.keys(state.dynamicAnswers || {}).length > 0) {
      const completedSteps = new Set<number>();
      
      // Verificar qué pasos están completos
      for (let step = 1; step <= totalSteps; step++) {
        if (isStepComplete(step)) {
          completedSteps.add(step);
        }
      }

      // Actualizar visitedSteps con los pasos completos
      if (completedSteps.size > 0) {
        setVisitedSteps((prev) => {
          const updated = new Set(prev);
          completedSteps.forEach((step) => updated.add(step));
          return updated;
        });
      }

      // Marcar que ya se revisaron los pasos completos
      setCompletedStepsChecked(true);
    }
  }, [isPrefilling, completedStepsChecked, totalSteps]);

  /**
   * Handler: Guardar borrador del formulario
   */
  const handleSaveForLater = async () => {
    try {
      const answers = state.dynamicAnswers || {};
      const entries = Object.entries(answers);
      if (!periodId) {
        console.error("[Guardar más tarde] No hay periodo activo disponible");
        return;
      }

      setIsSaving(true);

      const opcionesResp = await getOpcionesRespuesta(1, 1000);
      const opcionesByPregunta = buildOpcionesByPreguntaMap(opcionesResp.data);

      const build = buildAnswersPayload(answers, opcionesByPregunta, periodId, usuarioId, false);
      // Forzar campos requeridos por CreateOrPatchAnswer
      const nowIso = new Date().toISOString();
      const respuestasDraft = build.map(({ tipo_pregunta, fecha_respuesta, status, ...r }) => ({
        ...r,
        fecha_respuesta: fecha_respuesta ?? nowIso,
        status: status ?? "no completado",
      }));

      let savedQuestions = false;
      let savedIndicators = false;

      const verification = await verifyFormForPeriod(periodId);
      const exists = Array.isArray(verification) && verification.length > 0;

      if (respuestasDraft.length > 0) {
        if (!exists) {
          const body = {
            usuario_id: usuarioId,
            encuesta_id: periodId,
            status: "no completado",
            respuestas: respuestasDraft,
          };
          console.log("[POST encuesta-estado] body:", body);
          await createForm(body);
        } else {
          console.log("[PATCH encuesta-estado] body:", respuestasDraft);
          await patchFormAnswers(usuarioId, periodId, respuestasDraft);
        }
        savedQuestions = true;
      }

      // Guardar indicadores parciales si estamos en Step 13
      try {
        if (currentStep === 13) {
          const [opcionesResponse, ...preguntas] = await Promise.all([
            getOpcionesRespuesta(),
            ...INDICATOR_QUESTION_NUMBERS.map((n) => getPreguntaPorNumero(n)),
          ]);

          const preguntasData = preguntas as any[];
          const opciones = opcionesResponse.data as any[];

          const getYesOptionIdForPregunta = (preguntaId: string) => {
            const opts = opciones.filter((o: any) => o.id_pregunta === preguntaId);
            const yes = opts.find((o: any) => {
              const t = String(o.opcion_respuesta || "").toLowerCase();
              return t.includes("sí") || t.includes("si") || t === "true";
            });
            return yes?.id || null;
          };

          const respuestasIndicadores: Array<{ id_pregunta: string; id_opcion_respuesta: string }> = [];
          preguntasData.forEach((preg, idx) => {
            const num = INDICATOR_QUESTION_NUMBERS[idx];
            const field = INDICATOR_FIELD_MAPPING[num];
            const val = state[field] as any;
            if (val === true) {
              const yesId = getYesOptionIdForPregunta(preg.id);
              if (yesId) {
                respuestasIndicadores.push({ id_pregunta: preg.id, id_opcion_respuesta: yesId });
              }
            }
          });

          if (respuestasIndicadores.length > 0) {
            const dynamicIndicators = await obtenerIndicadoresPorRespuestas({ respuestas: respuestasIndicadores });
            if (dynamicIndicators && dynamicIndicators.length > 0) {
              const payload = await buildIndicatorsPayload(state, dynamicIndicators, periodId, periodo ?? null, true);
              if (payload.respuestas.length > 0) {
                console.log("[POST indicadores parciales] body:", payload);
                await submitIndicatorsPartial(payload as any);
                savedIndicators = true;
              }
            }
          }
        }
      } catch (err) {
        console.error("[Guardar más tarde] Error al enviar indicadores parciales:", err);
      }

      // Subir archivos
      await uploadFilesForPeriod(periodId, state.dynamicAttachments || {}, uploadAnswerFiles);

      if (savedQuestions || savedIndicators) {
        addToast({
          title: "Guardado",
          description:
            savedQuestions && savedIndicators
              ? "Se guardaron las preguntas e indicadores."
              : savedQuestions
              ? "Se guardaron exitosamente las preguntas."
              : "Se guardaron exitosamente los indicadores.",
          color: "success",
        });
        setShowSaved(true);
      } else {
        addToast({
          title: "Sin cambios",
          description: "No hay respuestas ni indicadores para guardar.",
          color: "warning",
        });
      }
    } catch (error) {
      console.error("[Guardar más tarde] Error al guardar borrador del paso:", error);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handler: Finalizar y enviar formulario
   */
  const handleFinalize = async () => {
    try {
      // Validar TODOS los pasos antes de finalizar
      const incompleteSteps: number[] = [];
      for (let step = 1; step <= totalSteps; step++) {
        if (!isStepComplete(step)) {
          incompleteSteps.push(step);
        }
      }

      if (incompleteSteps.length > 0) {
        const stepsList = incompleteSteps.join(", ");
        addToast({
          title: "Formulario incompleto",
          description: `Debes completar todas las preguntas de los pasos: ${stepsList}`,
          color: "warning",
        });
        // Navegar al primer paso incompleto
        setCurrentStep(incompleteSteps[0]);
        window.scrollTo(0, 0);
        return;
      }
      if (!periodId) return;
      if (!usuarioId) {
        addToast({
          title: "Sesión requerida",
          description: "No se encontró el usuario autenticado. Inicia sesión e inténtalo de nuevo.",
          color: "warning",
        });
        return;
      }

      const answers = state.dynamicAnswers || {};
      const entries = Object.entries(answers);
      if (entries.length === 0) return;

      setIsSaving(true);

      const opcionesResp = await getOpcionesRespuesta(1, 1000);
      const opcionesByPregunta = buildOpcionesByPreguntaMap(opcionesResp.data);

      const respuestasRaw = buildAnswersPayload(answers, opcionesByPregunta, periodId, usuarioId, true);

      if (respuestasRaw.length === 0) return;

      const respuestas: CompleteAnswer[] = respuestasRaw.map(({ id_pregunta, id_opcion_respuesta, id_periodo_encuesta }) => ({
        id_pregunta,
        id_opcion_respuesta,
        id_periodo_encuesta,
        id_usuario: usuarioId,
      }));

      const body: CompleteFormRequest = { usuario_id: usuarioId, encuesta_id: periodId, respuestas };
      console.log("[Finalizar] Enviando completar con", respuestas.length, "respuestas. Body:", body);
      await completeForm(body);

      // Enviar indicadores
      console.log("[Finalizar] Completar OK. Enviando indicadores (si aplica)...");
      try {
        const [opcionesResponse, ...preguntas] = await Promise.all([
          getOpcionesRespuesta(),
          ...INDICATOR_QUESTION_NUMBERS.map((n) => getPreguntaPorNumero(n)),
        ]);

        const preguntasData = preguntas as any[];
        const opciones = opcionesResponse.data as any[];

        const getYesOptionIdForPregunta = (preguntaId: string) => {
          const opts = opciones.filter((o: any) => o.id_pregunta === preguntaId);
          const yes = opts.find((o: any) => {
            const t = String(o.opcion_respuesta || "").toLowerCase();
            return t.includes("sí") || t.includes("si") || t === "true";
          });
          return yes?.id || null;
        };

        const respuestasIndicadores: Array<{ id_pregunta: string; id_opcion_respuesta: string }> = [];
        preguntasData.forEach((preg, idx) => {
          const num = INDICATOR_QUESTION_NUMBERS[idx];
          const field = INDICATOR_FIELD_MAPPING[num];
          const val = state[field] as any;
          if (val === true) {
            const yesId = getYesOptionIdForPregunta(preg.id);
            if (yesId) {
              respuestasIndicadores.push({ id_pregunta: preg.id, id_opcion_respuesta: yesId });
            }
          }
        });

        if (respuestasIndicadores.length > 0) {
          const dynamicIndicators = await obtenerIndicadoresPorRespuestas({ respuestas: respuestasIndicadores });
          if (dynamicIndicators && dynamicIndicators.length > 0) {
            const payload = await buildIndicatorsPayload(state, dynamicIndicators, periodId, periodo ?? null, false);
            console.log("[POST indicadores] body:", payload);
            await submitIndicators(payload as any);
            addToast({
              title: "Indicadores enviados",
              description: "Los indicadores del periodo se enviaron correctamente.",
              color: "success",
            });
          }
        }
      } catch (err) {
        addToast({
          title: "Error al enviar indicadores",
          description: "No se pudieron enviar los indicadores. Inténtalo de nuevo.",
          color: "danger",
        });
        throw err;
      }

      // Subir archivos diferido
      console.log("[Finalizar] Indicadores enviados. Programando subida de archivos en 1500ms...");
      setTimeout(async () => {
        try {
          console.log("[Finalizar] Subiendo archivos (diferido)...");
          await uploadFilesForPeriod(periodId, state.dynamicAttachments || {}, uploadAnswerFiles);
          console.log("[Finalizar] Subida de archivos (diferida) completada.");
        } catch (err) {
          console.error("[Finalizar] Error en subida diferida de archivos:", err);
        }
      }, 1500);

      addToast({
        title: "Formulario finalizado",
        description: "Tus respuestas han sido enviadas correctamente.",
        color: "success",
      });
      submitForm();
    } catch (e) {
      console.error("Error al completar el formulario:", e);
      addToast({
        title: "Error al finalizar",
        description: "Ocurrió un error al finalizar el formulario.",
        color: "danger",
      });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Navegación: Siguiente paso (sin validación)
   */
  const handleNext = () => {
    try {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
      }
    } catch (error) {
      console.error("Error navigating to next step:", error);
    }
  };

  /**
   * Navegación: Paso anterior
   */
  const handlePrevious = () => {
    try {
      if (currentStep > 1) {
        setCurrentStep(currentStep - 1);
        window.scrollTo(0, 0);
      }
    } catch (error) {
      console.error("Error navigating to previous step:", error);
    }
  };

  /**
   * Handler: Redirigir después de guardar
   */
  const handleOnConfirmSaved = () => {
    router.push("/ciudadano");
  };

  /**
   * Renderiza el contenido del step actual
   */
  const renderStepContent = () => {
    try {
      switch (currentStep) {
        case 1:
          return <Step1Documentation />;
        case 2:
          return <Step2Organization />;
        case 3:
          return <Step3Characterization />;
        case 4:
          return <Step4Separation />;
        case 5:
          return <Step5Collection />;
        case 6:
          return <Step6Organic />;
        case 7:
          return <Step7Recyclable />;
        case 8:
          return <Step8RecyclableManagers />;
        case 9:
          return <Step9UsedOil />;
        case 10:
          return <Step10Electronics />;
        case 11:
          return <Step11Construction />;
        case 12:
          return <Step12HazardousAndBulky />;
        case 13:
          return <Step13Indicators />;
        default:
          return <div>Paso no encontrado</div>;
      }
    } catch (error) {
      console.error("Error rendering step content:", error);
      return (
        <div className="p-4 text-danger">
          Error al cargar este paso. Por favor intente nuevamente.
        </div>
      );
    }
  };

  /**
   * Renderiza el contenido principal (formulario o resumen)
   */
  const renderContent = () => {
    if (formSubmitted) {
      return <FormSummary />;
    }

    if (isPrefilling) {
      return <CitizenFormSkeleton />;
    }

    return (
      <>
        <h3 id="step-title" className="font-semibold text-gray-900 mb-6 lg:text-xl">
          {STEP_TITLES[currentStep as StepNumber]}
        </h3>

        {renderStepContent()}

        <StepperNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          isSaving={isSaving}
          hasAnyAnswerSelected={hasAnyAnswerSelected}
          isCurrentStepComplete={true}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSave={() => setShowConfirmSave(true)}
          onFinalize={() => setShowConfirmFinalize(true)}
          isAllStepsComplete={Array.from({ length: totalSteps }, (_, i) => i + 1).every((step) => isStepComplete(step))}
        />

        <StepperAlerts
          showSaved={showSaved}
          showConfirmSave={showConfirmSave}
          showConfirmFinalize={showConfirmFinalize}
          onCloseSaved={() => setShowSaved(false)}
          onCloseConfirmSave={() => setShowConfirmSave(false)}
          onCloseConfirmFinalize={() => setShowConfirmFinalize(false)}
          onConfirmSave={handleSaveForLater}
          onConfirmFinalize={handleFinalize}
          onConfirmSaved={handleOnConfirmSaved}
        />
      </>
    );
  };

  return (
    <section className="rounded-2xl shadow-form-card" role="region" aria-labelledby="form-heading">
      <header className="relative flex items-center bg-[#e7f1dc] gap-3 mb-2 p-4 rounded-t-2xl">
        <Image
          className="absolute right-0 hidden md:block"
          src="/bg_citizen_form.webp"
          alt="Imagen gatos Cali"
          width={455}
          height={455}
        />
        <Image src="/form_icon.webp" alt="Icono de formulario" width={44} height={44} />
        <div>
          <h2 id="form-heading" className="text-lg font-medium text-gray-800">
            Cuestionario SGIRS
          </h2>
          <p className="text-sm text-gray-600">Complete todas las secciones para generar su diagnóstico</p>
        </div>
      </header>

      <StepperProgress 
        currentStep={currentStep} 
        totalSteps={totalSteps} 
        formSubmitted={formSubmitted}
        visitedSteps={visitedSteps}
        isStepComplete={isStepComplete}
        onStepClick={(step) => {
          setCurrentStep(step);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <div className="bg-white rounded-lg mt-4 p-6" role="region" aria-labelledby="step-title">
        {renderContent()}
      </div>
    </section>
  );
};
