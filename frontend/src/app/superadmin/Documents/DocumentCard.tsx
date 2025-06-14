import { useRef, useState } from "react";
import { Button, Card, addToast, Link } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";

import EditDocumentForm from "./EditDocumentForm";

import { API_BASE_URL } from "@/config/api";
import { useApi } from "@/services/useApi";
import { GeneralModalRef } from "@/components/common/Modals/Modal";
import { IDocument, FormData } from "@/types";
import defaultImage from "@/assets/images/tobias-flyckt-5yNJx9NO3Yc-unsplash.jpg";

export default function DocumentCard({
  id,
  title,
  description,
  fileURL,
  imgURL,
}: IDocument) {
  const modalRef = useRef<GeneralModalRef>(null);
  const [documentData, setDocumentData] = useState<IDocument>({
    id,
    title,
    description,
    fileURL,
    imgURL,
  });

  const api = useApi();
  const queryClient = useQueryClient();

  //DELETE
  const { mutate: deleteDocument, isPending: isDeleting } =
    api.documents.useDelete({
      onSuccess: () => {
        addToast({
          title: "Dokumentet raderat",
          description: "Dokumentet har raderats",
          timeout: 5000,
          color: "success",
          icon: "mingcute:check-circle-fill",
        });

        queryClient.invalidateQueries({ queryKey: ["documents"] });
      },
      onError: (error) => {
        console.error("Error deleting document:", error);

        addToast({
          title: "Kunde inte radera",
          description: "Ett fel uppstod när dokumentet skulle raderas",
          color: "danger",
          timeout: 5000,
          icon: "mingcute:alert-fill",
        });
      },
    });

  const handleDeleteDocument = () => deleteDocument(id);

  //ÖPPNA MODAL FÖR REDIGERING
  const openModalForEditing = () => {
    modalRef.current?.open();
    setDocumentData({
      id,
      title,
      description,
      fileURL,
      imgURL,
    });
  };

  return (
    <>
      <Card key={id} className="p-6 gap-2">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="flex-1">
            <h5>{title}</h5>
            <p className="line-clamp-5">{description}</p>
          </div>
          <div className="md:w-64 h-44 md:h-auto min-h-28 mt-6 md:mt-0">
            <img
              src={imgURL ? `${API_BASE_URL}/${imgURL}` : defaultImage}
              alt={title}
              className="rounded-lg object-cover w-full h-40"
            />
          </div>
        </div>

        <div className="flex flex-row justify-between">
          <Link href={`${API_BASE_URL}/${fileURL}`}>
            <Button isIconOnly color="success" className=" rounded-full">
              <img
                src="/Download_icon.svg"
                alt="download icon"
                className="w-6"
              />
            </Button>
          </Link>

          <div className="flex gap-2 md:w-64">
            <Button
              className="bg-yellow-500 w-full"
              onPress={openModalForEditing}
            >
              Redigera
            </Button>
            <Button
              className="border-medium border-red-800 bg-white w-full"
              isDisabled={isDeleting}
              onPress={handleDeleteDocument}
            >
              {isDeleting ? "Tar bort..." : "Ta bort"}
            </Button>
          </div>
        </div>
      </Card>
      <EditDocumentForm modalRef={modalRef} documentData={documentData} />
    </>
  );
}
