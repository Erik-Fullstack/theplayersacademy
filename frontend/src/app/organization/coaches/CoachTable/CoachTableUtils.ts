import { createTableUtils } from "@/components/common/DataTable/utils";
import { IUser } from "@/types";

// One simple call creates both filter and sort functions
export const { filterFunction: filterCoaches, sortFunction: sortCoaches } =
  createTableUtils<IUser>({
    filter: {
      // Specify which fields to search in
      searchFields: ["name", "email", "team", "fullName"],
      // Add custom field extractors for complex fields
      fieldExtractors: {
        // teamName: (team) => `${team.gender} ${team.year}`,
      },
    },
    sort: { defaultField: "name" },
  });
