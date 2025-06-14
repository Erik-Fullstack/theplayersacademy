import { addToast } from "@heroui/react";

import { SelectionAction } from "@/components/common/DataTable";
import { ITeam } from "@/types/models/team";
import { useApi } from "@/services/useApi";
import { exportToCSV } from "@/utils/exportUtils";

/**
 * Creates a set of selection actions for team tables
 *
 * @param options Additional options and callbacks
 * @returns Array of selection actions for the DataTable
 */
export function useTeamSelectionActions(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}): SelectionAction<ITeam>[] {
  const api = useApi();

  return [
    {
      label: "Ta bort",
      icon: "mingcute:delete-line",
      color: "danger",
      variant: "flat",
      onClick: async (selectedTeams) => {
        if (
          confirm(
            `Är du säker på att du vill ta bort ${selectedTeams.length} lag?`,
          )
        ) {
          try {
            // Show pending toast with promise
            addToast({
              title: "Tar bort lag...",
              description: `Tar bort ${selectedTeams.length} lag`,
              // Display a loading indicator that resolves with the promise
              promise: Promise.all(
                selectedTeams.map((team) =>
                  api.teams.useDelete().mutateAsync(team.id),
                ),
              )
                .then(() => {
                  // This will transform the toast to success state
                  return {
                    title: "Lag borttagna",
                    description: `${selectedTeams.length} lag har tagits bort`,
                    icon: "mingcute:check-circle-fill",
                    color: "success"
                  };
                })
                .catch((error) => {
                  // This will transform the toast to error state
                  if (options?.onError) options.onError(error as Error);

                  return {
                    title: "Fel",
                    description: "Ett fel uppstod när lagen skulle tas bort",
                    icon: "mingcute:alert-fill",
                    color: "danger"
                  };
                }),
            });

            // Wait for deletion to complete
            await Promise.all(
              selectedTeams.map((team) =>
                api.teams.useDelete().mutateAsync(team.id),
              ),
            );

            if (options?.onSuccess) options.onSuccess();
          } catch (error) {
            console.error(error);
          }
        }
      },
    },
    {
      label: "Exportera",
      icon: "mingcute:download-line",
      color: "primary",
      onClick: (selectedTeams) => {
        // Use the new utility function
        exportToCSV({
          data: selectedTeams,
          fileName: "teams-export",
          columns: [
            {
              header: "Lag",
              accessor: (team) =>
                `${team.gender === "Pojkar" ? "P" : "F"}${team.year}`,
            },
            {
              header: "Kön",
              accessor: (team) => team.gender,
            },
            {
              header: "Årskull",
              accessor: (team) => team.year,
            },
            {
              header: "Antal tränare",
              accessor: (team) => team.coaches?.length || 0,
            },
            {
              header: "Spelform",
              accessor: (team) => team.format?.name || "Ej angiven",
            },
          ],
        });
      },
    },
  ];
}
