import useUserStore from "@/store/useUserStore";
import { useApi } from "@/services/useApi";
import StatsCard from "@/components/common/Cards/StatsCard";

export default function TeamsCard() {
  const api = useApi();
  const { user } = useUserStore();
  const orgId = user?.organizationId;

  // Get teams
  const { data: teamsResponse } = api.teams.useByOrganization({
    organizationId: orgId,
  });

  const teamsAmount = teamsResponse?.meta?.total || 0;
  const girlTeamsAmount = teamsResponse?.meta?.genderStats?.girls || 0;
  const boyTeamsAmount = teamsResponse?.meta?.genderStats?.boys || 0;

  return (
    <>
      <StatsCard
      // buttons={[
      //   {
      //     label: "Bjud in tränare",
      //     action: () => sendInviteModalRef.current?.open(),
      //   },
      //   {
      //     label: "Visa inbjudningar",
      //     action: () => invitesModalRef.current?.open(),
      //   },
      // ]}
      >
        <div className="text-xl font-bold">Lagantal</div>
        <div>
          <span className="font-semibold">Antal lag:</span> {teamsAmount} st
        </div>
        <div>
          <span className="font-semibold">Flicklag:</span> {girlTeamsAmount} st
        </div>
        <div>
          <span className="font-semibold">Pojklag:</span> {boyTeamsAmount} st
        </div>
      </StatsCard>
    </>
  );
}
