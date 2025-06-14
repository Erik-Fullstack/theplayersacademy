import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Checkbox,
} from "@heroui/react";

interface Coach {
  id: string;
  name: string;
  team: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (selected: Coach[]) => void;
}

export default function AddCoachModal({ isOpen, onClose, onAdd }: Props) {
  const [search, setSearch] = useState("");
  const [selectedCoachIds, setSelectedCoachIds] = useState<string[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([
    { id: "1", name: "Åke Olsson", team: "Flickor 2018" },
    { id: "2", name: "Sara Persson", team: "Flickor 2018" },
    { id: "3", name: "Ola Svensson", team: "Pojkar 2017" },
  ]);

  const [newName, setNewName] = useState("");
  const [newTeam, setNewTeam] = useState("");

  const toggleSelect = (id: string) => {
    setSelectedCoachIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleAddNewCoach = () => {
    if (!newName.trim()) return;
    const newCoach: Coach = {
      id: Date.now().toString(),
      name: newName.trim(),
      team: newTeam.trim() || "Ej tilldelat",
    };

    setCoaches((prev) => [...prev, newCoach]);
    setSelectedCoachIds((prev) => [...prev, newCoach.id]);
    setNewName("");
    setNewTeam("");
  };

  const handleConfirmAdd = () => {
    const selectedCoaches = coaches.filter((c) =>
      selectedCoachIds.includes(c.id),
    );

    onAdd(selectedCoaches);
    onClose();
  };

  const filteredCoaches = coaches.filter((coach) =>
    coach.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent className="p-6">
        <ModalHeader>Lägg till tränare</ModalHeader>
        <ModalBody>
          {/* Sökfält */}
          <Input
            placeholder="Sök tränare"
            value={search}
            className="mb-4"
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Lista med tränare */}
          <div className="space-y-3 max-h-[200px] overflow-y-auto mb-4">
            {filteredCoaches.map((coach) => (
              <div key={coach.id} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{coach.name}</p>
                  <p className="text-sm text-gray-600">{coach.team}</p>
                </div>
                <Checkbox
                  isSelected={selectedCoachIds.includes(coach.id)}
                  onChange={() => toggleSelect(coach.id)}
                />
              </div>
            ))}
          </div>

          {/* Lägg till ny tränare */}
          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-semibold mb-2">Lägg till ny tränare</p>
            <Input
              placeholder="Namn"
              value={newName}
              className="mb-2"
              onChange={(e) => setNewName(e.target.value)}
            />
            <Input
              placeholder="Lag (valfritt)"
              value={newTeam}
              className="mb-2"
              onChange={(e) => setNewTeam(e.target.value)}
            />
            <Button
              className="bg-green-500 text-white w-full"
              isDisabled={!newName.trim()}
              onPress={handleAddNewCoach}
            >
              ➕ Lägg till tränare
            </Button>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Avbryt
          </Button>
          <Button color="primary" onPress={handleConfirmAdd}>
            Lägg till valda
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
