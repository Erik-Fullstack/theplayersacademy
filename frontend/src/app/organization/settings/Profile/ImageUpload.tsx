import { useState, useEffect } from "react";
import { Button } from "@heroui/react";

import { API_BASE_URL } from "@/config/api";

interface ImageUploadProps {
  selectedImage: File | null;
  setSelectedImage: (file: File | null) => void;
  currentLogo: string | null | undefined;
  onRemove: () => void;
}

const validTypes = ["image/jpeg", "image/png"];

export default function ImageUpload({
  selectedImage,
  setSelectedImage,
  currentLogo,
  onRemove,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileFormatStatus, setFileFormatStatus] = useState<
    "ok" | "error" | null
  >(null);

  // Handle existing logo when component mounts
  useEffect(() => {
    if (selectedImage) {
      // If a new image is selected, show its preview
      setPreview(URL.createObjectURL(selectedImage));
    } else if (currentLogo) {
      // If using current logo from the server, display it
      const logoUrl = currentLogo.startsWith("http")
        ? currentLogo
        : `${API_BASE_URL}/${currentLogo}`;

      setPreview(logoUrl);
    } else {
      // No image
      setPreview(null);
    }
  }, [selectedImage, currentLogo]);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (validTypes.includes(file.type)) {
      setSelectedImage(file);
      setFileFormatStatus("ok");
    } else {
      setFileFormatStatus("error");
      setSelectedImage(null);
      onRemove();
    }
  };

  const handleRemove = () => {
    setSelectedImage(null);
    setPreview(null);
    setFileFormatStatus(null);
    onRemove();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h4 className="text-lg font-semibold">Logga</h4>

      {preview ? (
        <div className="border p-8 rounded-md">
          <img
            src={preview}
            alt="Preview"
            className="w-32 h-32 rounded-full object-cover"
          />
        </div>
      ) : (
        <div className="p-16 rounded-md bg-gray-200 flex items-center justify-center text-gray-500">
          Ingen bild vald
        </div>
      )}

      <p
        className={`text-sm ${
          fileFormatStatus === "error" ? "text-red-500" : "text-black"
        }`}
      >
        {fileFormatStatus === "error"
          ? "❌ Fel filformat! Använd JPG eller PNG."
          : "Filformat: JPG eller PNG"}
      </p>

      <div className="flex gap-4">
        <label className="cursor-pointer bg-[#016fee] text-white p-2 rounded-xl text-md">
          {preview ? "Ändra bild" : "Ladda upp bild"}
          <input
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>

        <Button
          color="danger"
          className="text-white"
          isDisabled={!preview}
          onPress={handleRemove}
        >
          Ta bort
        </Button>
      </div>
    </div>
  );
}
