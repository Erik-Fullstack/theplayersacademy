import { Snippet, Button, addToast } from "@heroui/react";

import { useApi } from "@/services/useApi";
import useUserStore from "@/store/useUserStore";
import { IInvitationCode } from "@/types";

export default function InvitesModal() {
  const api = useApi();
  const { user } = useUserStore();
  const orgId = user?.organizationId;

  const { data: inviteResponse, refetch: refetchInvites } =
    api.invites.useOrganizationInvites(orgId);
  const invites = inviteResponse?.data || [];

  const { mutate: deleteInvite } =
    api.invites.useDeleteOrganizationInvite(orgId);

  function handleDelete(invite: IInvitationCode) {
    deleteInvite(
      { inviteId: invite.id },
      {
        onSuccess: () => {
          // Show toast after successful deletion
          addToast({
            title: "Inbjudan har tagits bort",
            timeout: 5000,
            icon: "mingcute:check-circle-fill",
            color: "success"
          });

          refetchInvites();
        },
        onError: (error) => {
          addToast({
            title: "Fel vid borttagning",
            description:
              error instanceof Error ? error.message : "Något gick fel",
            timeout: 5000,
            color: "danger",
            icon: "mingcute:alert-fill"
          });
        },
      },
    );
  }

  return (
    <>
      {invites.length > 0 ? (
        invites.map((invite: IInvitationCode) => (
          <div key={invite.code} className="list-card flex gap-2 items-center">
            <div className="flex-1">{invite.email}</div>
            <Snippet>{invite.code}</Snippet>
            <Button color="warning" onPress={() => handleDelete(invite)}>
              Ta bort inbjudan
            </Button>
          </div>
        ))
      ) : (
        <div>Inga väntande inbjudningar.</div>
      )}
    </>
  );
}
