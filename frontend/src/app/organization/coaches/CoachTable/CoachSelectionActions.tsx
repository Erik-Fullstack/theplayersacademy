import { SelectionAction } from "@/components/common/DataTable";
import { IUser } from "@/types";
import { exportToCSV } from "@/utils/exportUtils";

/**
 * Creates a set of selection actions for team tables
 *
 * @param options Additional options and callbacks
 * @returns Array of selection actions for the DataTable
 */
export function useCoachSelectionActions(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}): SelectionAction<IUser>[] {

  return [
    {
      label: "Exportera",
      icon: "mingcute:download-line",
      color: "primary",
      onClick: (selectedCoaches) => {
        exportToCSV({
          data: selectedCoaches,
          fileName: "coaches-export",
          columns: [
            {
              header: "Förnamn",
              accessor: (coach) => coach.firstName,
            },
            {
              header: "Efternamn",
              accessor: (coach) => coach.lastName,
            },
            {
              header: "E-post",
              accessor: (coach) => coach.email,
            },
            {
              header: "Lag",
              accessor: (coach) =>
                coach.teams
                  ?.map((t) => `${t.gender === "Pojkar" ? "P" : "F"}${t.year}`)
                  .join(", ") || "",
            },
          ],
        });
      },
    },
  ];
}
