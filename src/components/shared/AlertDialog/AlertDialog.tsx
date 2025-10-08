"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;
  onConfirm?: () => void;
  type?: "success" | "error" | "warning" | "info";
}

export default function AlertDialog({
  isOpen,
  onClose,
  title,
  message,
  confirmText = "Aceptar",
  onConfirm,
  type = "success",
}: AlertDialogProps) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="w-12 h-12 text-green-500" />;
      case "error":
        return <CheckCircleIcon className="w-12 h-12 text-red-500" />;
      case "warning":
        return <CheckCircleIcon className="w-12 h-12 text-yellow-500" />;
      case "info":
        return <CheckCircleIcon className="w-12 h-12 text-blue-500" />;
      default:
        return <CheckCircleIcon className="w-12 h-12 text-green-500" />;
    }
  };

  const getHeaderColor = () => {
    switch (type) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      case "info":
        return "text-blue-600";
      default:
        return "text-green-600";
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      placement="center"
      backdrop="blur"
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      size="sm"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center justify-center mb-2">
            {getIcon()}
          </div>
          <h3 className={`text-lg font-semibold text-center ${getHeaderColor()}`}>
            {title}
          </h3>
        </ModalHeader>
        <ModalBody>
          <p className="text-center text-gray-600">
            {message}
          </p>
        </ModalBody>
        <ModalFooter className="justify-center">
          <Button
            color="primary"
            onPress={handleConfirm}
            className="min-w-24"
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
