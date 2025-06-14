import { QueryClient } from "@tanstack/react-query";

import { createApiHooks } from "../hooks";

import { IUser } from "@/types";
export const createAuthApiHooks = (queryClient: QueryClient) => {
  return {
    ...createApiHooks<IUser>("auth", queryClient),
  };
};
