import { createContext, useState, useContext, useEffect, type ReactNode } from "react";

export type FileAttachment = {
  name: string;
  size: number;
  type: string;
  url?: string;
  file?: File; // referencia al archivo real para uploads
};

export type FormState = {
  // Paso 1: Documentación
  manualSGIRS: boolean | null;
  
  // Paso 2: Organización
  esquemaOrganizacional: boolean | null;
  
  // Paso 3: Caracterización
  caracterizacionResiduos: boolean | null;
  
  // Paso 4: Separación y Almacenamiento
  separacionFuente: boolean | null;
  mobiliarioSeparacion: boolean | null;
  planoRutas: boolean | null;
  unidadAlmacenamiento: boolean | null;
  
  // Paso 5: Recolección No Aprovechables
  empresaAseo: string;
  frecuenciaRecoleccion: string;
  aforoResiduos: boolean | null;
  
  // Paso 6: Residuos Orgánicos
  generaOrganicos: boolean | null;
  recoleccionOrganicos: boolean | null;
  gestorOrganicos: string;
  otroGestorOrganicos: string;
  frecuenciaOrganicos: string;
  aprovechamientoInSitu: boolean | null;
  
  // Paso 7: Residuos Aprovechables
  generaAprovechables: boolean | null;
  tiposAprovechables: string[];
  recoleccionAprovechables: boolean | null;
  
  // Paso 8: Gestores de Aprovechables
  esORO: boolean | null;
  organizacionRecicladores: string;
  gestorNoORO: string;
  frecuenciaAprovechables: string;
  
  // Paso 9: Aceite de Cocina Usado
  generaACU: boolean | null;
  recoleccionACU: boolean | null;
  gestorACU: string;
  frecuenciaACU: string;
  
  // Paso 10: Residuos de Aparatos Eléctricos y Electrónicos
  generaRAEE: boolean | null;
  tiposRAEE: string[];
  recoleccionRAEE: boolean | null;
  gestorRAEE: string;
  
  // Paso 11: Residuos de Construcción y Demolición
  generaRCD: boolean | null;
  recoleccionRCD: boolean | null;
  gestorRCD: string;
  
  // Paso 12: Residuos Peligrosos y Voluminosos
  generaRESPEL: boolean | null;
  tiposRESPEL: string[];
  recoleccionRESPEL: boolean | null;
  gestorRESPEL: string;
  generaVoluminosos: boolean | null;
  tiposVoluminosos: string[];
  conoceLineasVoluminosos: boolean | null;
  programaComunicacion: boolean | null;
  accionesMejora: boolean | null;
  
  // Indicadores
  indicadores: {
    indicador1: {
      meses: {
        [key: string]: {
          ejecutadas: string;
          programadas: string;
        }
      };
    };
    indicador2: {
      meses: {
        [key: string]: {
          aprovechados: string;
          generados: string;
        }
      };
    };
    indicador3: {
      meses: {
        [key: string]: {
          volumen: string;
        }
      };
    };
    indicador4: {
      condiciones: {
        condicion1: boolean | null;
        condicion2: boolean | null;
        condicion3: boolean | null;
        condicion4: boolean | null;
        condicion5: boolean | null;
        condicion6: boolean | null;
        condicion7: boolean | null;
        condicion8: boolean | null;
      };
      fecha: string;
    };
    indicador5: {
      meses: {
        [key: string]: {
          rsoGestores: string;
          residuosGenerados: string;
        }
      };
    };
  };
  
  // Respuestas dinámicas desde API (clave = id de pregunta)
  dynamicAnswers?: Record<string, any>;
  dynamicAttachments?: Record<string, FileAttachment | undefined>;
};

