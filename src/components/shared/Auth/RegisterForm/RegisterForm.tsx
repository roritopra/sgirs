"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  Input,
  Button,
  Select,
  SelectItem,
  Link,
  Checkbox,
  Tooltip,
  NumberInput,
  Alert,
  addToast,
} from "@heroui/react";
import { ChevronLeftIcon } from "lucide-react";
import {
  userInfoSchema,
  establishmentInfoSchema,
  type UserInfoFormValues,
  type EstablishmentInfoFormValues,
} from "../../../../validators/shared/registerValidators";
import {
  RegisterService,
  type RegisterRequest,
} from "@/services/registerService";
import AlertDialog from "@/components/shared/AlertDialog/AlertDialog";
import { useRouter } from "next/navigation";
import { useSectores } from "@/hooks/shared/useSectores";
import AddressBuilderPopover from "@/components/shared/Address/AddressBuilderPopover";
import { get } from "@/utils/shared/apiUtils";
import PasswordField from "@/components/shared/Auth/Password/PasswordField";

export default function RegisterForm() {
  const [step, setStep] = useState(1);
  const [userInfo, setUserInfo] = useState<UserInfoFormValues>({
    firstName: "",
    secondName: "",
    firstLastName: "",
    secondLastName: "",
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const router = useRouter();

  // Hook para sectores - carga todos los sectores de una vez
  const { sectores, isLoading: isLoadingSectores } = useSectores();

  // Comunas y Barrios dependientes
  type Comuna = {
    id: string;
    codigo_comuna: string;
    nombre_comuna: string;
    status: boolean;
  };

  const [comunas, setComunas] = useState<Comuna[]>([]);
  const [isLoadingComunas, setIsLoadingComunas] = useState(false);
  const [selectedComuna, setSelectedComuna] = useState<string>("");

  const [barriosOptions, setBarriosOptions] = useState<
    Array<{ nombre_barrio: string }>
  >([]);
  const [isLoadingBarriosLocal, setIsLoadingBarriosLocal] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setIsLoadingComunas(true);
        const res = await get<{ data: Comuna[] }>(
          "/api/v1/comunas?page=1&per_page=25"
        );
        setComunas(res?.data || []);
      } catch (e) {
        console.error("Error cargando comunas", e);
      } finally {
        setIsLoadingComunas(false);
      }
    })();
  }, []);

  function handleOpenPolicy(e?: any) {
    (async () => {
      try {
        if (e && typeof e.preventDefault === "function") e.preventDefault();
        const urlOrObj = await get<any>("/api/v1/tratamiento_de_datos");
        const presignedUrl =
          typeof urlOrObj === "string"
            ? urlOrObj
            : urlOrObj?.url || urlOrObj?.data || urlOrObj?.link || "";
        if (!presignedUrl) {
          addToast({
            title: "No se pudo abrir la política",
            description: "Inténtalo nuevamente en unos segundos.",
            color: "danger",
            variant: "flat",
          });
          return;
        }
        window.open(presignedUrl as string, "_blank", "noopener,noreferrer");
      } catch (err) {
        console.error("Error obteniendo política de tratamiento de datos", err);
        addToast({
          title: "No se pudo abrir la política",
          description: "Inténtalo nuevamente en unos segundos.",
          color: "danger",
          variant: "flat",
        });
      }
    })();
  }

  async function handleComunaChange(value: string) {
    setSelectedComuna(value);
    setEstablishmentValues({
      ...establishmentValues,
      comuna: value,
      barrio: "",
    });
    setEstablishmentValue("comuna", value);
    setEstablishmentValue("barrio", "");
    setBarriosOptions([]);
    if (!value) return;
    try {
      setIsLoadingBarriosLocal(true);
      const barrios = await get<string[]>(
        `/api/v1/comunas/${encodeURIComponent(value)}/barrios`
      );
      setBarriosOptions((barrios || []).map((b) => ({ nombre_barrio: b })));
    } catch (e) {
      console.error("Error cargando barrios por comuna", e);
    } finally {
      setIsLoadingBarriosLocal(false);
    }
  }

  // Estado de contraseña (UI y sincronización con RHF)
  const [password, setPassword] = useState("");
  const [isEmailTooltipOpen, setIsEmailTooltipOpen] = useState(false);
  const [isFirstNameTooltipOpen, setIsFirstNameTooltipOpen] = useState(false);
  const [nitNumber, setNitNumber] = useState("");
  const [nitDV, setNitDV] = useState("");
  const [showNitAlert, setShowNitAlert] = useState(false);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);

  const userInfoMethods = useForm<UserInfoFormValues>({
    resolver: zodResolver(userInfoSchema),
    defaultValues: {
      firstName: "",
      secondName: "",
      firstLastName: "",
      secondLastName: "",
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const establishmentInfoMethods = useForm<EstablishmentInfoFormValues>({
    resolver: zodResolver(establishmentInfoSchema),
    defaultValues: {
      nit: "",
      nombreEstablecimiento: "",
      sector: "",
      comuna: "",
      barrio: "",
      direccion: "",
      telefono: "",
    },
    mode: "onBlur",
  });

  const {
    control: userControl,
    handleSubmit: handleUserSubmit,
    formState: { errors: userErrors },
  } = userInfoMethods;
  const {
    control: establishmentControl,
    handleSubmit: handleEstablishmentSubmit,
    formState: { errors: establishmentErrors },
    setValue: setEstablishmentValue,
  } = establishmentInfoMethods;

  const [establishmentValues, setEstablishmentValues] = useState({
    nit: "",
    nombreEstablecimiento: "",
    sector: "",
    comuna: "",
    barrio: "",
    direccion: "",
    telefono: "",
  });

  // Dirección: se gestiona con AddressBuilderPopover

  const handleNext = async () => {
    const isValid = await userInfoMethods.trigger();
    if (isValid) {
      const data = userInfoMethods.getValues();
      setUserInfo(data);
      setStep(2);
    }
  };

  const handlePrevious = () => {
    setStep(1);
  };

  // UI de contraseña se maneja en PasswordField; aquí solo sincronizamos el valor con RHF

  // Sincronizar el valor con RHF
  useEffect(() => {
    userInfoMethods.setValue("password", password, { shouldValidate: true });
  }, [password]);

  const onSubmitUserInfo = (data: UserInfoFormValues) => {
    setUserInfo(data);
    setStep(2);
  };

  const onSubmitEstablishmentInfo = async (
    data: EstablishmentInfoFormValues
  ) => {
    setIsSubmitting(true);

    try {
      // Mapear datos al formato que espera la API
      const registerData: RegisterRequest = {
        nit: establishmentValues.nit,
        dv: Number(nitDV),
        nombre_establecimiento: establishmentValues.nombreEstablecimiento,
        sector: establishmentValues.sector,
        direccion: establishmentValues.direccion,
        barrio: establishmentValues.barrio,
        email: userInfo.email,
        contraseña: userInfo.password,
        primer_nombre: userInfo.firstName,
        segundo_nombre: userInfo.secondName || "",
        primer_apellido: userInfo.firstLastName,
        segundo_apellido: userInfo.secondLastName || "",
        num_telefono: establishmentValues.telefono || "",
      };

      console.log("Enviando datos de registro:", registerData);

      const response = await RegisterService.register(registerData);

      console.log("Registro exitoso:", response);

      // Mostrar dialog de éxito
      setShowSuccessDialog(true);
    } catch (error: any) {
      console.error("Error en el registro:", error);

      // Manejar error específico de email ya registrado (400 Bad Request)
      if (error.status === 400 || error.response?.status === 400) {
        addToast({
          title: "Email ya registrado",
          description:
            "Este correo electrónico ya está registrado. Por favor, usa otro email o inicia sesión.",
          color: "danger",
          variant: "flat",
        });
      } else {
        // Otros errores
        addToast({
          title: "Email ya registrado",
          description:
            "Este correo electrónico ya está registrado. Por favor, usa otro email o inicia sesión.",
          color: "danger",
          variant: "flat",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessDialogConfirm = () => {
    setShowSuccessDialog(false);
    router.push("/auth/login");
  };

  return (
    <>
      <section
        className="flex relative flex-col items-center bg-white space-y-8 rounded-4xl py-5 px-5 lg:py-9 lg:px-20"
        role="main"
        aria-labelledby="register-title"
      >
        <div className="absolute top-3 left-3 lg:top-8 lg:left-8">
          {step === 2 && (
            <Button
              variant="light"
              endContent
              onPress={handlePrevious}
              isIconOnly
              aria-label="Volver al paso anterior"
            >
              <ChevronLeftIcon
                className="w-4 h-4 text-gray-400 md:w-6 lg:h-6"
                aria-hidden="true"
              />
            </Button>
          )}
        </div>
        <div className="flex flex-col items-center gap-1 w-auto max-w-lg">
          <h1
            id="register-title"
            className="text-xl font-semibold text-center lg:text-2xl"
          >
            Crea tu cuenta en SGIRS
          </h1>
          <p className="text-sm text-gray-400 text-center">
            Únete al compromiso por una Cali más limpia y responsable.
            Regístrate para reportar, gestionar y cumplir con la normativa
            ambiental vigente.
          </p>
        </div>
        <div
          className="flex items-center gap-2 mt-2"
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={2}
          aria-label={`Paso ${step} de 2 del proceso de registro`}
        >
          <div
            className={`w-10 h-2 rounded-full flex items-center justify-center ${
              step === 1 ? "bg-primary text-white" : "bg-gray-200"
            }`}
            aria-label="Paso 1: Información personal"
          ></div>
          <div
            className={`w-10 h-2 rounded-full flex items-center justify-center ${
              step === 2 ? "bg-primary text-white" : "bg-gray-200"
            }`}
            aria-label="Paso 2: Información del establecimiento"
          ></div>
        </div>

        {step === 1 ? (
          <FormProvider {...userInfoMethods}>
            <Form
              className="w-full max-w-md flex flex-col items-center gap-4"
              onSubmit={handleUserSubmit(onSubmitUserInfo)}
              aria-labelledby="user-info-title"
            >
              <h2 id="user-info-title" className="sr-only">
                Información personal del usuario
              </h2>
              <div className="grid grid-cols-1 gap-4 w-full lg:grid-cols-2">
                <Controller
                  name="firstName"
                  control={userControl}
                  render={({ field }) => (
                    <Tooltip
                      content="Por favor ingresa el nombre de la persona encargada de realizar el registro en la plataforma SGIRS. Puede ser el representante legal del sector estratégico, o el coordinador SGIRS"
                      placement="top"
                      color="warning"
                      showArrow
                      isOpen={isFirstNameTooltipOpen}
                      classNames={{
                        content:
                          "max-w-sm bg-[#fefce8] text-[#936316] text-sm py-2",
                        arrow: "bg-[#fefce8]",
                      }}
                    >
                      <Input
                        {...field}
                        isRequired
                        variant="bordered"
                        placeholder="Primer nombre"
                        label="Primer nombre"
                        labelPlacement="outside"
                        isInvalid={!!userErrors.firstName}
                        errorMessage={userErrors.firstName?.message}
                        aria-describedby={
                          userErrors.firstName ? `firstName-error` : undefined
                        }
                        autoComplete="given-name"
                        onFocus={() => setIsFirstNameTooltipOpen(true)}
                        onBlur={() => {
                          setIsFirstNameTooltipOpen(false);
                          field.onBlur();
                        }}
                      />
                    </Tooltip>
                  )}
                />
                <Controller
                  name="secondName"
                  control={userControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      variant="bordered"
                      placeholder="Segundo nombre"
                      label="Segundo nombre"
                      labelPlacement="outside"
                      autoComplete="additional-name"
                    />
                  )}
                />
                <Controller
                  name="firstLastName"
                  control={userControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      isRequired
                      variant="bordered"
                      placeholder="Primer apellido"
                      label="Primer apellido"
                      labelPlacement="outside"
                      isInvalid={!!userErrors.firstLastName}
                      errorMessage={userErrors.firstLastName?.message}
                      aria-describedby={
                        userErrors.firstLastName
                          ? `firstLastName-error`
                          : undefined
                      }
                      autoComplete="family-name"
                    />
                  )}
                />
                <Controller
                  name="secondLastName"
                  control={userControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      variant="bordered"
                      placeholder="Segundo apellido"
                      label="Segundo apellido"
                      labelPlacement="outside"
                      autoComplete="family-name"
                    />
                  )}
                />
              </div>
              <Controller
                name="email"
                control={userControl}
                render={({ field }) => (
                  <Tooltip
                    content="Recuerda que, si tu sector estratégico cuenta con varias sedes, debes registrar un correo electrónico diferente para cada una. Esto te permitirá validar correctamente tu proceso. Si no lo encuentras en la bandeja principal, revisa la carpeta de spam o correo no deseado."
                    placement="top"
                    color="warning"
                    showArrow
                    isOpen={isEmailTooltipOpen}
                    classNames={{
                      content:
                        "max-w-md bg-[#fefce8] text-[#936316] text-sm py-2",
                      arrow: "bg-[#fefce8]",
                    }}
                  >
                    <Input
                      {...field}
                      className="w-full"
                      type="email"
                      isRequired
                      variant="bordered"
                      placeholder="Correo electrónico"
                      label="Correo electrónico"
                      labelPlacement="outside"
                      isInvalid={!!userErrors.email}
                      errorMessage={userErrors.email?.message}
                      aria-describedby={
                        userErrors.email ? `email-error` : undefined
                      }
                      autoComplete="email"
                      onFocus={() => setIsEmailTooltipOpen(true)}
                      onBlur={(e) => {
                        setIsEmailTooltipOpen(false);
                        field.onBlur();
                      }}
                    />
                  </Tooltip>
                )}
              />
              <div className="w-full">
                <PasswordField
                  value={password}
                  onChange={setPassword}
                  label="Contraseña"
                  placeholder="Contraseña"
                  isRequired
                  autoComplete="new-password"
                />
              </div>

              <Button
                fullWidth
                color="primary"
                className="mt-4"
                onPress={handleNext}
                isDisabled={
                  !userInfoMethods.formState.isValid ||
                  !userInfoMethods.getValues().firstName ||
                  !userInfoMethods.getValues().firstLastName ||
                  !userInfoMethods.getValues().email ||
                  !userInfoMethods.getValues().password
                }
                aria-describedby="next-button-help"
              >
                Siguiente
              </Button>
              <Link
                href="/auth/login"
                size="sm"
                underline="always"
                className="mt-2 text-[#339afe]"
                aria-label="Volver al inicio"
                aria-describedby="back-button-help"
              >
                ¿Ya tienes una cuenta? Inicia sesión
              </Link>
              <div id="next-button-help" className="sr-only">
                Continuar al paso 2: información del establecimiento
              </div>
            </Form>
          </FormProvider>
        ) : (
          <FormProvider {...establishmentInfoMethods}>
            <Form
              className="w-full max-w-md flex flex-col items-center gap-4"
              aria-labelledby="establishment-info-title"
              onSubmit={(e) => {
                e.preventDefault();
                let hasErrors = false;

                if (!nitNumber) {
                  establishmentInfoMethods.setError("nit", {
                    type: "manual",
                    message: "El NIT es requerido",
                  });
                  hasErrors = true;
                } else if (nitDV.length !== 1) {
                  establishmentInfoMethods.setError("nit", {
                    type: "manual",
                    message: "El DV es requerido y debe tener 1 dígito",
                  });
                  hasErrors = true;
                }

                if (!establishmentValues.direccion) {
                  establishmentInfoMethods.setError("direccion", {
                    type: "manual",
                    message: "La dirección es requerida",
                  });
                  hasErrors = true;
                }

                if (!establishmentValues.sector) {
                  establishmentInfoMethods.setError("sector", {
                    type: "manual",
                    message: "El sector es requerido",
                  });
                  hasErrors = true;
                }

                if (!establishmentValues.comuna) {
                  establishmentInfoMethods.setError("comuna", {
                    type: "manual",
                    message: "La comuna es requerida",
                  });
                  hasErrors = true;
                }

                if (!establishmentValues.barrio) {
                  establishmentInfoMethods.setError("barrio", {
                    type: "manual",
                    message: "El barrio es requerido",
                  });
                  hasErrors = true;
                }

                if (!establishmentValues.nombreEstablecimiento) {
                  establishmentInfoMethods.setError("nombreEstablecimiento", {
                    type: "manual",
                    message: "El nombre del establecimiento es requerido",
                  });
                  hasErrors = true;
                }

                if (hasErrors) {
                  return;
                }

                // Si pasa la validación, enviar el formulario
                onSubmitEstablishmentInfo(
                  establishmentValues as EstablishmentInfoFormValues
                );
              }}
            >
              <h2 id="establishment-info-title" className="sr-only">
                Información del establecimiento
              </h2>
              <div className="flex flex-col w-full space-y-4">
                {showNitAlert && (
                  <Alert
                    color="warning"
                    variant="flat"
                    className="bg-[#fefce8] text-[#936316] text-sm flex items-start justify-between gap-2"
                    role="status"
                    aria-live="polite"
                    onClose={() => setShowNitAlert(false)}
                  >
                    <span>
                      Por favor ingresa el NIT del establecimiento del sector
                      estratégico, incluyendo el número de verificación.
                    </span>
                  </Alert>
                )}
                <div
                  className="w-full"
                  role="group"
                  aria-labelledby="nit-group-label"
                >
                  <div className="flex items-end gap-2">
                    <NumberInput
                      value={nitNumber === "" ? undefined : Number(nitNumber)}
                      onChange={(e: any) => {
                        const raw =
                          typeof e === "number"
                            ? String(e)
                            : e?.target?.value ?? "";
                        const onlyDigits = raw.replace(/\D/g, "");
                        setNitNumber(onlyDigits);
                        setEstablishmentValues({
                          ...establishmentValues,
                          nit: onlyDigits,
                        });
                        setEstablishmentValue("nit", onlyDigits);
                      }}
                      onFocus={() => setShowNitAlert(true)}
                      min={0}
                      step={1}
                      isRequired
                      label="NIT del establecimiento"
                      labelPlacement="outside"
                      variant="bordered"
                      formatOptions={{
                        useGrouping: false,
                        maximumFractionDigits: 0,
                      }}
                      isWheelDisabled
                      hideStepper
                      placeholder="NIT"
                      aria-label="Número de NIT"
                      isInvalid={!!establishmentErrors.nit}
                      errorMessage={establishmentErrors.nit?.message}
                      aria-describedby={
                        establishmentErrors.nit ? `nit-error` : undefined
                      }
                      className="flex-1"
                    />
                    <span aria-hidden="true" className="pb-2 text-default-400">
                      -
                    </span>
                    <NumberInput
                      value={nitDV === "" ? undefined : Number(nitDV)}
                      onChange={(e: any) => {
                        const raw =
                          typeof e === "number"
                            ? String(e)
                            : e?.target?.value ?? "";
                        const onlyDigit = raw.replace(/\D/g, "").slice(0, 1);
                        setNitDV(onlyDigit);
                      }}
                      onFocus={() => setShowNitAlert(true)}
                      min={0}
                      max={9}
                      step={1}
                      formatOptions={{
                        useGrouping: false,
                        maximumFractionDigits: 0,
                      }}
                      hideStepper
                      isRequired
                      variant="bordered"
                      placeholder="DV"
                      label="DV"
                      labelPlacement="outside"
                      aria-label="Dígito de verificación (DV)"
                      isInvalid={!!establishmentErrors.nit}
                      aria-describedby={
                        establishmentErrors.nit ? `nit-error` : undefined
                      }
                      className="w-20"
                      inputMode="numeric"
                      isWheelDisabled
                      onKeyDown={(e) => {
                        if (e.ctrlKey || e.metaKey) {
                          return;
                        }
                        const allowedNav = [
                          "Backspace",
                          "Delete",
                          "Tab",
                          "ArrowLeft",
                          "ArrowRight",
                          "Home",
                          "End",
                        ];
                        const isDigitKey = /^[0-9]$/.test(e.key);
                        if (!isDigitKey && !allowedNav.includes(e.key)) {
                          e.preventDefault();
                          return;
                        }
                        const input = e.currentTarget as HTMLInputElement;
                        const selLen =
                          (input.selectionEnd ?? 0) -
                          (input.selectionStart ?? 0);
                        const currentLen = nitDV.length;
                        if (isDigitKey && currentLen - selLen >= 1) {
                          e.preventDefault();
                        }
                      }}
                      onPaste={(e) => {
                        const text = e.clipboardData.getData("text") || "";
                        const digits = text.replace(/\D/g, "");
                        if (!digits) {
                          e.preventDefault();
                          return;
                        }
                        e.preventDefault();
                        const first = digits[0] ?? "";
                        setNitDV(first);
                      }}
                    />
                  </div>
                </div>
                <Input
                  value={establishmentValues.nombreEstablecimiento}
                  onChange={(e) =>
                    setEstablishmentValues({
                      ...establishmentValues,
                      nombreEstablecimiento: e.target.value,
                    })
                  }
                  isRequired
                  variant="bordered"
                  placeholder="Nombre del establecimiento"
                  label="Nombre del establecimiento"
                  labelPlacement="outside"
                  isInvalid={!!establishmentErrors.nombreEstablecimiento}
                  errorMessage={
                    establishmentErrors.nombreEstablecimiento?.message
                  }
                  aria-describedby={
                    establishmentErrors.nombreEstablecimiento
                      ? `nombreEstablecimiento-error`
                      : undefined
                  }
                  autoComplete="organization"
                />

                <Select
                  label="Sector"
                  placeholder="Selecciona un sector"
                  labelPlacement="outside"
                  isRequired
                  variant="bordered"
                  selectedKeys={
                    establishmentValues.sector
                      ? [establishmentValues.sector]
                      : []
                  }
                  onChange={(e) => {
                    setEstablishmentValues({
                      ...establishmentValues,
                      sector: e.target.value,
                    });
                  }}
                  isLoading={isLoadingSectores}
                  isInvalid={!!establishmentErrors.sector}
                  errorMessage={establishmentErrors.sector?.message}
                  aria-describedby={
                    establishmentErrors.sector ? `sector-error` : undefined
                  }
                  aria-label="Seleccionar sector del establecimiento"
                >
                  {sectores.map((sector) => (
                    <SelectItem key={sector.nombre_sector}>
                      {sector.nombre_sector}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  label="Comuna o corregimiento"
                  placeholder={
                    isLoadingComunas
                      ? "Cargando comunas y corregimientos..."
                      : "Selecciona una comuna o corregimiento"
                  }
                  labelPlacement="outside"
                  isRequired
                  variant="bordered"
                  selectedKeys={
                    establishmentValues.comuna
                      ? [establishmentValues.comuna]
                      : []
                  }
                  onChange={(e) => handleComunaChange(e.target.value)}
                  isLoading={isLoadingComunas}
                  isInvalid={!!establishmentErrors.comuna}
                  errorMessage={establishmentErrors.comuna?.message}
                  aria-describedby={
                    establishmentErrors.comuna ? `comuna-error` : undefined
                  }
                  aria-label="Seleccionar comuna donde se ubica el establecimiento"
                >
                  {comunas.map((c) => (
                    <SelectItem key={c.nombre_comuna}>
                      {c.nombre_comuna}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  label="Barrio"
                  placeholder={
                    selectedComuna
                      ? "Selecciona un barrio"
                      : "Selecciona una comuna primero"
                  }
                  labelPlacement="outside"
                  isRequired
                  variant="bordered"
                  selectedKeys={
                    establishmentValues.barrio
                      ? [establishmentValues.barrio]
                      : []
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    setEstablishmentValues({
                      ...establishmentValues,
                      barrio: value,
                    });
                    setEstablishmentValue("barrio", value);
                  }}
                  isLoading={isLoadingBarriosLocal}
                  isDisabled={!selectedComuna}
                  isInvalid={!!establishmentErrors.barrio}
                  errorMessage={establishmentErrors.barrio?.message}
                  aria-describedby={
                    establishmentErrors.barrio ? `barrio-error` : undefined
                  }
                  aria-label="Seleccionar barrio del establecimiento"
                >
                  {barriosOptions.map((b) => (
                    <SelectItem key={b.nombre_barrio}>
                      {b.nombre_barrio}
                    </SelectItem>
                  ))}
                </Select>

                <NumberInput
                  value={
                    establishmentValues.telefono === ""
                      ? undefined
                      : Number(establishmentValues.telefono)
                  }
                  onChange={(e: any) => {
                    const raw =
                      typeof e === "number"
                        ? String(e)
                        : e?.target?.value ?? "";
                    const onlyDigits = raw.replace(/\D/g, "");
                    setEstablishmentValues({
                      ...establishmentValues,
                      telefono: onlyDigits,
                    });
                  }}
                  min={0}
                  step={1}
                  variant="bordered"
                  placeholder="Número de teléfono"
                  label="Número de teléfono"
                  labelPlacement="outside"
                  formatOptions={{
                    useGrouping: false,
                    maximumFractionDigits: 0,
                  }}
                  isWheelDisabled
                  hideStepper
                  inputMode="tel"
                  aria-label="Número de teléfono del establecimiento"
                />

                <div className="w-full">
                  <AddressBuilderPopover
                    value={establishmentValues.direccion}
                    onChange={(direccion) => {
                      setEstablishmentValues({
                        ...establishmentValues,
                        direccion,
                      });
                      setEstablishmentValue("direccion", direccion);
                    }}
                    label="Dirección del establecimiento"
                    required
                    addLabel="Agregar dirección"
                    editLabel="Editar"
                  />
                </div>
              </div>
              <div className="w-full flex items-center gap-2">
                <Checkbox
                  isSelected={acceptedPolicy}
                  onValueChange={setAcceptedPolicy}
                  size="sm"
                  aria-describedby="policy-help"
                ></Checkbox>
                <p className="text-sm">
                  Acepto la política de{" "}
                  <a
                    href="#"
                    onClick={handleOpenPolicy}
                    className="text-primary underline"
                    aria-label="Abrir política de tratamiento de datos en una nueva pestaña"
                  >
                    tratamiento de datos
                  </a>{" "}
                  más los términos y condiciones
                </p>
                <div id="policy-help" className="sr-only">
                  Debes aceptar la política de tratamiento de datos y los
                  términos y condiciones para registrarte
                </div>
              </div>
              <div className="flex w-full gap-4 mt-2">
                <Button
                  fullWidth
                  color="primary"
                  type="submit"
                  isDisabled={
                    !establishmentValues.nit ||
                    !establishmentValues.nombreEstablecimiento ||
                    !establishmentValues.sector ||
                    !establishmentValues.comuna ||
                    !establishmentValues.barrio ||
                    !establishmentValues.direccion ||
                    nitDV.length !== 1 ||
                    !acceptedPolicy ||
                    !!establishmentErrors.nit ||
                    !!establishmentErrors.nombreEstablecimiento ||
                    !!establishmentErrors.sector ||
                    !!establishmentErrors.comuna ||
                    !!establishmentErrors.barrio ||
                    !!establishmentErrors.direccion ||
                    isSubmitting
                  }
                  aria-describedby="register-button-help"
                  isLoading={isSubmitting}
                >
                  {isSubmitting ? "Registrando..." : "Registrarse"}
                </Button>
                <div id="register-button-help" className="sr-only">
                  Completar el registro con la información proporcionada
                </div>
              </div>
            </Form>
          </FormProvider>
        )}
      </section>

      <AlertDialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title="¡Registro exitoso!"
        message="Recuerda verificar tu bandeja de correo no deseado (spam), ya que el mensaje de validación podría llegar allí."
        confirmText="Continuar"
        onConfirm={handleSuccessDialogConfirm}
        type="success"
      />
    </>
  );
}
