import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

interface StepperNavigationProps {
  currentStep: number;
  totalSteps: number;
  isSaving: boolean;
  hasAnyAnswerSelected: boolean;
  isCurrentStepComplete: boolean;
  isAllStepsComplete?: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
  onFinalize: () => void;
}

export function StepperNavigation({
  currentStep,
  totalSteps,
  isSaving,
  hasAnyAnswerSelected,
  isCurrentStepComplete,
  isAllStepsComplete = false,
  onPrevious,
  onNext,
  onSave,
  onFinalize,
}: StepperNavigationProps) {
  const isLastStep = currentStep === totalSteps;

  return (
    <div
      className="mt-8 pt-4 border-t border-gray-100"
      role="navigation"
      aria-label="Navegación del formulario"
      aria-busy={isSaving}
    >
      <div className="flex items-center justify-between">
        <Button
          variant="flat"
          color="default"
          startContent={<Icon icon="lucide:arrow-left" />}
          onPress={onPrevious}
          isDisabled={currentStep === 1}
          aria-label="Ir al paso anterior"
        >
          Anterior
        </Button>

        <div className="flex items-center gap-2">
          <div className="sm:block hidden">
            <Button
              variant="flat"
              color="default"
              onPress={onSave}
              isDisabled={isSaving || !hasAnyAnswerSelected}
              startContent={<Icon icon="lucide:save" />}
              aria-label="Guardar progreso del formulario para continuar después"
            >
              {isSaving ? "Guardando..." : "Guardar para más tarde"}
            </Button>
          </div>

          {isLastStep ? (
            <Button
              color="primary"
              endContent={<Icon icon="lucide:check" />}
              onPress={onFinalize}
              isDisabled={isSaving || !isAllStepsComplete}
              aria-label="Finalizar y enviar el formulario"
            >
              Finalizar
            </Button>
          ) : (
            <Button
              color="primary"
              endContent={<Icon icon="lucide:arrow-right" />}
              onPress={onNext}
              isDisabled={false}
              aria-label="Ir al siguiente paso"
            >
              Siguiente
            </Button>
          )}
        </div>
      </div>

      <div className="sm:hidden block pt-4">
        <Button
          variant="flat"
          color="default"
          fullWidth
          onPress={onSave}
          isDisabled={isSaving || !hasAnyAnswerSelected}
          startContent={<Icon icon="lucide:save" />}
          aria-label="Guardar progreso del formulario para continuar después"
        >
          {isSaving ? "Guardando..." : "Guardar para más tarde"}
        </Button>
      </div>
    </div>
  );
}