const initialState: FormState = {
  // Paso 1
  manualSGIRS: null,
  
  // Paso 2
  esquemaOrganizacional: null,
  
  // Paso 3
  caracterizacionResiduos: null,
  
  // Paso 4
  separacionFuente: null,
  mobiliarioSeparacion: null,
  planoRutas: null,
  unidadAlmacenamiento: null,
  
  // Paso 5
  empresaAseo: "",
  frecuenciaRecoleccion: "",
  aforoResiduos: null,
  
  // Paso 6
  generaOrganicos: null,
  recoleccionOrganicos: null,
  gestorOrganicos: "",
  otroGestorOrganicos: "",
  frecuenciaOrganicos: "",
  aprovechamientoInSitu: null,
  
  // Paso 7
  generaAprovechables: null,
  tiposAprovechables: [],
  recoleccionAprovechables: null,
  
  // Paso 8
  esORO: null,
  organizacionRecicladores: "",
  gestorNoORO: "",
  frecuenciaAprovechables: "",
  
  // Paso 9
  generaACU: null,
  recoleccionACU: null,
  gestorACU: "",
  frecuenciaACU: "",
  
  // Paso 10
  generaRAEE: null,
  tiposRAEE: [],
  recoleccionRAEE: null,
  gestorRAEE: "",
  
  // Paso 11
  generaRCD: null,
  recoleccionRCD: null,
  gestorRCD: "",
  
  // Paso 12
  generaRESPEL: null,
  tiposRESPEL: [],
  recoleccionRESPEL: null,
  gestorRESPEL: "",
  generaVoluminosos: null,
  tiposVoluminosos: [],
  conoceLineasVoluminosos: null,
  programaComunicacion: null,
  accionesMejora: null,
  
  // Indicadores
  indicadores: {
    indicador1: {
      meses: {
        ene: { ejecutadas: "", programadas: "" },
        feb: { ejecutadas: "", programadas: "" },
        mar: { ejecutadas: "", programadas: "" },
        abr: { ejecutadas: "", programadas: "" },
        may: { ejecutadas: "", programadas: "" },
        jun: { ejecutadas: "", programadas: "" },
        jul: { ejecutadas: "", programadas: "" },
        ago: { ejecutadas: "", programadas: "" },
        sep: { ejecutadas: "", programadas: "" },
        oct: { ejecutadas: "", programadas: "" },
        nov: { ejecutadas: "", programadas: "" },
        dic: { ejecutadas: "", programadas: "" },
      },
    },
    indicador2: {
      meses: {
        ene: { aprovechados: "", generados: "" },
        feb: { aprovechados: "", generados: "" },
        mar: { aprovechados: "", generados: "" },
        abr: { aprovechados: "", generados: "" },
        may: { aprovechados: "", generados: "" },
        jun: { aprovechados: "", generados: "" },
        jul: { aprovechados: "", generados: "" },
        ago: { aprovechados: "", generados: "" },
        sep: { aprovechados: "", generados: "" },
        oct: { aprovechados: "", generados: "" },
        nov: { aprovechados: "", generados: "" },
        dic: { aprovechados: "", generados: "" },
      },
    },
    indicador3: {
      meses: {
        ene: { volumen: "" },
        feb: { volumen: "" },
        mar: { volumen: "" },
        abr: { volumen: "" },
        may: { volumen: "" },
        jun: { volumen: "" },
        jul: { volumen: "" },
        ago: { volumen: "" },
        sep: { volumen: "" },
        oct: { volumen: "" },
        nov: { volumen: "" },
        dic: { volumen: "" },
      },
    },
    indicador4: {
      condiciones: {
        condicion1: null,
        condicion2: null,
        condicion3: null,
        condicion4: null,
        condicion5: null,
        condicion6: null,
        condicion7: null,
        condicion8: null,
      },
      fecha: new Date().toISOString().split('T')[0],
    },
    indicador5: {
      meses: {
        ene: { rsoGestores: "", residuosGenerados: "" },
        feb: { rsoGestores: "", residuosGenerados: "" },
        mar: { rsoGestores: "", residuosGenerados: "" },
        abr: { rsoGestores: "", residuosGenerados: "" },
        may: { rsoGestores: "", residuosGenerados: "" },
        jun: { rsoGestores: "", residuosGenerados: "" },
        jul: { rsoGestores: "", residuosGenerados: "" },
        ago: { rsoGestores: "", residuosGenerados: "" },
        sep: { rsoGestores: "", residuosGenerados: "" },
        oct: { rsoGestores: "", residuosGenerados: "" },
        nov: { rsoGestores: "", residuosGenerados: "" },
        dic: { rsoGestores: "", residuosGenerados: "" },
      },
    },
  },
  
  // Respuestas dinámicas desde API (clave = id de pregunta)
  dynamicAnswers: {},
  dynamicAttachments: {},
};

type FormContextType = {
  state: FormState;
  updateForm: (updates: Partial<FormState>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
  formSubmitted: boolean;
  submitForm: () => void;
  updateDynamicAnswer: (id: string, value: any) => void;
  updateDynamicAttachment: (id: string, file?: FileAttachment) => void;
};

export const FormContext = createContext<FormContextType>({
  state: initialState,
  updateForm: () => {},
  currentStep: 1,
  setCurrentStep: () => {},
  totalSteps: 13,
  formSubmitted: false,
  submitForm: () => {},
  updateDynamicAnswer: () => {},
  updateDynamicAttachment: () => {},
});

export const FormProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<FormState>(initialState);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 13;
  const [formSubmitted, setFormSubmitted] = useState(false);

  const updateForm = (updates: Partial<FormState>) => {
    try {
      setState((prev) => ({ ...prev, ...updates }));
    } catch (error) {
      console.error("Error updating form state:", error);
    }
  };

  const updateDynamicAnswer = (id: string, value: any) => {
    try {
      setState((prev) => ({
        ...prev,
        dynamicAnswers: { ...(prev.dynamicAnswers || {}), [id]: value },
      }));
    } catch (error) {
      console.error("Error updating dynamic answer:", error);
    }
  };

  const updateDynamicAttachment = (id: string, file?: FileAttachment) => {
    try {
      setState((prev) => ({
        ...prev,
        dynamicAttachments: { ...(prev.dynamicAttachments || {}), [id]: file },
      }));
    } catch (error) {
      console.error("Error updating dynamic attachment:", error);
    }
  };

  // Add function to handle form submission
  const submitForm = () => {
    setFormSubmitted(true);
    // Here you would typically send the data to a server
    console.log("Form submitted:", state);
  };


  // Add error boundary
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Caught in error boundary:", event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return (
    <FormContext.Provider value={{ 
      state, 
      updateForm, 
      currentStep, 
      setCurrentStep, 
      totalSteps,
      formSubmitted,
      submitForm,
      updateDynamicAnswer,
      updateDynamicAttachment
    }}>
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => useContext(FormContext);