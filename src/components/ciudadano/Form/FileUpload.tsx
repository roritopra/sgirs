import { useRef, ChangeEvent } from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { FileAttachment } from "./FormContext";

interface FileUploadProps {
  onFileSelect: (file: FileAttachment | undefined) => void;
  selectedFile?: FileAttachment;
  label?: string;
  id?: string;
  required?: boolean;
  ariaDescribedBy?: string;
}

export const FileUpload = ({ 
  onFileSelect, 
  selectedFile,
  label = "Seleccionar archivo",
  id,
  required = false,
  ariaDescribedBy
}: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      if (!isPdf) {
        window.alert("El archivo debe ser un PDF (.pdf).");
        if (fileInputRef.current) fileInputRef.current.value = "";
        onFileSelect(undefined);
        return;
      }

      if (file.size > MAX_SIZE) {
        window.alert("El archivo supera el tamaño máximo de 10MB.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        onFileSelect(undefined);
        return;
      }

      // Crear objeto con metadatos y referencia al File para subirlo más tarde
      const fileAttachment: FileAttachment = {
        name: file.name,
        size: file.size,
        type: file.type,
        file,
        // Use a static string instead of URL.createObjectURL to avoid memory leaks
        url: "file-selected" // Changed from URL.createObjectURL(file)
      };
      onFileSelect(fileAttachment);
    }
  };
  
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleRemoveFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onFileSelect(undefined);
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  return (
    <div className="mt-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="application/pdf,.pdf"
        id={id}
        required={required}
        aria-describedby={ariaDescribedBy}
        aria-label={`${label}. Solo se permiten archivos PDF de máximo 10MB`}
      />
      
      {!selectedFile ? (
        <Button
          variant="flat"
          color="default"
          startContent={<Icon icon="lucide:upload" aria-hidden="true" />}
          onPress={handleButtonClick}
          className="text-sm"
          aria-describedby={ariaDescribedBy}
          aria-label={`${label}. Solo se permiten archivos PDF de máximo 10MB`}
        >
          {label}
        </Button>
      ) : (
        <div 
          className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-200"
          role="group"
          aria-label={`Archivo seleccionado: ${selectedFile.name}`}
        >
          <div 
            className="bg-primary-100 p-1.5 rounded"
            role="img"
            aria-label={selectedFile.type.includes('pdf') ? 'Archivo PDF' : 'Archivo'}
          >
            <Icon 
              icon={ selectedFile.type.includes('pdf') ? 'lucide:file-text' : 'lucide:file' } 
              className="text-primary-600 w-4 h-4"
              aria-hidden="true"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {selectedFile.name.length > 20
                ? `${selectedFile.name.slice(0, 20)}...`
                : selectedFile.name}
            </p>
            {selectedFile.size > 0 && (
              <p className="text-xs text-gray-500">
                {formatFileSize(selectedFile.size)}
              </p>
            )}
          </div>
          {selectedFile.url && selectedFile.url !== 'file-selected' && (
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="primary"
              onPress={() => window.open(String(selectedFile.url), '_blank', 'noopener,noreferrer')}
              aria-label={`Descargar archivo ${selectedFile.name}`}
            >
              <Icon icon="lucide:download" className="w-4 h-4" aria-hidden="true" />
            </Button>
          )}
          <Button
            isIconOnly
            size="sm"
            variant="light"
            color="danger"
            onPress={handleRemoveFile}
            aria-label={`Eliminar archivo ${selectedFile.name}`}
          >
            <Icon icon="lucide:x" className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
};