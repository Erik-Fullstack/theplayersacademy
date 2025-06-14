import { useState, useRef, useEffect } from "react";
import { Input, Textarea, Button, addToast } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";

import { API_BASE_URL } from "@/config/api";
import { useApi } from "@/services/useApi";
import GeneralModal, { GeneralModalRef } from "@/components/common/Modals/Modal";
import { IDocument } from "@/types";

const validDocumentTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/powerpoint",
  "application/x-mspowerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.presentationml",
];

const validImageTypes = ["image/jpeg", "image/png", "image/gif"];

// Common extension list
const validExtensions = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"];

interface DocumentFormProps {
  modalRef: React.RefObject<GeneralModalRef>;
  mode: "create" | "edit";
  documentData?: IDocument; // Optional for create mode, required for edit mode
}

export default function DocumentForm({
  modalRef,
  mode,
  documentData,
}: DocumentFormProps) {
  // State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Services
  const queryClient = useQueryClient();
  const api = useApi();

  // Initialize the form with existing data for edit mode
  useEffect(() => {
    if (mode === "edit" && documentData) {
      setTitle(documentData.title || "");
      setDescription(documentData.description || "");
      // Can't set existing files, but we'll display their names
    }
  }, [mode, documentData]);

  // API mutations
  const { mutate: createDocument, isPending: isCreating } =
    api.documents.useCreate({
      onSuccess: handleSuccess,
      onError: handleError,
    });

  const { mutate: updateDocument, isPending: isUpdating } =
    api.documents.useUpdate({
      onSuccess: handleSuccess,
      onError: handleError,
    });

  // Common success handler
  function handleSuccess() {
    addToast({
      title: mode === "create" ? "Dokument tillagt" : "Dokument uppdaterat",
      description:
        mode === "create"
          ? "Ditt dokument har laddats upp"
          : "Dokumentet har uppdaterats",
      icon: "mingcute:check-circle-fill",
      timeout: 5000,
      color: "success"
    });

    resetForm();
    modalRef.current?.close();
    queryClient.invalidateQueries({ queryKey: ["documents"] });
  }

  // Common error handler
  function handleError(error: any) {
    console.error(
      `Failed to ${mode === "create" ? "create" : "update"} document:`,
      error
    );
    addToast({
      title: "Misslyckades",
      description:
        mode === "create"
          ? "Kunde inte ladda upp dokumentet. Vänligen försök igen."
          : "Kunde inte uppdatera dokumentet. Vänligen försök igen.",
      color: "danger",
      timeout: 5000,
      icon: "mingcute:alert-fill"
    });
  }

  // File handlers
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    console.log("Selected document:", file.name, "MIME type:", file.type);

    const fileExt = file.name.split(".").pop()?.toLowerCase();

    if (
      validDocumentTypes.includes(file.type) ||
      (fileExt && validExtensions.includes(fileExt))
    ) {
      setSelectedDocument(file);
      setDocumentError(null);
    } else {
      setSelectedDocument(null);
      setDocumentError(
        "Ogiltig filtyp. Tillåtna format: PDF, Word, Excel, PowerPoint"
      );
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setRemoveImage(false); // Reset remove flag if user selects new image

    if (validImageTypes.includes(file.type)) {
      setSelectedImage(file);
      setImageError(null);
    } else {
      setSelectedImage(null);
      setImageError("Ogiltig bildformat. Tillåtna format: JPEG, PNG, GIF");
    }
  };

  // Form submit handler
  const handleSubmit = () => {
    if (!title.trim()) {
      addToast({
        title: "Titel saknas",
        description: "Vänligen ange en titel för dokumentet",
        color: "warning",
        timeout: 5000,
        icon: "mingcute:alert-fill"
      });

      return;
    }

    // Create mode requires a document
    if (mode === "create" && !selectedDocument) {
      addToast({
        title: "Dokument saknas",
        description: "Vänligen välj ett dokument att ladda upp",
        color: "warning",
        timeout: 5000,
        icon: "mingcute:alert-fill"
      });

      return;
    }

    // Create FormData for multipart upload
    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);

    // For edit mode, handle the removeImage flag
    if (mode === "edit" && removeImage) {
      formData.append("removeImage", "true");
    }

    // Add files if selected
    if (selectedDocument) {
      formData.append("file", selectedDocument);
    }

    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    // Log what we're about to send
    console.log(`Preparing to ${mode} document:`, {
      title,
      description,
      document: selectedDocument
        ? {
            name: selectedDocument.name,
            type: selectedDocument.type,
            size: selectedDocument.size,
          }
        : mode === "edit"
          ? "Unchanged"
          : "None",
      image: selectedImage
        ? {
            name: selectedImage.name,
            type: selectedImage.type,
            size: selectedImage.size,
          }
        : removeImage
          ? "Removed"
          : "Unchanged/None",
    });

    // Use the appropriate API call based on mode
    if (mode === "create") {
      createDocument(formData);
    } else if (mode === "edit" && documentData?.id) {
      updateDocument({ id: documentData.id, formData });
    }
  };

  // Reset the form
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedDocument(null);
    setSelectedImage(null);
    setDocumentError(null);
    setImageError(null);
    setRemoveImage(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const isPending = isCreating || isUpdating;
  const modalTitle =
    mode === "create" ? "Lägg till nytt dokument" : "Redigera dokument";
  const submitButtonText = mode === "create" ? "Lägg till" : "Spara ändringar";

  return (
    <GeneralModal ref={modalRef} title={modalTitle}>
      {() => (
        <div className="w-full flex flex-col gap-4">
          <div className="flex w-full gap-10">
            <div className="flex flex-col w-3/4 gap-3">
              {/* Titel */}
              <Input
                isRequired
                label="Titel"
                labelPlacement="outside"
                placeholder="Dokumentets titel"
                value={title}
                className="mb-2"
                onChange={(e) => setTitle(e.target.value)}
              />
              {/* Beskrivning */}
              <Textarea
                label="Beskrivning"
                labelPlacement="outside"
                placeholder="En kort beskrivning av dokumentet"
                value={description}
                className="mb-2"
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex flex-col items-end h-full gap-3 pt-5">
              <div
                className={`w-48 h-36 ${
                  selectedImage ||
                  (mode === "edit" && documentData?.imgURL && !removeImage)
                    ? "bg-transparent"
                    : "bg-gray-100"
                } rounded-2xl flex flex-col justify-center items-center`}
              >
                {selectedImage && (
                  <div className="mb-1 mt-2">
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="Preview"
                      className="max-h-32 object-contain rounded-2xl"
                      onLoad={() => {
                        return () =>
                          URL.revokeObjectURL(
                            URL.createObjectURL(selectedImage),
                          );
                      }}
                    />
                  </div>
                )}
                {!selectedImage &&
                  mode === "edit" &&
                  documentData?.imgURL &&
                  !removeImage && (
                    <div className="mt-2 mb-4">
                      <img
                        src={`${API_BASE_URL}/${documentData.imgURL}`}
                        alt="Current preview"
                        className="max-h-32 object-contain"
                      />
                    </div>
                  )}
                <span className="text-sm">
                  {selectedImage
                    ? selectedImage.name
                    : mode === "edit" && documentData?.imgURL && !removeImage
                      ? "Nuvarande bild"
                      : "Ingen bild vald"}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  color="primary"
                  variant="bordered"
                  as="label"
                  htmlFor="image-upload"
                  className="cursor-pointer"
                >
                  Välj bild
                </Button>
                {mode === "edit" &&
                  documentData?.imgURL &&
                  !selectedImage &&
                  !removeImage && (
                    <Button
                      color="danger"
                      variant="light"
                      onPress={() => setRemoveImage(true)}
                    >
                      Ta bort bild
                    </Button>
                  )}
                {removeImage && (
                  <Button
                    color="primary"
                    variant="light"
                    onPress={() => setRemoveImage(false)}
                  >
                    Ångra
                  </Button>
                )}
              </div>
              <input
                ref={imageInputRef}
                id="image-upload"
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleImageChange}
              />
              {imageError && (
                <p className="text-danger text-sm mt-1">{imageError}</p>
              )}
            </div>
          </div>
          {/* Välj dokument */}
          <div className="flex justify-between items-end">
            <div>
              <p className="block text-sm font-medium mb-2">Dokument</p>
              <div className="flex items-center gap-3">
                <Button
                  color="primary"
                  as="label"
                  htmlFor="document-upload"
                  className="cursor-pointer"
                >
                  Välj dokument
                </Button>
                <span className="text-sm">
                  {selectedDocument
                    ? selectedDocument.name
                    : mode === "edit" && documentData?.fileURL
                      ? "Befintligt dokument"
                      : "Ingen fil vald"}
                </span>
              </div>
              <input
                ref={fileInputRef}
                id="document-upload"
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                onChange={handleDocumentChange}
              />
              {documentError && (
                <p className="text-danger text-sm mt-1">{documentError}</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                color="danger"
                variant="light"
                isDisabled={isPending}
                onPress={() => {
                  resetForm();
                  modalRef.current?.close();
                }}
              >
                Avbryt
              </Button>
              <Button
                color="success"
                isLoading={isPending}
                isDisabled={
                  isPending ||
                  !title ||
                  (mode === "create" && !selectedDocument)
                }
                onPress={handleSubmit}
              >
                {submitButtonText}
              </Button>
            </div>
          </div>
        </div>
      )}
    </GeneralModal>
  );
}
