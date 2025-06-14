import { Select, SelectItem, Spinner } from "@heroui/react";

interface PageListProps {
  pages: Record<string, any>;
  selectedPage: string | null;
  onPageSelect: (pageId: string) => void;
  isLoading: boolean;
}

export default function PageList({
  pages,
  selectedPage,
  onPageSelect,
  isLoading,
}: PageListProps) {
  const handleSelectionChange = (key: string | number) => {
    onPageSelect(key.toString());
  };

  // Create items list from pages
  const pageItems = Object.entries(pages).map(([pageId, pageData]) => ({
    key: pageId,
    label: pageData.id || pageId,
  }));

  const selectId = "page-select";

  return (
    <div className="w-full mb-6">
      <label htmlFor={selectId} className="block text-sm font-medium mb-2">
        Välj sida att redigera
      </label>
      <Select
        id={selectId}
        aria-labelledby={selectId}
        placeholder="Välj sida"
        selectedKeys={selectedPage ? [selectedPage] : []}
        size="lg"
        className="max-w-xl"
        startContent={isLoading ? <Spinner size="sm" /> : null}
        isDisabled={isLoading}
        onChange={(e) => handleSelectionChange(e.target.value)}
      >
        {pageItems.map((item) => (
          <SelectItem key={item.key}>{item.label}</SelectItem>
        ))}
      </Select>
    </div>
  );
}
