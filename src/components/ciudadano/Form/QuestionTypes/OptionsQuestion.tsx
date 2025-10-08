import { Checkbox, CheckboxGroup } from "@heroui/react";
import { QuestionTooltip } from "../QuestionTooltip";

interface Option {
  key: string;
  label: string;
}

interface OptionsQuestionProps {
  id: string;
  question: string;
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  tooltip?: string;
  orientation?: "horizontal" | "vertical";
  required?: boolean;
}

export const OptionsQuestion = ({
  id,
  question,
  options,
  value,
  onChange,
  tooltip,
  orientation = "vertical",
  required = false,
}: OptionsQuestionProps) => {
  return (
    <fieldset className="mb-8" role="group" aria-labelledby={`${id}-legend`} aria-describedby={`${id}-help`}>
      <div className="flex items-start gap-2 mb-2">
        <legend id={`${id}-legend`} className="flex-1 text-sm font-medium text-gray-900 md:text-base">
          {question}
          {required && (
            <>
              <span className="text-red-500 ml-1" aria-hidden="true">*</span>
              <span className="sr-only"> required</span>
            </>
          )}
        </legend>
        {tooltip && <QuestionTooltip content={tooltip} />}
      </div>

      <p id={`${id}-help`} className="sr-only">
        Use Tab to move and Space to toggle options.
      </p>

      <CheckboxGroup
        id={id}
        value={value}
        onValueChange={(selected) => onChange(selected as string[])}
        orientation={orientation}
        aria-labelledby={`${id}-legend`}
        aria-describedby={`${id}-help`}
        aria-required={required}
      >
        {options.map((option) => (
          <Checkbox key={option.key} value={option.key}>
            {option.label}
          </Checkbox>
        ))}
      </CheckboxGroup>
    </fieldset>
  );
};
