import { Button, Card } from "@heroui/react";

interface SectionListProps {
  sections: any[];
  selectedSection: string | null;
  onSectionSelect: (sectionId: string) => void;
}

export default function SectionList({
  sections,
  selectedSection,
  onSectionSelect,
}: SectionListProps) {
  if (!sections || sections.length === 0) {
    return (
      <Card className="p-4 text-center text-gray-500">
        Inga sektioner på denna sida
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-bold mb-3">Sektioner</h3>
      <div className="flex flex-col gap-2">
        {sections.map((section) => (
          <Button
            key={section.id}
            color={selectedSection === section.id ? "primary" : "default"}
            variant={selectedSection === section.id ? "solid" : "light"}
            className="justify-start text-left"
            onPress={() => onSectionSelect(section.id)}
          >
            <div className="truncate">
              <span className="font-medium">{section.id}</span>
              <span className="opacity-70 ml-2 text-sm">{section.title}</span>
            </div>
          </Button>
        ))}
      </div>
    </Card>
  );
}
