import { useRef, useState, useCallback, ReactNode } from "react";

import { GeneralModalRef } from "@/components/common/Modals/Modal";

interface UseConfirmationOptions<T> {
  title?: string | ((data: T) => string);
  message?: ReactNode | ((data: T) => ReactNode);
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: "primary" | "success" | "warning" | "danger";
  onConfirm?: (data: T) => void;
  onCancel?: (data: T) => void;
}

interface ConfirmationModalProps {
  title?: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: "primary" | "success" | "warning" | "danger";
  response: (confirmed: boolean) => void;
}

/**
 * Hook for managing confirmation dialogs
 */
export function useConfirmation<T = any>({
  title,
  message,
  confirmLabel,
  cancelLabel,
  confirmColor,
  onConfirm,
  onCancel,
}: UseConfirmationOptions<T> = {}) {
  const modalRef = useRef<GeneralModalRef>(null);
  const [data, setData] = useState<T | null>(null);

  // Handles the confirmation from the modal
  const handleResponse = useCallback(
    (confirmed: boolean) => {
      if (!data) return;

      if (confirmed && onConfirm) {
        onConfirm(data);
      } else if (!confirmed && onCancel) {
        onCancel(data);
      }

      modalRef.current?.close();
    },
    [data, onConfirm, onCancel],
  );

  // Opens the confirmation modal with data
  const confirm = useCallback((itemData: T) => {
    setData(itemData);
    modalRef.current?.open(itemData);
  }, []);

  // Returns the fully resolved modal props
  const renderConfirmationModal = useCallback((): ConfirmationModalProps => {
    // Resolve title
    let resolvedTitle: string | undefined = undefined;

    if (title) {
      resolvedTitle =
        typeof title === "function" && data ? title(data) : (title as string);
    }

    // Resolve message
    let resolvedMessage: ReactNode = "Är du säker?";

    if (message) {
      if (typeof message === "function" && data) {
        resolvedMessage = message(data);
      } else {
        resolvedMessage = message as ReactNode;
      }
    }

    return {
      title: resolvedTitle,
      message: resolvedMessage,
      confirmLabel,
      cancelLabel,
      confirmColor,
      response: handleResponse,
    };
  }, [
    title,
    message,
    confirmLabel,
    cancelLabel,
    confirmColor,
    handleResponse,
    data,
  ]);

  return {
    modalRef,
    confirm,
    renderConfirmationModal,
  };
}
