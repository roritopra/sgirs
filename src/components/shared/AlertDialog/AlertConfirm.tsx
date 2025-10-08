"use client";

import {useEffect, useMemo, useState} from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

export type AlertConfirmType = "success" | "error" | "warning" | "info";

interface AlertConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => Promise<void> | void;
  type?: AlertConfirmType;
  confirmColor?: "primary" | "danger" | "warning" | "success" | "default";
  enableDelay?: boolean; // si true, espera delaySeconds antes de habilitar confirmar
  delaySeconds?: number; // segundos de espera para habilitar confirmar
  isDismissable?: boolean;
  isKeyboardDismissDisabled?: boolean;
}

export default function AlertConfirm({
  isOpen,
  onClose,
  title,
  message,
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  onConfirm,
  type = "warning",
  confirmColor,
  enableDelay = false,
  delaySeconds = 3,
  isDismissable = false,
  isKeyboardDismissDisabled = true,
}: AlertConfirmProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCounter(0);
      setIsLoading(false);
      return;
    }

    if (!enableDelay || delaySeconds <= 0) {
      setCounter(0);
      return;
    }

    setCounter(delaySeconds);
    const id = setInterval(() => {
      setCounter((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [isOpen, enableDelay, delaySeconds]);

  const isConfirmDisabled = useMemo(() => {
    return isLoading || (enableDelay && counter > 0);
  }, [isLoading, enableDelay, counter]);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const computedConfirmColor: "primary" | "danger" | "warning" | "success" | "default" = useMemo(() => {
    if (confirmColor) return confirmColor;
    switch (type) {
      case "error":
        return "danger";
      case "warning":
        return "warning";
      case "success":
        return "success";
      default:
        return "primary";
    }
  }, [confirmColor, type]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      backdrop="blur"
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={isKeyboardDismissDisabled}
      size="sm"
      aria-label="Confirmación requerida"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-center">
          <h3 className="text-lg font-semibold">{title}</h3>
        </ModalHeader>
        <ModalBody>
          <p className="text-center text-gray-600">{message}</p>
        </ModalBody>
        <ModalFooter className="justify-center gap-3">
          <Button
            variant="flat"
            color="default"
            onPress={onClose}
            aria-label="Cancelar"
          >
            {cancelText}
          </Button>
          <Button
            color={computedConfirmColor}
            onPress={handleConfirm}
            isDisabled={isConfirmDisabled}
            isLoading={isLoading}
            aria-label="Confirmar"
            className="min-w-28"
          >
            {counter > 0 ? `${confirmText} (${counter})` : confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
