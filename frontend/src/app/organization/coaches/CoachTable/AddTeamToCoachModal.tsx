import { useApi } from "@/services/useApi";
import { IUser, ITeam } from "@/types";
import SelectItemModal from "@/components/common/Modals/SelectItemModal";

export default function AddTeamModal({
  user,
  onSuccess,
}: {
  user: IUser;
  onSuccess?: () => void;
}) {
  const api = useApi();
  const orgId = user?.organizationId;

  const { data: teamsResponse, isLoading: isLoadingTeams } =
    api.teams.useByOrganization({ organizationId: orgId });

  const { mutate: addCoach } = api.teams.useAddCoach();

  const handleAddTeam = async (teamId: string, userId: string) => {
    return new Promise((resolve, reject) => {
      addCoach(
        { teamId, userId },
        {
          onSuccess: () => resolve(true),
          onError: (err) => reject(err),
        },
      );
    });
  };

  return (
    <SelectItemModal<ITeam>
      user={user}
      title="Välj lag"
      emptyMessage="Inga tillgängliga lag att lägga till"
      loadingMessage="Laddar lag..."
      buttonText="Lägg till lag"
      successTitle="Lag tillagt"
      successMessageTemplate={`${user.firstName} har lagts till i {item}`}
      items={teamsResponse?.data || []}
      isLoading={isLoadingTeams}
      getItemLabel={(team) => `${team.gender} ${team.year}`}
      getItemValue={(team) => team.id}
      userItems={user.teams}
      shouldRefreshUser={true}
      onAddItem={handleAddTeam}
      onSuccess={onSuccess}
    />
  );
}
