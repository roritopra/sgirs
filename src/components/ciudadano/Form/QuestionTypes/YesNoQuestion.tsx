import { type ReactNode } from "react";
import { Radio, RadioGroup } from "@heroui/react";
import { QuestionTooltip } from "../QuestionTooltip";
import { FileUpload } from "../FileUpload";
import { FileAttachment } from "../FormContext";

interface YesNoQuestionProps {
  id: string;
  question: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
  tooltip?: string;
  allowAttachment?: boolean;
  attachmentFile?: FileAttachment;
  onAttachmentChange?: (file: FileAttachment | undefined) => void;
  conditionalContent?: ReactNode;
  showConditionalContent?: boolean;
}

export const YesNoQuestion = ({
  id,
  question,
  value,
  onChange,
  tooltip,
  allowAttachment = false,
  attachmentFile,
  onAttachmentChange,
  conditionalContent,
  showConditionalContent = false,
}: YesNoQuestionProps) => {
  const helpTextId = `${id}-help`;
  const attachmentId = `${id}-attachment`;
  
  // Texto dinámico para adjuntos según número de pregunta
  const questionNumberMatch = question.match(/^(\d+)/);
  const questionNumber = questionNumberMatch ? parseInt(questionNumberMatch[1], 10) : undefined;
  const attachmentText = (() => {
    switch (questionNumber) {
      case 1:
        return "Adjuntar manual de SGIRS del establecimiento (formato PDF).";
      case 2:
        return "Adjuntar organigrama con designación de roles y responsabilidades, con soporte de acta de conformación del comité (Formato PDF).";
      case 3:
        return "Adjuntar caracterización cualitativa no mayor a un año (Formato PDF).";
      case 16:
        return "Adjuntar registro fotográfico de la actividad in Situ (Formato PDF).";
      case 43:
        return "Adjuntar cronogramas de actividades, registros fotográficos o listados de asistencia de las actividades realizadas.";
      case 44:
        return "Agregar letrero de “Adjuntar tablas comparativas de acciones de mejora al periodo de reporte (formato PDF)”";
      default:
        return "Adjuntar certificados correspondientes al periodo de reporte (formato PDF)";
    }
  })();
  
  return (
    <fieldset className="mb-8">
      <legend className="sr-only">
        {question}
      </legend>
      <div className="flex items-start gap-2 mb-2">
        <div className="flex-1">
          <div 
            id={`${id}-label`}
            className="text-sm font-medium text-gray-900 md:text-base"
          >
            {question}
          </div>
        </div>
        {tooltip && <QuestionTooltip content={tooltip} />}
      </div>
      
      <div id={helpTextId} className="sr-only">
        Pregunta de sí o no. Seleccione una opción usando los botones de radio.
        {allowAttachment && ' Si selecciona "Sí", podrá adjuntar un archivo PDF.'}
        {tooltip && ` Información adicional: ${tooltip}`}
      </div>
      
      <RadioGroup
        id={id}
        orientation="horizontal"
        value={value === null ? undefined : value.toString()}
        onValueChange={(val) => onChange(val === "true")}
        aria-labelledby={`${id}-label`}
        aria-describedby={helpTextId}
      >
        <Radio value="true" aria-label="Sí">Sí</Radio>
        <Radio value="false" aria-label="No">No</Radio>
      </RadioGroup>
      
      {allowAttachment && value === true && onAttachmentChange && (
        <div className="mt-4" role="group" aria-labelledby={`${attachmentId}-label`}>
          <p 
            id={`${attachmentId}-label`}
            className="text-sm text-gray-600 mb-1"
          >
            {attachmentText}
          </p>
          <FileUpload 
            onFileSelect={onAttachmentChange}
            selectedFile={attachmentFile}
            id={attachmentId}
            ariaDescribedBy={`${attachmentId}-label`}
          />
        </div>
      )}
      
      {conditionalContent && showConditionalContent && (
        <div 
          className="mt-4"
          role="group"
          aria-label="Contenido condicional basado en la respuesta"
        >
          {conditionalContent}
        </div>
      )}
    </fieldset>
  );
};