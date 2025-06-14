import type { GeneralModalRef } from "@/components/common/Modals/Modal";

import { useRef } from "react";
import { Button } from "@heroui/react";

import { useApi } from "@/services/useApi";
import Section from "@/components/layout/Section";
import DocumentCard from "@/app/superadmin/Documents/DocumentCard";
import AddingDocumentForm from "@/app/superadmin/Documents/AddingDocumentForm";

export default function Page() {
  const api = useApi();
  const modalRef = useRef<GeneralModalRef>(null);

  const {
    data: docResponse,
    isLoading,
    isError,
    error,
  } = api.documents.useList();

  if (isLoading) return <>Laddar dokument...</>;
  if (isError) return <>Fel: {error.message}</>;

  const document = (docResponse?.data || [])
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
    );

  //Öppna modal för lägga till dokument
  const openModalForAdding = () => {
    modalRef.current?.open();
  };

  const isEmpty = document.length === 0;

  return (
    <>
      <Section>
        <h1>Hantera dokument</h1>
        <p>
          Här kan du ladda upp, redigera och ta bort gratismaterial som ska vara
          tillgängligt för alla besökare på hemsidan. Se till att innehållet är
          aktuellt och relevant.
        </p>
        <div className="flex justify-end mt-8">
          <Button className="bg-warning" onPress={openModalForAdding}>
            + Lägg till dokument
          </Button>
        </div>
      </Section>

      {isEmpty ? (
        <p className="text-center italic text-gray-700">
          Du har inte laddat upp något material än
        </p>
      ) : (
        <Section className="bg-branding3">
          <article className="flex flex-col gap-5">
            {document.map((doc) => (
              <DocumentCard
                key={doc.id}
                title={doc.title}
                description={doc.description}
                fileURL={doc.fileURL}
                id={doc.id}
                imgURL={doc.imgURL}
              />
            ))}
          </article>
        </Section>
      )}
      <AddingDocumentForm modalRef={modalRef} />
    </>
  );
}
