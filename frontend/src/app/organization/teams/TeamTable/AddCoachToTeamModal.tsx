import { useApi } from "@/services/useApi";
import { IUser, ITeam } from "@/types";
import SelectItemModal from "@/components/common/Modals/SelectItemModal";

interface AddCoachToTeamModalProps {
  team: ITeam;
  onSuccess?: () => void;
}

export default function AddCoachToTeamModal({
  team,
  onSuccess,
}: AddCoachToTeamModalProps) {
  const api = useApi();

  // Get all users from this organization
  const { data: usersResponse, isLoading: isLoadingUsers } =
    api.users.useFilterUsers({
      organizationId: team.organizationId,
    });

  // Mutation to add coach to team
  const { mutate: addCoach } = api.teams.useAddCoach();

  const handleAddCoach = async (userId: string, teamId: string) => {
    return new Promise((resolve, reject) => {
      addCoach(
        {
          teamId: team.id,
          userId,
        },
        {
          onSuccess: () => resolve(true),
          onError: (err) => reject(err),
        },
      );
    });
  };

  return (
    <SelectItemModal<IUser>
      user={team as any} // Using team as "user" context
      title="Välj tränare"
      emptyMessage="Inga tillgängliga tränare att lägga till"
      loadingMessage="Laddar tränare..."
      buttonText="Lägg till tränare"
      successTitle="Tränare tillagd"
      successMessageTemplate="{item} har lagts till i laget"
      items={usersResponse?.data || []}
      isLoading={isLoadingUsers}
      getItemLabel={(user) => `${user.firstName} ${user.lastName}`}
      getItemValue={(user) => user.id}
      userItems={team.coaches || []}
      shouldRefreshUser={false}
      onAddItem={handleAddCoach}
      onSuccess={onSuccess}
    />
  );
}
