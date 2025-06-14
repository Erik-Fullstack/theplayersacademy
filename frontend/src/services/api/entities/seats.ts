import {
  QueryClient,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import apiClient from "../client";
import { createApiHooks } from "../hooks";
import { createQueryWithParams } from "../queries";

import { ISeat } from "@/types";

interface OrganizationSeatsParams {
  orgId: string | undefined;
  hasUser?: boolean;
  userId?: string;
  available?: boolean;
}

export const createSeatApiHooks = (queryClient: QueryClient) => {
  const { useById } = createApiHooks<ISeat>("seats", queryClient);

  const useOrganizationSeatsWithParams = createQueryWithParams<
    ISeat,
    OrganizationSeatsParams
  >({
    queryKey: (params) => {
      const { orgId, hasUser, userId, available } = params;

      return ["organizations", "seats", orgId, { hasUser, userId, available }];
    },
    queryFn: async ({ queryKey }) => {
      const orgId = queryKey[2];

      if (!orgId) {
        return { data: [], meta: { total: 0 } };
      }

      const { hasUser, userId, available } = queryKey[3] as any;
      const params = new URLSearchParams();

      if (hasUser !== undefined) params.append("hasUser", String(hasUser));
      if (userId) params.append("userId", userId);
      if (available) params.append("available", String(available));

      const queryString = params.toString();
      const endpoint = queryString
        ? `organizations/${orgId}/seats?${queryString}`
        : `organizations/${orgId}/seats`;

      return apiClient<{ data: ISeat[]; meta?: { total: number } }>(endpoint);
    },
    enabled: (params) => !!params.orgId,
  });

  return {
    useById,

    // Main API for getting seats with flexible parameters
    useOrganizationSeats: useOrganizationSeatsWithParams,

    // Get available seats for an organization - using the available=true query param
    getAvailableSeats: async (orgId: string) => {
      if (!orgId) {
        throw new Error("Organization ID is required");
      }

      return apiClient<{ data: ISeat[]; meta?: { total: number } }>(
        `organizations/${orgId}/seats?available=true`,
      );
    },

    // React Query hook version for getting available seats
    useAvailableSeats: (orgId: string | undefined) => {
      return useQuery({
        queryKey: ["organizations", "seats", orgId, "available"],
        queryFn: async () => {
          if (!orgId) {
            return { data: [], meta: { total: 0 } };
          }

          return apiClient<{ data: ISeat[]; meta?: { total: number } }>(
            `organizations/${orgId}/seats?available=true`,
          );
        },
        enabled: !!orgId,
      });
    },

    // Get a specific seat by ID for an organization
    useOrganizationSeatById: (
      orgId: string | undefined,
      seatId: string | undefined,
    ) => {
      // Use your existing useQuery from React Query
      return useQuery({
        queryKey: ["organizations", "seats", orgId, seatId],
        queryFn: async () => {
          if (!orgId || !seatId) {
            return { data: null, meta: { total: 0 } };
          }

          return apiClient<{ data: ISeat; meta?: { total: number } }>(
            `organizations/${orgId}/seats/${seatId}`,
          );
        },
        enabled: !!orgId && !!seatId,
      });
    },

    // Update a seat (for assigning/unassigning users)
    useUpdateSeat: () => {
      const queryClient = useQueryClient();

      return useMutation({
        mutationFn: async ({
          orgId,
          seatId,
          data,
        }: {
          orgId: string;
          seatId: string;
          data: { userId: string };
        }) => {
          if (!orgId || !seatId) {
            throw new Error("Organization ID and Seat ID are required");
          }

          console.log("🔄 Updating seat:", { orgId, seatId, data });

          const response = await apiClient<{ data: ISeat }>(
            `organizations/${orgId}/seats/${seatId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            },
          );

          console.log("✅ Seat updated:", response);

          return response;
        },
        onSuccess: (_, variables) => {
          // Invalidate relevant queries when a seat is updated
          const { orgId } = variables;

          queryClient.invalidateQueries({
            queryKey: ["organizations", "seats"],
          });

          if (orgId) {
            queryClient.invalidateQueries({
              queryKey: ["organizations", "seats", orgId],
            });

            queryClient.invalidateQueries({
              queryKey: ["organizations", "seats", orgId, "available"],
            });
          }

          queryClient.invalidateQueries({
            queryKey: ["users"],
          });

          const userId = variables.data.userId;

          if (userId && userId !== "") {
            queryClient.invalidateQueries({
              queryKey: ["users", userId],
            });
          }
        },
        onError: (error, variables) => {
          console.error("❌ Seat update failed:", error, variables);
        },
      });
    },
  };
};
