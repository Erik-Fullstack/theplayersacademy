import { Button, Link } from "@heroui/react";

import GeneralModal, {
  GeneralModalRef,
} from "../../../components/common/Modals/Modal";

import { API_BASE_URL } from "@/config/api";
import defaultImage from "@/assets/images/tobias-flyckt-5yNJx9NO3Yc-unsplash.jpg";
import { IDocument } from "@/types";

type Props = {
  modalRef: React.RefObject<GeneralModalRef>;
  document: IDocument;
};

export default function FreeMaterialModal({ modalRef, document }: Props) {
  return (
    <GeneralModal ref={modalRef} title={document.title}>
      {() => {
        return (
          <div>
            <p className="mb-3">{document.description}</p>
            <div className="flex flex-col gap-2">
              <img
                src={
                  document.imgURL
                    ? `${API_BASE_URL}/${document.imgURL}`
                    : defaultImage
                }
                alt={document.title}
                className="rounded-lg object-cover w-full max-h-64"
              />
              <Link href={`${API_BASE_URL}/${document.fileURL}`}>
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
            </div>
          </div>
        );
      }}
    </GeneralModal>
  );
}
