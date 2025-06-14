import { useState, useEffect } from "react";
import { Button, addToast } from "@heroui/react";

import SectionList from "./SectionList";
import SectionEditor from "./SectionEditor";

import { ISection } from "@/types";
import { useApi } from "@/services/useApi";

interface SectionInput {
  sectionId: string;
  title: string;
  text: string;
}

interface PageContentProps {
  pageId: string;
  pageData: any;
}

export default function PageContent({ pageId, pageData }: PageContentProps) {
  const api = useApi();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isCreatingSection, setIsCreatingSection] = useState(false);

  // Get the sections from the page data
  const sections = pageData?.sections || [];

  useEffect(() => {
    setSelectedSection(null);
    setIsCreatingSection(false);
  }, [pageId]);

  const handleSectionSelect = (sectionId: string) => {
    setSelectedSection(sectionId);
    setIsCreatingSection(false);
  };

  const handleCreateSection = () => {
    setSelectedSection(null);
    setIsCreatingSection(true);
  };

  const { mutate: createSection } = api.pages.useCreatePageSection();
  const { mutate: deleteSection } = api.pages.useDeletePageSection();

  // Create new section API call
  const handleCreateSectionSubmit = (data: SectionInput) => {
    createSection(
      {
        page: pageId,
        section: data,
      },
      {
        onSuccess: () => {
          addToast({
            title: "Sektion skapad",
            description: "Sektionen har lagts till på sidan",
            color: "success",
            timeout: 5000,
            icon: "mingcute:check-circle-fill"
          });
          setIsCreatingSection(false);
        },
        onError: (error) => {
          console.error("Error creating section:", error);
          addToast({
            title: "Kunde inte skapa sektion",
            description: "Ett fel uppstod när sektionen skulle skapas",
            color: "danger",
            timeout: 5000,
            icon: "mingcute:alert-fill"
          });
        },
      },
    );
  };

  // Delete section API call
  const handleDeleteSection = () => {
    if (!selectedSection) {
      addToast({
        title: "Fel",
        description: "Ingen sektion är vald",
        color: "danger",
        timeout: 5000,
        icon: "mingcute:alert-fill"
      });

      return;
    }

    deleteSection(
      {
        page: pageId,
        sectionId: selectedSection,
      },
      {
        onSuccess: () => {
          addToast({
            title: "Sektion borttagen",
            description: "Sektionen har tagits bort från sidan",
            color: "success",
            timeout: 5000,
            icon: "mingcute:check-circle-fill"
          });
          setSelectedSection(null);
        },
        onError: (error) => {
          console.error("Error deleting section:", error);
          addToast({
            title: "Kunde inte ta bort sektion",
            description: "Ett fel uppstod när sektionen skulle tas bort",
            color: "danger",
            timeout: 5000,
            icon: "mingcute:alert-fill"
          });
        },
      },
    );
  };

  return (
    <>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sections list */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <SectionList
            sections={sections}
            selectedSection={selectedSection}
            onSectionSelect={handleSectionSelect}
          />
          <Button color="primary" onPress={handleCreateSection}>
            + Lägg till sektion
          </Button>
        </div>

        {/* Section editor area */}
        <div className="w-full md:w-2/3">
          {isCreatingSection ? (
            <SectionEditor
              pageId={pageId}
              mode="create"
              onSave={handleCreateSectionSubmit}
              onCancel={() => setIsCreatingSection(false)}
            />
          ) : selectedSection ? (
            <SectionEditor
              pageId={pageId}
              sectionId={selectedSection}
              mode="edit"
              section={sections.find((s: ISection) => s.id === selectedSection)}
              onSave={() => {
                setSelectedSection(null);
              }}
              onDelete={handleDeleteSection}
              onCancel={() => setSelectedSection(null)}
            />
          ) : (
            <div className="p-8 bg-gray-50 rounded-lg text-center text-gray-500">
              Välj en sektion att redigera eller skapa en ny
            </div>
          )}
        </div>
      </div>
    </>
  );
}
