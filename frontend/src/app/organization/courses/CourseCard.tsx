import { useState, useRef } from "react";
import clsx from "clsx";
import { Card, Button } from "@heroui/react";
import { Icon } from "@iconify/react";

import EditDescriptionModal from "./EditDescriptionModal";
import AddCoachToCourseModal from "./AddCoachToCourseModal";

import GeneralModal, { GeneralModalRef } from "@/components/common/Modals/Modal";
import image from "@/assets/images/tobias-flyckt-5yNJx9NO3Yc-unsplash.jpg";
import { ICourse } from "@/types";

interface CourseCardProps {
  courseId: string;
  title: string;
  description: string;
  isAllAccess?: boolean;
  teamCount?: number;
  coachCount?: number;
  imageUrl?: string;
  onManage?: () => void;
  onDescriptionChange?: (newDescription: string) => void;
  onCoachAdded?: () => void;
  className?: string;
}

export default function CourseCard({
  courseId,
  title,
  description: initialDescription,
  imageUrl = image,
  onManage,
  onDescriptionChange,
  onCoachAdded,
  className,
  isAllAccess = true,
  teamCount = 0,
  coachCount = 0,
}: CourseCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [description, setDescription] = useState(initialDescription);
  const addCoachModalRef = useRef<GeneralModalRef>(null);

  const handleSaveDescription = (newDesc: string) => {
    setDescription(newDesc);
    setIsEditModalOpen(false);
    if (onDescriptionChange) onDescriptionChange(newDesc);
  };

  const handleCoachAdded = () => {
    addCoachModalRef.current?.close();
    if (onCoachAdded) onCoachAdded();
  };

  return (
    <>
      <Card
        className={clsx("w-full max-w-6xl  shadow rounded-2xl p-6", className)}
      >
        <div className="flex flex-col md:flex-row justify-between gap-6">
          {/* Vänster - Text */}
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-semibold">{title}</h3>
              {!isAllAccess && (
                <Button
                  className="bg-green-500 hover:bg-green-600"
                  onPress={onManage}
                >
                  Hantera kursen
                </Button>
              )}
            </div>

            <p className="text-gray-700 mt-2 line-clamp-3 overflow-hidden">
              {description}
            </p>

            {/* Lag och tränare info */}
            {!isAllAccess && (
              <p className="mt-4 text-gray-800 font-semibold">
                Lag: {teamCount} st, Tränare: {coachCount} st
              </p>
            )}

            {/* Knappar */}
            <div className="mt-4 flex flex-col md:flex-row gap-4">
              <Button
                variant="bordered"
                className="w-full"
                onPress={() => setIsEditModalOpen(true)} // ✅ Det här gör att modalen visas
              >
                Ändra beskrivning
              </Button>
              {!isAllAccess && (
                <Button
                  variant="bordered"
                  className="w-full"
                  startContent={<Icon icon="fluent:add-12-filled" />}
                  onPress={() => addCoachModalRef.current?.open()}
                >
                  + Lägg till tränare
                </Button>
              )}
            </div>
          </div>

          {/* Höger - Bild och Visa Kursen */}
          <div className="w-full md:w-64 flex flex-col items-center">
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Kursbild"
                className="rounded-lg object-cover w-full h-40"
              />
            )}
          </div>
        </div>
      </Card>

      {/* Modal: Ändra beskrivning */}
      <EditDescriptionModal
        isOpen={isEditModalOpen}
        initialValue={description}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveDescription}
      />

      {/* Modal: Lägg till tränare */}
      <GeneralModal ref={addCoachModalRef} title="Lägg till tränare" size="md">
        {() => (
          <AddCoachToCourseModal
            course={{ id: courseId, name: title } as ICourse}
            onSuccess={handleCoachAdded}
          />
        )}
      </GeneralModal>
    </>
  );
}
