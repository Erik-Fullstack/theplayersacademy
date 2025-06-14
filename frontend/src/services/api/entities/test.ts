import { QueryClient, useQuery } from "@tanstack/react-query";

import apiClient from "../client";

import { IUser } from "@/types";

type TestUserRole = "user" | "admin" | "superadmin";

export const createTestApiHooks = (queryClient: QueryClient) => {
  return {
    /**
     * Fetches a test user by role
     */
    useTestUser: (role: TestUserRole | undefined) => {
      return useQuery({
        queryKey: ["test", role],
        queryFn: async () => {
          if (!role) {
            return { data: null };
          }

          return apiClient<{ data: IUser }>(
            `test/${role}?include=organization,subscription,orgprofile,seatstats`,
          );
        },
        enabled: !!role,
      });
    },

    /**
     * Direct API method to fetch a test user (for use outside of React components)
     */
    getTestUser: async (role: TestUserRole) => {
      if (!role) {
        throw new Error("Role is required");
      }

      return apiClient<{ data: IUser }>(
        `test/${role}?include=organization,subscription,orgprofile,seatstats`,
      );
    },

    /**
     * Fetch a test user by specific role
     */
    useTestUserByRole: (role: string | undefined) => {
      return useQuery({
        queryKey: ["test", "role", role],
        queryFn: async () => {
          if (!role) {
            return { data: null };
          }

          return apiClient<{ data: IUser }>(
            `test/role/${role}?include=organization,subscription,orgprofile,seatstats`,
          );
        },
        enabled: !!role,
      });
    },
  };
};
