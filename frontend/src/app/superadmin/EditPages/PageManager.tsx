import { useState } from "react";
import { Card } from "@heroui/react";

import { useApi } from "@/services/useApi";
import PageList from "@/app/superadmin/EditPages/PageList";
import PageContent from "@/app/superadmin/EditPages/PageContent";

export default function PageManager() {
  const api = useApi();
  const [selectedPage, setSelectedPage] = useState<string | null>(null);

  // Get all pages configuration
  const { data: config = {}, isLoading: configLoading } = api.pages.useConfig();

  // Handle page selection
  const handlePageSelect = (pageId: string) => {
    setSelectedPage(pageId);
  };

  return (
    <div className="w-full">
      {/* Top dropdown menu for page selection */}
      <PageList
        pages={config}
        selectedPage={selectedPage}
        isLoading={configLoading}
        onPageSelect={handlePageSelect}
      />

      {/* Main content area showing selected page sections */}
      {selectedPage ? (
        <PageContent pageId={selectedPage} pageData={config[selectedPage]} />
      ) : (
        <Card className="p-8 text-center text-gray-500">
          Välj en sida från menyn ovan för att börja redigera
        </Card>
      )}
    </div>
  );
}
