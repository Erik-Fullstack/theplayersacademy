import { useState, useEffect } from "react";
import { Card, Button, Input, Textarea, addToast } from "@heroui/react";

import { useApi } from "@/services/useApi";

interface SectionEditorProps {
  pageId: string;
  sectionId?: string;
  section?: any;
  mode: "create" | "edit";
  onSave: (data?: any) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

export default function SectionEditor({
  pageId,
  sectionId,
  section,
  mode,
  onSave,
  onDelete,
  onCancel,
}: SectionEditorProps) {
  const api = useApi();

  // State for form fields
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const { mutate: updateSection } = api.pages.useUpdatePageSection();

  const titleQuery = api.pages.usePageContent(pageId, sectionId || "", "title");
  const textQuery = api.pages.usePageContent(pageId, sectionId || "", "text");

  // For edit mode, load content from API (only once)
  useEffect(() => {
    if (mode === "create" && !isInitialized) {
      setId("");
      setTitle("");
      setText("");
      setIsInitialized(true);

      return;
    }

    if (mode === "edit" && sectionId && !isInitialized) {
      if (section) {
        setId(section.id || "");
        setTitle(section.title || "");
        setText(section.text || "");
        setIsInitialized(true);

        return;
      }

      if (titleQuery.data !== undefined && textQuery.data !== undefined) {
        setTitle(titleQuery.data || "");
        setText(textQuery.data || "");
        setId(sectionId);
        setIsInitialized(true);
      }
    }
  }, [
    mode,
    sectionId,
    section,
    isInitialized,
    titleQuery.data,
    textQuery.data,
  ]);

  // Reset when switching between sections
  useEffect(() => {
    setIsInitialized(false);
    setId("");
    setTitle("");
    setText("");
  }, [sectionId, mode, pageId]);

  // Update section mutation
  const handleSave = async () => {
    setLoading(true);

    try {
      if (mode === "create") {
        // Save as new section
        onSave({
          sectionId: id,
          title,
          text,
        });
      } else {
        // Create a promise-based approach for sequential updates
        await new Promise<void>((resolve, reject) => {
          updateSection(
            {
              page: pageId,
              sectionId: sectionId!,
              update: {
                content: "title",
                updatedData: title,
              },
            },
            {
              onSuccess: () => {
                // Now update the text
                updateSection(
                  {
                    page: pageId,
                    sectionId: sectionId!,
                    update: {
                      content: "text",
                      updatedData: text,
                    },
                  },
                  {
                    onSuccess: () => {
                      addToast({
                        title: "Uppdaterad",
                        description: "Sektionen har uppdaterats",
                        color: "success",
                        timeout: 5000,
                        icon: "mingcute:check-circle-fill"
                      });
                      onSave();
                      resolve();
                    },
                    onError: (error) => {
                      console.error("Error updating section text:", error);
                      addToast({
                        title: "Fel",
                        description: "Kunde inte uppdatera sektionens text",
                        color: "danger",
                        timeout: 5000,
                        icon: "mingcute:alert-fill"
                      });
                      reject(error);
                    },
                  },
                );
              },
              onError: (error) => {
                console.error("Error updating section title:", error);
                addToast({
                  title: "Fel",
                  description: "Kunde inte uppdatera sektionens titel",
                  color: "danger",
                  timeout: 5000,
                  icon: "mingcute:alert-fill"
                });
                reject(error);
              },
            },
          );
        });
      }
    } catch (error) {
      console.error("Save operation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching content
  if (
    mode === "edit" &&
    sectionId &&
    !section &&
    (titleQuery.isLoading || textQuery.isLoading)
  ) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          <div>Laddar sektionsdata...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4">
        {mode === "create"
          ? "Skapa ny sektion"
          : `Redigera sektion: ${sectionId}`}
      </h3>

      <div className="flex flex-col gap-4">
        {mode === "create" && (
          <Input
            isRequired
            label="Sektion ID"
            placeholder="Ange ett unikt ID för sektionen"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
        )}

        <Input
          isRequired
          label="Titel"
          placeholder="Sektionens titel"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Textarea
          label="Text"
          placeholder="Sektionens innehåll"
          value={text}
          minRows={5}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="flex justify-end gap-2 mt-4">
          <Button color="danger" variant="light" onPress={onCancel}>
            Avbryt
          </Button>

          {mode === "edit" && onDelete && (
            <Button color="danger" onPress={onDelete}>
              Ta bort
            </Button>
          )}

          <Button
            color="primary"
            isLoading={loading}
            isDisabled={mode === "create" ? !id || !title : !title}
            onPress={handleSave}
          >
            {mode === "create" ? "Skapa" : "Spara ändringar"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
