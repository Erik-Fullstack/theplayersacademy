import { createTableUtils } from "@/components/common/DataTable/utils";
import { ITeam } from "@/types";

const getCoachNames = (team: ITeam): string => {
  if (!team.coaches || team.coaches.length === 0) return "";

  // Pre-allocate array with known size to avoid resizing
  const names = new Array(team.coaches.length);

  for (let i = 0; i < team.coaches.length; i++) {
    const coach = team.coaches[i];

    names[i] = `${coach.firstName} ${coach.lastName}`;
  }

  return names.join(" ");
};

// One simple call creates both filter and sort functions
export const { filterFunction: filterTeams, sortFunction: sortTeams } =
  createTableUtils<ITeam>({
    filter: {
      // Specify which fields to search in
      searchFields: ["gender", "year", "format.name", "coachNames"],
      // Add custom field extractors for complex fields
      fieldExtractors: {
        teamName: (team) => `${team.gender} ${team.year}`,
        coachNames: getCoachNames,
      },
    },
    sort: {
      // Add custom sort handlers for specific columns
      columnHandlers: {
        name: (a, b) => [`${a.gender} ${a.year}`, `${b.gender} ${b.year}`],
        coaches: (a, b) => {
          // First sort by whether teams have coaches (teams with no coaches come first)
          const aHasCoaches = a.coaches?.length > 0;
          const bHasCoaches = b.coaches?.length > 0;

          if (aHasCoaches !== bHasCoaches) {
            return [aHasCoaches ? 1 : 0, bHasCoaches ? 1 : 0];
          }

          // Then sort by number of coaches
          return [a.coaches?.length || 0, b.coaches?.length || 0];
        },
        format: (a, b) => [a.format?.name || "", b.format?.name || ""],
      },
      // Default sort field
      defaultField: "coaches",
    },
  });
