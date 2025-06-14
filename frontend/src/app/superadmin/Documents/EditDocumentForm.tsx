import DocumentForm from "./DocumentForm";

import { EditDocumentWithFormProps } from "@/types";

export default function EditDocumentForm({
  modalRef,
  documentData,
}: EditDocumentWithFormProps) {
  return (
    <DocumentForm modalRef={modalRef} mode="edit" documentData={documentData} />
  );
}
