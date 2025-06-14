import { useRef } from "react";

import useUserStore from "@/store/useUserStore";
import { useApi } from "@/services/useApi";
import GeneralModal, { GeneralModalRef } from "@/components/common/Modals/Modal";
import StatsCard from "@/components/common/Cards/StatsCard";
import InvitesModal from "@/app/organization/courses/InvitesModal";
import SendInviteModal from "@/app/organization/courses/SendInviteModal";

export default function CoachesCard() {
  const api = useApi();
  const { user } = useUserStore();
  const orgId = user?.organizationId;

  // Modals
  const invitesModalRef = useRef<GeneralModalRef>(null);
  const sendInviteModalRef = useRef<GeneralModalRef>(null);

  // Get coaches
  const { data: usersResponse } = api.users.useFilterUsers({
    organizationId: user?.organizationId,
    role: "USER",
  });

  // Get invite codes
  const { data: invitesResponse } = api.invites.useOrganizationInvites(orgId);

  const coachesAmount = usersResponse?.meta?.total || 0;
  const invitesAmount = invitesResponse?.meta?.total || 0;

  return (
    <>
      <StatsCard
        buttons={[
          {
            label: "Bjud in tränare",
            action: () => sendInviteModalRef.current?.open(),
          },
          {
            label: "Visa inbjudningar",
            action: () => invitesModalRef.current?.open(),
          },
        ]}
      >
        <div className="text-xl font-bold">Tränare</div>
        <div>
          <span className="font-semibold">Registrerade:</span> {coachesAmount} st
        </div>
        <div>
          <span className="font-semibold">Inbjudna:</span> {invitesAmount} st
        </div>
      </StatsCard>

      {/* Modal: Inbjudningar */}
      <GeneralModal ref={invitesModalRef} title="Inbjudningar">
        {() => <InvitesModal />}
      </GeneralModal>

      {/* Modal: Skicka inbjudningar */}
      <GeneralModal ref={sendInviteModalRef} title="Bjud in till föreningen">
        {() => <SendInviteModal />}
      </GeneralModal>
    </>
  );
}
