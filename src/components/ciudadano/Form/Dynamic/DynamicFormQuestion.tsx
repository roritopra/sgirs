import { YesNoQuestion } from "../QuestionTypes/YesNoQuestion";
import { SelectQuestion } from "../QuestionTypes/SelectQuestion";
import { TextQuestion } from "../QuestionTypes/TextQuestion";
import { OptionsQuestion } from "../QuestionTypes/OptionsQuestion";
import { FileUploadQuestion } from "../QuestionTypes/FileUploadQuestion";
import { FileAttachment } from "../FormContext";

// Tipos de preguntas según la base de datos
export type QuestionType = "S/No" | "Lista desplegable" | "Texto" | "Opciones" | "Anexar";

// Estructura de una opción para preguntas de selección
export interface Option {
  key: string;
  label: string;
}

// Estructura de una pregunta dinámica
export interface DynamicQuestion {
  id: string;
  questionNumber: string;
  text: string;
  type: QuestionType;
  tooltip?: string;
  options?: Option[];
  allowAttachment?: boolean;
  optionRequiresAttachment?: Record<string, boolean>;
  required?: boolean;
  conditionalQuestions?: DynamicQuestion[];
  conditionalTriggerValue?: boolean | string | string[];
}

// Función para validar si una pregunta está completa
export const isQuestionComplete = (question: DynamicQuestion, value: any, attachment?: any): boolean => {
  switch (question.type) {
    case "S/No":
      return value !== null && value !== undefined;
    
    case "Lista desplegable":
      return value !== null && value !== undefined && value !== "";
    
    case "Texto":
      if (question.required) {
        return value !== null && value !== undefined && value.trim() !== "";
      }
      return true; // Opcional
    
    case "Opciones":
      if (question.required) {
        return Array.isArray(value) && value.length > 0;
      }
      return true; // Opcional
    
    case "Anexar":
      // Las preguntas de tipo "Anexar" siempre requieren archivo
      return attachment !== null && attachment !== undefined;
    
    default:
      return true;
  }
};

interface DynamicFormQuestionProps {
  question: DynamicQuestion;
  value: any;
  onChange: (id: string, value: any) => void;
  attachmentFile?: FileAttachment;
  onAttachmentChange?: (id: string, file: FileAttachment | undefined) => void;
}

export const DynamicFormQuestion = ({
  question,
  value,
  onChange,
  attachmentFile,
  onAttachmentChange
}: DynamicFormQuestionProps) => {
  const questionText = `${question.questionNumber}. ${question.text}`;
  
  switch (question.type) {
    case "S/No":
      return (
        <YesNoQuestion
          id={question.id}
          question={questionText}
          value={value as boolean | null}
          onChange={(val) => onChange(question.id, val)}
          tooltip={question.tooltip}
          allowAttachment={question.allowAttachment && !!onAttachmentChange}
          attachmentFile={attachmentFile}
          onAttachmentChange={
            onAttachmentChange ? (file) => onAttachmentChange(question.id, file) : undefined
          }
        />
      );
      
    case "Lista desplegable":
      if (!question.options || question.options.length === 0) {
        console.error(`No options provided for select question: ${question.id}`);
        return null;
      }
      
      return (
        <SelectQuestion
          id={question.id}
          question={questionText}
          options={question.options}
          value={value as string | null}
          onChange={(val) => onChange(question.id, val)}
          tooltip={question.tooltip}
          required={question.required}
        />
      );
      
    case "Texto":
      return (
        <TextQuestion
          id={question.id}
          question={questionText}
          value={value as string | null}
          onChange={(val) => onChange(question.id, val)}
          tooltip={question.tooltip}
          required={question.required}
        />
      );
      
    case "Opciones":
      if (!question.options || question.options.length === 0) {
        console.error(`No options provided for checkbox question: ${question.id}`);
        return null;
      }
      
      return (
        <OptionsQuestion
          id={question.id}
          question={questionText}
          options={question.options}
          value={value as string[] || []}
          onChange={(val) => onChange(question.id, val)}
          tooltip={question.tooltip}
          required={question.required}
        />
      );
      
    case "Anexar":
      if (!onAttachmentChange) {
        console.error(`No attachment handler provided for file upload question: ${question.id}`);
        return null;
      }
      
      return (
        <FileUploadQuestion
          id={question.id}
          question={questionText}
          file={attachmentFile}
          onFileChange={(file) => onAttachmentChange(question.id, file)}
          tooltip={question.tooltip}
          required={true} // Las preguntas tipo "Anexar" siempre son requeridas
        />
      );
      
    default:
      console.error(`Unknown question type: ${question.type}`);
      return null;
  }
};
