import { useState, useRef } from "react";
import { Button } from "@heroui/react";
import { MdFeedback } from "react-icons/md";

import FeedbackFormModal from "@/components/features/Feedback/FeedbackFormModal";
import { GeneralModalRef } from "@/components/common/Modals/Modal";

export default function FeedBackButton() {
  const [submitted, setSubmitted] = useState(false);
  const modalRef = useRef<GeneralModalRef>(null);

  const openModal = () => {
    setSubmitted(false);
    modalRef.current?.open();
  };

  return (
    <>
      <FeedbackFormModal
        modalRef={modalRef}
        submitted={submitted}
        setSubmitted={setSubmitted}
      />
      <Button
        isIconOnly
        className="fixed bottom-6 right-6 bg-red-900 w-12 h-12 sm:w-16 sm:h-16 z-10 "
        radius="full"
        onPress={openModal}
      >
        <MdFeedback className="w-7 h-7 sm:w-9 sm:h-9" color="white" />
      </Button>
    </>
  );
}
