import { Select, SelectItem } from "@heroui/react";
import { QuestionTooltip } from "../QuestionTooltip";

interface Option {
  key: string;
  label: string;
}

interface SelectQuestionProps {
  id: string;
  question: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  tooltip?: string;
  label?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export const SelectQuestion = ({
  id,
  question,
  options,
  value,
  onChange,
  tooltip,
  label = "Seleccione una opción",
  placeholder = "Seleccione una opción",
  className = "max-w-md",
  required = false,
}: SelectQuestionProps) => {
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
        Seleccione una opción de la lista desplegable.
        {tooltip && ` Información adicional: ${tooltip}`}
      </div>
      
      <Select
        id={id}
        label={label}
        placeholder={placeholder}
        className={className}
        selectedKeys={value ? [value] : []}
        onSelectionChange={(keys) => {
          const selectedKey = Array.from(keys)[0] as string;
          onChange(selectedKey);
        }}
        isRequired={required}
        aria-describedby={helpTextId}
        aria-label={`${question}${required ? ' (requerido)' : ''}`}
      >
        {options.map((option) => (
          <SelectItem 
            key={option.key}
            aria-label={`Opción: ${option.label}`}
          >
            {option.label}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
};
