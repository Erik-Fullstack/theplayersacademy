import { useEffect, useState } from "react";
import { Button, Input, Textarea } from "@heroui/react";

import { ICourse } from "@/types/models/course";

// Create a separate component for the modal content
export default function CourseForm({
  data,
  onSave,
  onCancel,
}: {
  data?: ICourse;
  onSave: (courseData: {
    name: string;
    description: string;
    learnifierId: string;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  // Move useState calls to the top level of this component
  const [name, setName] = useState(data?.name || "");
  const [description, setDescription] = useState(data?.description || "");
  const [learnifierId, setLearnifierId] = useState(data?.learnifierId || "");
  const isEditMode = !!data;

  // Use useEffect to update state when data changes
  useEffect(() => {
    if (data) {
      setName(data.name);
      setDescription(data.description);
      setLearnifierId(data.learnifierId);
    } else {
      setName("");
      setDescription("");
      setLearnifierId("");
    }
  }, [data]);

  const handleSubmit = async () => {
    await onSave({
      name,
      description,
      learnifierId,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="font-medium" htmlFor="course-name-input">
          Titel:
        </label>
        <Input
          id="course-name-input"
          value={name}
          placeholder="Ange kursens titel"
          className="w-full"
          onValueChange={setName}
        />
      </div>

      <div>
        <label className="font-medium" htmlFor="course-description-input">
          Beskrivning:
        </label>
        <Textarea
          id="course-description-input"
          value={description}
          placeholder="Ange kursens beskrivning"
          className="w-full"
          onValueChange={setDescription}
        />
      </div>

      <div>
        <label className="font-medium" htmlFor="course-learnifierid-input">
          Learnifier ID:
        </label>
        <Input
          id="course-learnifierid-input"
          value={learnifierId}
          placeholder="Ange Learnifier ID"
          className="w-full"
          onValueChange={setLearnifierId}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button size="sm" color="default" variant="light" onPress={onCancel}>
          Avbryt
        </Button>
        <Button size="sm" color="success" onPress={handleSubmit}>
          {isEditMode ? "Spara" : "Skapa"}
        </Button>
      </div>
    </div>
  );
}
