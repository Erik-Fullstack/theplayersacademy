import { useState } from "react";

import Section from "@/components/layout/Section";
import OrgTable from "@/app/superadmin/Organizations/OrgTable";
import CreateOrgModal from "@/app/superadmin/Organizations/OrgTable/CreateOrgModal";
import { useApi } from "@/services/useApi";

export default function Page() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const api = useApi();

  const {
    data: orgsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = api.organizations.useList();

  if (isLoading) return <Section>Laddar föreningar...</Section>;
  if (isError) return <Section>Fel: {error.message}</Section>;

  const orgs = orgsResponse?.data || [];

  return (
    <>
      <Section>
        <h1>Föreningar</h1>
      </Section>
      <Section className="bg-branding3">
        <OrgTable orgs={orgs} />
        <CreateOrgModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => refetch()}
        />
      </Section>
    </>
  );
}
