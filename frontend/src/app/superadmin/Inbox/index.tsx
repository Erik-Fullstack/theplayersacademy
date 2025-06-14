import { useState, useRef, useMemo, useEffect } from "react";
import { Pagination } from "@heroui/react";

import MessageList from "@/app/superadmin/Inbox/messageList";
import Section from "@/components/layout/Section";
import OpenMessageModal from "@/app/superadmin/Inbox/openMessageModal";
import OpenMessage from "@/app/superadmin/Inbox/openMessage";
import GeneralModal, { GeneralModalRef } from "@/components/common/Modals/Modal";
import { IFeedback } from "@/types/models/feedback";
import { useApi } from "@/services/useApi";

export default function Page() {
  const [selected, setSelected] = useState<IFeedback | null>(null);
  const [page, setPage] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const modalRef = useRef<GeneralModalRef>(null);
  const api = useApi();

  const {
    data: feedbackResponse,
    isLoading,
    isError,
    error,
  } = api.feedback.useList();

  const feedback = (feedbackResponse?.data || []).slice().reverse();

  const rowsPerPage = 4;

  const pages = Math.ceil(feedback.length / rowsPerPage);

  const paginatedFeedback = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return feedback.slice(start, end);
  }, [page, feedback]);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.innerWidth >= 768 &&
      feedback.length > 0 &&
      !selected
    ) {
      setSelected(feedback[0]);
    }
  }, [feedback, selected]);

  const handleOpen = (msg: IFeedback) => {
    const index = feedback.findIndex((f) => f.id === msg.id);

    if (index !== -1) {
      setSelectedIndex(index);
    }
    if (window.innerWidth < 768) {
      modalRef.current?.open(index);
    }
    setSelected(msg);
  };

  const updatePageFromIndex = (index: number) => {
    const newPage = Math.floor(index / rowsPerPage) + 1;

    setPage(newPage);
  };

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex + 1 < feedback.length) {
      const nextIndex = selectedIndex + 1;

      setSelectedIndex(nextIndex);
      updatePageFromIndex(nextIndex);
      modalRef.current?.open(nextIndex);
    }
  };
  const handlePrev = () => {
    if (selectedIndex !== null && selectedIndex - 1 >= 0) {
      const prevIndex = selectedIndex - 1;

      setSelectedIndex(prevIndex);
      updatePageFromIndex(prevIndex);
      modalRef.current?.open(prevIndex);
    }
  };

  const isEmpty = feedback.length === 0;

  return (
    <>
      {/* Header Section - Always visible */}
      <Section>
        <h1>Inkorg</h1>
        <p>
          Här hittar du all feedback från användare. Klicka på ett meddelande
          för att läsa mer.
        </p>
        {isEmpty && (
          <p className="text-gray-400 italic py-6">
            Inga meddelanden i inkorgen ännu.
          </p>
        )}

        {/* Loading and Error States */}
        {isLoading && <p>Laddar inkorg...</p>}
        {isError && <p>Fel: {error?.message}</p>}
      </Section>

      {/* Content Section - Conditional based on loading, error, and message count */}
      {!isLoading && !isError && (
        <>
          {!isEmpty && (
            // Red background section - only when there are messages
            <Section className="bg-branding3">
              <div className="flex flex-col md:flex-row">
                <MessageList
                  feedback={paginatedFeedback}
                  selected={selected}
                  onOpen={handleOpen}
                />

                <div className="hidden md:block flex-1 ml-5">
                  {selected && <OpenMessage feedback={selected} />}
                </div>
              </div>

              {/* Pagination - only show when there are messages */}
              <div className="flex w-full p-2 mt-4">
                <Pagination
                  showControls
                  showShadow
                  color="warning"
                  page={page}
                  total={pages}
                  onChange={(page) => setPage(page)}
                />
              </div>
            </Section>
          )}
        </>
      )}

      {/* Message modal for mobile */}
      <GeneralModal ref={modalRef} title="Meddelande">
        {(data) => {
          const index = data as number | null;

          if (index === null || index < 0 || index >= feedback.length) {
            return null;
          }

          const currentFeedback = feedback[index];

          return (
            <div className="flex flex-col">
              <OpenMessageModal feedback={currentFeedback} />
              <div className="flex justify-between items-center mb-4">
                <button
                  disabled={index === 0}
                  className="text-sm text-gray-500 disabled:opacity-30"
                  onClick={handlePrev}
                >
                  ← Föregående
                </button>
                <button
                  disabled={index === feedback.length - 1}
                  className="text-sm text-gray-500 disabled:opacity-30"
                  onClick={handleNext}
                >
                  Nästa →
                </button>
              </div>
            </div>
          );
        }}
      </GeneralModal>
    </>
  );
}
