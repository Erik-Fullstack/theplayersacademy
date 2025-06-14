import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react";
import { addToast } from "@heroui/react";

interface CreateOrgModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateOrgModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateOrgModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    ownerEmail: "",
    ownerFirstName: "",
    ownerLastName: "",
    ownerPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleSubmit = () => {
    if (
      !formData.name.trim() ||
      !formData.ownerEmail.trim() ||
      !formData.ownerFirstName.trim() ||
      !formData.ownerLastName.trim() ||
      !formData.ownerPassword.trim()
    ) {
      addToast({
        title: "Fel",
        description: "Alla fält måste fyllas i",
        color: "warning",
        icon: "mingcute:alert-fill",
        timeout: 5000
      });

      return;
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Skapa ny förening</ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <Input
              id="org-name"
              label="Föreningsnamn"
              placeholder="Ange föreningsnamn"
              value={formData.name}
              onChange={handleChange("name")}
            />
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-4">
                Administratörsinformation
              </h3>
              <div className="flex flex-col gap-4">
                <Input
                  id="owner-email"
                  label="E-post"
                  placeholder="Ange e-postadress"
                  type="email"
                  value={formData.ownerEmail}
                  onChange={handleChange("ownerEmail")}
                />
                <Input
                  id="owner-firstname"
                  label="Förnamn"
                  placeholder="Ange förnamn"
                  value={formData.ownerFirstName}
                  onChange={handleChange("ownerFirstName")}
                />
                <Input
                  id="owner-lastname"
                  label="Efternamn"
                  placeholder="Ange efternamn"
                  value={formData.ownerLastName}
                  onChange={handleChange("ownerLastName")}
                />
                <Input
                  id="owner-password"
                  label="Lösenord"
                  placeholder="Ange lösenord"
                  type="password"
                  value={formData.ownerPassword}
                  onChange={handleChange("ownerPassword")}
                />
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Avbryt
          </Button>
          <Button color="primary" isLoading={isLoading} onPress={handleSubmit}>
            Skapa
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
