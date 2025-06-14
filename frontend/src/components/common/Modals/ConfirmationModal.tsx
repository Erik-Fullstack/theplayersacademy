import { Button } from "@heroui/react";
import { ReactNode } from "react";

interface ConfirmationModalProps {
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: "primary" | "success" | "warning" | "danger";
  response: (confirmed: boolean) => void;
}

export default function ConfirmationModal({
  message,
  confirmLabel = "Ja",
  cancelLabel = "Avbryt",
  confirmColor = "warning",
  response,
}: ConfirmationModalProps) {
  return (
    <div>
      <div className="py-2">{message}</div>
      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="light"
          className="min-w-[80px]"
          onPress={() => response(false)}
        >
          {cancelLabel}
        </Button>
        <Button
          color={confirmColor}
          className="min-w-[80px]"
          onPress={() => response(true)}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}
