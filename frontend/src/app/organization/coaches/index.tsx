import { useCallback } from "react";

import CoachTable from "./CoachTable";

import useUserStore from "@/store/useUserStore";
import { useApi } from "@/services/useApi";
import Section from "@/components/layout/Section";
import CoachesCard from "@/components/common/Cards/CoachesCard";
import SeatsCard from "@/components/common/Cards/SeatsCard";

export default function Page() {
  const api = useApi();
  const { user } = useUserStore();

  // Get coaches
  const {
    data: usersResponse,
    isLoading: isLoadingCoaches,
    refetch: refetchCoaches,
    isRefetching: isRefetchingCoaches,
  } = api.users.useFilterUsers({
    organizationId: user?.organizationId,
  });
  const coaches = usersResponse?.data || [];

  const handleCoachChange = useCallback(() => {
    console.log("Refreshing coaches list...");
    refetchCoaches();
  }, [refetchCoaches]);

  return (
    <>
      <Section>
        <div>
          <h1 className="mb-0">Våra tränare</h1>
          <p className="mb-4 font-bold">{user?.organization?.name}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 justify-center pb-6">
            <CoachesCard />
            <SeatsCard />
          </div>
        </div>
      </Section>
      <Section className="bg-branding3">
        <CoachTable
          coaches={coaches}
          isLoading={isLoadingCoaches || isRefetchingCoaches}
          onCoachChange={handleCoachChange}
        />
      </Section>
    </>
  );
}
