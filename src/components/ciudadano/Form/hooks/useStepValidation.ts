/**
 * Hook para validación de steps del formulario
 */

import { useState, useEffect, useMemo } from "react";
import { useFormContext } from "../FormContext";
import { getPreguntaPorNumero } from "@/services/ciudadano/FormService/questions.service";
import { STEP_QUESTION_NUMBERS } from "../stepper.constants";
import type { ValidationCache, StepNumber } from "../stepper.types";
import { getMonthsForPeriod } from "../stepper.utils";

export function useStepValidation(
  currentStep: StepNumber,
  periodo: string | null,
  requiredIndicators: any[],
  indicatorsLoading: boolean
) {
  const { state } = useFormContext();
  const [attachmentValidationCache, setAttachmentValidationCache] = useState<ValidationCache>({});

  /**
   * Valida archivos obligatorios dinámicamente para un step
   */
  const validateRequiredAttachments = async (stepNumber: number): Promise<boolean> => {
    try {
      const questionNumbers = STEP_QUESTION_NUMBERS[stepNumber as StepNumber] || [];

      // Guardas de aplicabilidad por step
      if (
        stepNumber === 8 &&
        (state.generaAprovechables !== true || state.recoleccionAprovechables !== true)
      ) {
        return true;
      }

      // Consultar metadatos de preguntas para este step
      const questionPromises = questionNumbers.map((num) =>
        getPreguntaPorNumero(num).catch(() => null)
      );
      const questions = await Promise.all(questionPromises);

      // Validar cada pregunta que requiere anexo
      for (const question of questions) {
        if (!question) continue;

        const questionId = question.id;
        const answer = state.dynamicAnswers?.[questionId];

        // Para preguntas tipo "Anexar" (solo archivo), siempre requieren archivo
        if (question.id_tipo_pregunta) {
          const { getTiposPregunta } = await import("@/services/ciudadano/FormService/questions.service");
          const tipos = await getTiposPregunta();
          const tipo = tipos.find((t: any) => t.id === question.id_tipo_pregunta);

          if (tipo?.tipo_pregunta === "Anexar") {
            const hasAttachment = !!state.dynamicAttachments?.[questionId];
            if (!hasAttachment) {
              console.log(
                `Falta archivo para pregunta tipo Anexar ${question.num_pregunta} (${questionId})`
              );
              return false;
            }
            continue;
          }
        }

        // Para preguntas con anexo condicional (anexo: true)
        if (question.anexo) {
          if (answer === true) {
            const hasAttachment = !!state.dynamicAttachments?.[questionId];
            if (!hasAttachment) {
              console.log(
                `Falta archivo para pregunta ${question.num_pregunta} (${questionId})`
              );
              return false;
            }
          }
        }
      }

      return true;
    } catch (error) {
      console.error("Error validating attachments:", error);
      return true; // En caso de error, no bloquear navegación
    }
  };

  // Efecto para validar archivos cuando cambia el step o las respuestas
  useEffect(() => {
    const validateAttachments = async () => {
      const isValid = await validateRequiredAttachments(currentStep);
      setAttachmentValidationCache((prev) => ({
        ...prev,
        [currentStep]: isValid,
      }));
    };

    validateAttachments();
  }, [currentStep, state.dynamicAnswers, state.dynamicAttachments]);

  /**
   * Verifica si el step actual está completo
   */
  const isCurrentStepComplete = (): boolean => {
    try {
      // Validar archivos obligatorios usando cache
      const attachmentValidation = attachmentValidationCache[currentStep];
      if (attachmentValidation === false) return false;

      switch (currentStep) {
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
            if (
              state.gestorOrganicos === "gestor9" &&
              state.otroGestorOrganicos === ""
            )
              return false;
            if (state.frecuenciaOrganicos === "") return false;
          }
          if (state.aprovechamientoInSitu === null) return false;
          return true;
        case 7:
          if (state.generaAprovechables === null) return false;
          if (state.generaAprovechables === false) return true;

          return (
            state.tiposAprovechables.length > 0 &&
            state.recoleccionAprovechables !== null
          );
        case 8:
          if (
            state.generaAprovechables !== true ||
            state.recoleccionAprovechables !== true
          )
            return true;

          if (state.esORO === null) return false;
          if (state.esORO === true && state.organizacionRecicladores === "")
            return false;
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
          if (state.recoleccionRAEE === true && state.gestorRAEE === "")
            return false;
          return true;
        case 11:
          if (state.generaRCD === null) return false;
          if (state.generaRCD === false) return true;

          if (state.recoleccionRCD === null) return false;
          if (state.recoleccionRCD === true && state.gestorRCD === "")
            return false;
          return true;
        case 12:
          if (state.generaRESPEL === null) return false;
          if (state.generaRESPEL === true) {
            if (state.tiposRESPEL.length === 0) return false;
            if (state.recoleccionRESPEL === null) return false;
            if (state.recoleccionRESPEL === true && state.gestorRESPEL === "")
              return false;
          }

          if (state.generaVoluminosos === null) return false;
          if (state.generaVoluminosos === true) {
            if (state.tiposVoluminosos.length === 0) return false;
            if (state.conoceLineasVoluminosos === null) return false;
          }

          return state.programaComunicacion !== null;
        case 13:
          // Validar solo los indicadores dinámicos que aparecen
          if (indicatorsLoading) return false;

          const mesesToRender = getMonthsForPeriod(periodo);

          if (!requiredIndicators || requiredIndicators.length === 0) {
            return true; // no hay indicadores habilitados
          }

          for (const indicator of requiredIndicators as any[]) {
            if (indicator.es_uar) {
              const allAnswered = !Object.values(state.indicadores.indicador4.condiciones).some(
                (v) => v === null
              );
              if (!allAnswered) return false;
              continue;
            }

            const num = indicator.num_indicador as number;
            const key = `indicador${num}` as keyof typeof state.indicadores;
            const varsCount = Math.max(1, (indicator.variables || []).length);
            const group: any = (state.indicadores as any)[key];
            if (!group || !group.meses) return false;
            for (const mes of mesesToRender) {
              const mesData = group.meses[mes];
              if (!mesData) return false;
              const fields = Object.keys(mesData);
              for (let i = 0; i < Math.min(varsCount, fields.length); i++) {
                const val = (mesData as any)[fields[i]];
                if (val === "" || val === null || typeof val === "undefined") {
                  return false;
                }
              }
            }
          }
          return true;
        default:
          return false;
      }
    } catch (error) {
      console.error("Error validating step:", error);
      return false;
    }
  };

  /**
   * Verifica si hay al menos una respuesta seleccionada
   */
  const hasAnyAnswerSelected = useMemo(() => {
    const answers = state.dynamicAnswers || {};
    for (const val of Object.values(answers)) {
      if (Array.isArray(val)) {
        if (val.length > 0) return true;
      } else if (typeof val === "boolean") {
        return true;
      } else if (val !== null && val !== undefined && String(val).trim() !== "") {
        return true;
      }
    }
    return false;
  }, [state.dynamicAnswers]);

  return {
    isCurrentStepComplete,
    hasAnyAnswerSelected,
    attachmentValidationCache,
  };
}
