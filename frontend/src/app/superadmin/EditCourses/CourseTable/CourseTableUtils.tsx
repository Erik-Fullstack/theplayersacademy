import { createTableUtils } from "@/components/common/DataTable/utils";
import { ICourse } from "@/types/models/course";

// One simple call creates both filter and sort functions
export const { filterFunction: filterCourses, sortFunction: sortCourses } =
  createTableUtils<ICourse>({
    filter: {
      searchFields: ["name"],
    },
    sort: {
      // columnHandlers: {
      //   "owner.fullName": (a, b) => [
      //     a.owner?.fullName || "",
      //     b.owner?.fullName || "",
      //   ],
      // },
      defaultField: "name",
    },
  });
