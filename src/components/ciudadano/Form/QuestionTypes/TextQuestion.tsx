import { Input, Textarea } from "@heroui/react";
import { QuestionTooltip } from "../QuestionTooltip";

interface TextQuestionProps {
  id: string;
  question: string;
  value: string | null;
  onChange: (value: string) => void;
  tooltip?: string;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
}

export const TextQuestion = ({
  id,
  question,
  value,
  onChange,
  tooltip,
  placeholder = "",
  className = "max-w-md",
  multiline = false,
  rows = 3,
  required = false,
}: TextQuestionProps) => {
  const helpTextId = `${id}-help`;
  
  return (
    <div className="mb-8" role="group" aria-labelledby={`${id}-label`}>
      <div className="flex items-start gap-2 mb-2">
        <div className="flex-1">
          <label 
            htmlFor={id} 
            id={`${id}-label`}
            className="text-sm font-medium text-gray-900 md:text-base"
          >
            {question}
            {required && <span className="text-red-500 ml-1" aria-label="requerido">*</span>}
          </label>
        </div>
        {tooltip && <QuestionTooltip content={tooltip} />}
      </div>
      
      <div id={helpTextId} className="sr-only">
        {required ? 'Campo requerido. ' : 'Campo opcional. '}
        {multiline ? 'Campo de texto multilínea. ' : 'Campo de texto de una línea. '}
        {placeholder && `Texto de ejemplo: ${placeholder}. `}
        {tooltip && `Información adicional: ${tooltip}`}
      </div>
      
      {multiline ? (
        <Textarea
          id={id}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={className}
          rows={rows}
          isRequired={required}
          aria-describedby={helpTextId}
          aria-label={`${question}${required ? ' (requerido)' : ''}`}
        />
      ) : (
        <Input
          id={id}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={className}
          isRequired={required}
          aria-describedby={helpTextId}
          aria-label={`${question}${required ? ' (requerido)' : ''}`}
        />
      )}
    </div>
  );
};
