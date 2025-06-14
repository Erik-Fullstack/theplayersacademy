import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { forwardRef, useImperativeHandle, useState } from "react";

export interface GeneralModalRef {
  open: (data?: unknown) => void;
  close: () => void;
  getData: () => unknown;
}

interface GeneralModalProps {
  title?: string | ((data: unknown) => string | React.ReactNode);
  footer?: React.ReactNode;
  size?:
    | "2xl"
    | "xs"
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "full"
    | undefined;
  children?: (data: unknown) => React.ReactNode;
}
const GeneralModal = forwardRef<GeneralModalRef, GeneralModalProps>(
  ({ title, footer, children, size = "2xl" }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState<unknown>(null);

    useImperativeHandle(ref, () => ({
      open: (newData) => {
        setData(newData);
        setIsOpen(true);
      },
      close: () => setIsOpen(false),
      getData: () => data,
    }));

    const modalTitle = typeof title === "function" ? title(data) : title;

    return (
      <Modal
        isOpen={isOpen}
        size={size}
        scrollBehavior="inside"
        onClose={() => setIsOpen(false)}
      >
        <ModalContent>
          <ModalHeader>{modalTitle}</ModalHeader>
          <ModalBody className="mb-4">
            {typeof children === "function" ? children(data) : children}
          </ModalBody>
          {footer && <ModalFooter>{footer}</ModalFooter>}
        </ModalContent>
      </Modal>
    );
  },
);

GeneralModal.displayName = "GeneralModal";

export default GeneralModal;
