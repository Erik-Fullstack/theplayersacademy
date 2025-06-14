import { useApi } from "@/services/useApi";
import useUserStore from "@/store/useUserStore";
import Section from "@/components/layout/Section";
import TeamTable from "@/app/organization/teams/TeamTable";

export default function TeamPage() {
  const { user } = useUserStore();
  const api = useApi();
  const orgId = user?.organization?.id;

  const {
    data: teamsResponse,
    isLoading,
    isError,
    error,
  } = api.teams.useByOrganization({ organizationId: orgId });

  if (!orgId) return <Section>Föreningen kunde inte hittas.</Section>;
  if (isLoading) return <Section>Laddar lag...</Section>;
  if (isError) return <Section>Fel: {error.message}</Section>;

  const teams = teamsResponse?.data || [];

  return (
    <>
      <Section>
        <h1>Våra lag</h1>
      </Section>
      <Section className="bg-branding3">
        <div className="flex">
          <TeamTable teams={teams} />
        </div>
      </Section>
    </>
  );
}
