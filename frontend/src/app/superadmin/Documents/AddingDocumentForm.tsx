import DocumentForm from "@/app/superadmin/Documents/DocumentForm";
import { AddDocumentWithFormProps } from "@/types";

export default function AddingDocumentForm({
  modalRef,
}: AddDocumentWithFormProps) {
  return <DocumentForm modalRef={modalRef} mode="create" />;
}
