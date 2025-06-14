import { useQueryClient } from "@tanstack/react-query";
import { addToast } from "@heroui/react";

import CourseForm from "./CourseForm";

import { ICourse } from "@/types/models/course";
import { createCourseApiHooks } from "@/services/api/entities/courses";
import GeneralModal, { GeneralModalRef } from "@/components/common/Modals/Modal";

export default function CourseTableModal({
  modalRef,
}: {
  modalRef: React.RefObject<GeneralModalRef>;
}) {
  const queryClient = useQueryClient();
  const { useUpdate, useCreate } = createCourseApiHooks(queryClient);
  const { mutateAsync: updateCourse } = useUpdate();
  const { mutateAsync: createCourse } = useCreate();

  const handleSave = async (
    data: ICourse | undefined,
    formData: {
      name: string;
      description: string;
      learnifierId: string;
    },
  ) => {
    try {
      if (data) {
        // Update existing course
        await updateCourse({
          id: data.id,
          data: formData,
        });

        addToast({
          title: "Kursen uppdaterad!",
          description: "Ändringarna har sparats",
          color: "success",
          timeout: 5000,
          icon: "mingcute:check-circle-fill"
        });
      } else {
        // Create new course
        await createCourse({
          ...formData,
          playerCount: 0,
          trainerCount: 0,
          image: "",
          loginLink: "",
        });

        addToast({
          title: "Ny kurs skapad!",
          description: "Kursen har skapats",
          color: "success",
          timeout: 5000,
          icon: "mingcute:check-circle-fill"
        });
      }

      modalRef.current?.close();
    } catch (err) {
      console.error("Fel vid sparande:", err);
      addToast({
        title: "Fel vid sparande",
        description: "Något gick fel. Försök igen.",
        color: "danger",
        timeout: 5000,
        icon: "mingcute:alert-fill"
      });
    }
  };

  return (
    <GeneralModal ref={modalRef} title="Kurs">
      {(data) => (
        <CourseForm
          data={data as ICourse}
          onSave={(formData) => handleSave(data as ICourse, formData)}
          onCancel={() => modalRef.current?.close()}
        />
      )}
    </GeneralModal>
  );
}
