import { QuestionTooltip } from "../QuestionTooltip";
import { FileUpload } from "../FileUpload";
import { FileAttachment } from "../FormContext";

interface FileUploadQuestionProps {
  id: string;
  question: string;
  file?: FileAttachment;
  onFileChange: (file: FileAttachment | undefined) => void;
  tooltip?: string;
  label?: string;
  required?: boolean;
}

export const FileUploadQuestion = ({
  id,
  question,
  file,
  onFileChange,
  tooltip,
  label = "Seleccionar archivo",
  required = false,
}: FileUploadQuestionProps) => {
  const helpTextId = `${id}-help`;
  const errorId = `${id}-error`;
  
  return (
    <fieldset className="mb-8">
      <legend className="sr-only">
        {question} {required ? '(requerido)' : '(opcional)'}
      </legend>
      <div className="flex items-start gap-2 mb-2">
        <div className="flex-1">
          <label htmlFor={id} className="text-sm font-medium text-gray-900 md:text-base">
            {question}
            {required && <span className="text-red-500 ml-1" aria-label="requerido">*</span>}
          </label>
        </div>
        {tooltip && <QuestionTooltip content={tooltip} />}
      </div>
      
      <div id={helpTextId} className="sr-only">
        {required ? 'Campo requerido. ' : 'Campo opcional. '}
        Seleccione un archivo PDF de máximo 10MB.
        {tooltip && ` Información adicional: ${tooltip}`}
      </div>
      
      <FileUpload
        onFileSelect={onFileChange}
        selectedFile={file}
        label={label}
        id={id}
        required={required}
        ariaDescribedBy={helpTextId}
      />
    </fieldset>
  );
};
