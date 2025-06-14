import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
} from "@heroui/react";

interface Props {
  isOpen: boolean;
  initialValue: string;
  onClose: () => void;
  onSave: (newDescription: string) => void;
}

export default function EditDescriptionModal({
  isOpen,
  initialValue,
  onClose,
  onSave,
}: Props) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent className="p-6">
        <ModalHeader>Ändra kursbeskrivning</ModalHeader>
        <ModalBody>
          <Textarea
            rows={5}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Avbryt
          </Button>
          <Button color="primary" onPress={() => onSave(value)}>
            Spara
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
