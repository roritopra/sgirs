import { cn } from "@heroui/react";

interface StepperProgressProps {
  currentStep: number;
  totalSteps: number;
  formSubmitted: boolean;
  visitedSteps: Set<number>;
  isStepComplete: (step: number) => boolean;
  onStepClick?: (step: number) => void;
}

export function StepperProgress({ 
  currentStep, 
  totalSteps, 
  formSubmitted,
  visitedSteps,
  isStepComplete,
  onStepClick 
}: StepperProgressProps) {
  const progressPercentage = formSubmitted ? 100 : Math.round((currentStep / totalSteps) * 100);

  const handleStepClick = (step: number) => {
    if (onStepClick && !formSubmitted) {
      onStepClick(step);
    }
  };

  return (
    <div className="p-4 px-6" role="navigation" aria-label="Navegación de pasos del formulario">
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm font-medium text-gray-700">
          {formSubmitted ? (
            <span id="progress-step">Formulario completado</span>
          ) : (
            <span id="progress-step">
              Paso {currentStep} de {totalSteps}
            </span>
          )}
        </div>
        <div id="progress-percent" className="text-sm font-medium text-primary">
          {progressPercentage}% completado
        </div>
      </div>

      {/* Navegación por pasos con líneas */}
      <div className="flex items-center gap-1.5" role="list">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCurrent = stepNumber === currentStep;
          const isVisited = visitedSteps.has(stepNumber);
          const stepComplete = isStepComplete(stepNumber);
          const isClickable = !formSubmitted && onStepClick;

          // Determinar estado del paso
          let stepState: "current" | "completed" | "incomplete" | "pending";
          if (isCurrent) {
            stepState = "current";
          } else if (isVisited && stepComplete) {
            stepState = "completed";
          } else if (isVisited && !stepComplete) {
            stepState = "incomplete";
          } else {
            stepState = "pending";
          }

          return (
            <button
              key={stepNumber}
              type="button"
              onClick={() => handleStepClick(stepNumber)}
              disabled={formSubmitted || !onStepClick}
              className={cn(
                "flex-1 h-2 rounded-full transition-all duration-300 relative group",
                {
                  // Paso actual - verde con borde
                  "bg-success ring-2 ring-success ring-offset-2 h-2.5": stepState === "current",
                  // Paso completado - azul/primario
                  "bg-primary hover:bg-primary-600": stepState === "completed",
                  // Paso visitado pero incompleto - warning (amarillo/naranja)
                  "bg-warning hover:bg-warning-600": stepState === "incomplete",
                  // Paso pendiente (no visitado) - gris claro
                  "bg-gray-200 hover:bg-gray-300": stepState === "pending",
                  // Cursor pointer si es clickeable
                  "cursor-pointer": isClickable,
                  "cursor-not-allowed opacity-50": formSubmitted,
                }
              )}
              aria-label={`${
                stepState === "current"
                  ? "Paso actual"
                  : stepState === "completed"
                  ? "Paso completado"
                  : stepState === "incomplete"
                  ? "Paso incompleto"
                  : "Paso pendiente"
              }: ${stepNumber} de ${totalSteps}`}
              aria-current={isCurrent ? "step" : undefined}
              role="listitem"
            >
              {/* Tooltip al hacer hover */}
              {isClickable && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  Paso {stepNumber}
                  {stepState === "current" && " (actual)"}
                  {stepState === "completed" && " ✓"}
                  {stepState === "incomplete" && " ⚠"}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="flex items-center justify-center gap-3 mt-3 text-xs text-gray-600 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-2 bg-primary rounded-full"></div>
          <span>Completo</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-2.5 bg-success rounded-full ring-2 ring-success ring-offset-1"></div>
          <span>Actual</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-2 bg-warning rounded-full"></div>
          <span>Incompleto</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-2 bg-gray-200 rounded-full"></div>
          <span>Pendiente</span>
        </div>
      </div>
    </div>
  );
}
