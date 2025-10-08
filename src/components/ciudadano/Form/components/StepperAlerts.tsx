import AlertDialog from "@/components/shared/AlertDialog/AlertDialog";
import AlertConfirm from "@/components/shared/AlertDialog/AlertConfirm";

interface StepperAlertsProps {
  showSaved: boolean;
  showConfirmSave: boolean;
  showConfirmFinalize: boolean;
  onCloseSaved: () => void;
  onCloseConfirmSave: () => void;
  onCloseConfirmFinalize: () => void;
  onConfirmSave: () => void;
  onConfirmFinalize: () => void;
  onConfirmSaved: () => void;
}

export function StepperAlerts({
  showSaved,
  showConfirmSave,
  showConfirmFinalize,
  onCloseSaved,
  onCloseConfirmSave,
  onCloseConfirmFinalize,
  onConfirmSave,
  onConfirmFinalize,
  onConfirmSaved,
}: StepperAlertsProps) {
  return (
    <>
      {/* Alerta de guardado exitoso */}
      <AlertDialog
        isOpen={showSaved}
        onClose={onCloseSaved}
        title="Guardado exitoso"
        message="Tus respuestas se guardaron como borrador."
        type="success"
        onConfirm={onConfirmSaved}
      />

      {/* Confirmación para guardar borrador */}
      <AlertConfirm
        isOpen={showConfirmSave}
        onClose={onCloseConfirmSave}
        title="Guardar como borrador"
        message="¿Deseas guardar tus respuestas para continuar más tarde?"
        confirmText="Sí, guardar"
        cancelText="Cancelar"
        type="warning"
        onConfirm={onConfirmSave}
        enableDelay={false}
      />

      {/* Confirmación para finalizar formulario */}
      <AlertConfirm
        isOpen={showConfirmFinalize}
        onClose={onCloseConfirmFinalize}
        title="Finalizar formulario"
        message="¿Confirmas que deseas enviar y finalizar el formulario? No podrás editar después."
        confirmText="Sí, finalizar"
        cancelText="Cancelar"
        type="warning"
        confirmColor="primary"
        onConfirm={onConfirmFinalize}
        enableDelay={true}
        delaySeconds={3}
      />
    </>
  );
}
