import { useState, useEffect } from "react";
import { DynamicFormQuestion, DynamicQuestion, isQuestionComplete } from "./DynamicFormQuestion";
import { FileAttachment } from "../FormContext";

interface DynamicFormProps {
  questions: DynamicQuestion[];
  initialValues?: Record<string, any>;
  onValueChange: (id: string, value: any) => void;
  onAttachmentChange?: (id: string, file: FileAttachment | undefined) => void;
  attachments?: Record<string, FileAttachment | undefined>;
  onValidationChange?: (isValid: boolean) => void;
}

export const DynamicForm = ({
  questions,
  initialValues = {},
  onValueChange,
  onAttachmentChange,
  attachments = {},
  onValidationChange
}: DynamicFormProps) => {
  const [formValues, setFormValues] = useState<Record<string, any>>(initialValues);
  
  // Actualizar valores locales cuando cambien los initialValues
  useEffect(() => {
    setFormValues(initialValues);
  }, [initialValues]);

  // Validar formulario cuando cambien valores o archivos
  useEffect(() => {
    if (!onValidationChange) return;

    const validateForm = () => {
      const allVisibleQuestions = getAllVisibleQuestions(questions);
      
      for (const question of allVisibleQuestions) {
        const value = formValues[question.id];
        const attachment = attachments[question.id];
        
        if (!isQuestionComplete(question, value, attachment)) {
          onValidationChange(false);
          return;
        }
      }
      
      onValidationChange(true);
    };

    validateForm();
  }, [formValues, attachments, questions, onValidationChange]);

  // Función para obtener todas las preguntas visibles (incluyendo condicionales)
  const getAllVisibleQuestions = (questionsToCheck: DynamicQuestion[], parentId?: string): DynamicQuestion[] => {
    const visibleQuestions: DynamicQuestion[] = [];
    
    for (const question of questionsToCheck) {
      // Si es condicional y no debe mostrarse, la saltamos
      if (parentId && !shouldShowConditional(question, parentId, formValues[parentId])) {
        continue;
      }
      
      visibleQuestions.push(question);
      
      // Agregar preguntas condicionales si existen y son visibles
      if (question.conditionalQuestions && question.conditionalQuestions.length > 0) {
        const conditionalVisible = getAllVisibleQuestions(question.conditionalQuestions, question.id);
        visibleQuestions.push(...conditionalVisible);
      }
    }
    
    return visibleQuestions;
  };
  
  // Manejar cambio de valor
  const handleValueChange = (id: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [id]: value
    }));
    
    onValueChange(id, value);
  };
  
  // Determinar si una pregunta condicional debe mostrarse
  const shouldShowConditional = (question: DynamicQuestion, parentId: string, parentValue: any): boolean => {
    if (!question.conditionalTriggerValue) return true;
    
    if (typeof question.conditionalTriggerValue === "boolean") {
      return parentValue === question.conditionalTriggerValue;
    }
    
    if (Array.isArray(question.conditionalTriggerValue)) {
      return Array.isArray(parentValue) && 
        question.conditionalTriggerValue.some(val => parentValue.includes(val));
    }
    
    return parentValue === question.conditionalTriggerValue;
  };
  
  // Renderizar preguntas recursivamente (para manejar preguntas condicionales)
  const renderQuestions = (questionsToRender: DynamicQuestion[], parentId?: string) => {
    return questionsToRender.map((question) => {
      const currentValue = formValues[question.id];
      const attachmentFile = attachments[question.id];
      
      // Si es una pregunta condicional y no debe mostrarse, no la renderizamos
      if (parentId && !shouldShowConditional(question, parentId, formValues[parentId])) {
        return null;
      }
      
      return (
        <div key={question.id}>
          <DynamicFormQuestion
            question={question}
            value={currentValue}
            onChange={handleValueChange}
            attachmentFile={attachmentFile}
            onAttachmentChange={onAttachmentChange}
          />
          
          {/* Renderizar preguntas condicionales si existen */}
          {question.conditionalQuestions && question.conditionalQuestions.length > 0 && (
            <div className="pl-4 border-l-2 border-gray-200 ml-2">
              {renderQuestions(question.conditionalQuestions, question.id)}
            </div>
          )}
        </div>
      );
    });
  };
  
  return <div className="space-y-4">{renderQuestions(questions)}</div>;
};
