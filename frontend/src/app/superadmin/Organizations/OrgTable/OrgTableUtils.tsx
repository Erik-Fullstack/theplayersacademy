import { createTableUtils } from "@/components/common/DataTable/utils";
import { IOrganization } from "@/types/models/organization";

// One simple call creates both filter and sort functions
export const { filterFunction: filterOrgs, sortFunction: sortOrgs } =
  createTableUtils<IOrganization>({
    filter: {
      searchFields: ["name", "owner.fullName", "profile.location"],
    },
    sort: {
      columnHandlers: {
        "owner.fullName": (a, b) => [
          a.owner?.fullName || "",
          b.owner?.fullName || "",
        ],
      },
      defaultField: "name",
    },
  });
