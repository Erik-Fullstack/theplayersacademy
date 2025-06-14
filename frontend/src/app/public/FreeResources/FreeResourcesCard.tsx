import { useRef } from "react";
import { Button, Card, Link } from "@heroui/react";

import { GeneralModalRef } from "../../../components/common/Modals/Modal";

import FreeMaterialModal from "./FreeResourcesModal";

import { API_BASE_URL } from "@/config/api";
import defaultImage from "@/assets/images/tobias-flyckt-5yNJx9NO3Yc-unsplash.jpg";
import { IDocument } from "@/types";

export default function FreeMaterialCard({
  id,
  title,
  description,
  fileURL,
  imgURL,
}: IDocument) {
  const modalRef = useRef<GeneralModalRef>(null);

  const openModal = () => {
    modalRef.current?.open();
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
            <Button
              isIconOnly
              color="success"
              className=" rounded-full"
              aria-label="Ladda ner dokument"
            >
              <img
                src="/Download_icon.svg"
                alt="download icon"
                className="w-6"
              />
            </Button>
          </Link>

          <div className="flex gap-2 w-44 md:w-64">
            <Button className="bg-yellow-500 w-full" onPress={openModal}>
              Läs mer...
            </Button>
          </div>
        </div>
      </Card>
      <FreeMaterialModal
        modalRef={modalRef}
        document={{ id, title, description, fileURL, imgURL }}
      />
    </>
  );
}
