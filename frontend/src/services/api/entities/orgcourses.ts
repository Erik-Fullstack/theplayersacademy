import { QueryClient } from "@tanstack/react-query";

import { createApiHooks } from "../hooks";
import { createSingleParamQuery } from "../queries";

import { IOrgCourse } from "@/types";
export const createOrgcourseApiHooks = (queryClient: QueryClient) => {
  return {
    ...createApiHooks<IOrgCourse>("orgcourses", queryClient),

    useByOrganization: createSingleParamQuery<IOrgCourse,"org",string | undefined>({
      resource: "orgcourses",
      paramName: "org",
    }),
  };
};
