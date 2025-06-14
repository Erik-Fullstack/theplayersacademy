import { QueryClient, useQuery, useMutation } from "@tanstack/react-query";

import { createApiHooks } from "../hooks";
import { createSingleParamQuery, createParameterizedQuery } from "../queries";
import apiClient from "../client";

import { ITeam, IUser } from "@/types";

export const createTeamApiHooks = (queryClient: QueryClient) => {
  // const { useList, useById, useCreate } = createApiHooks<ITeam>("teams", queryClient);
  return {
    // All crud operations:
    ...createApiHooks<ITeam>("teams", queryClient),
    // Or pick and choose which ones to use:
    // useList,
    // useById,
    // useCreate,
    // useUpdate,
    // useDelete

    // Get teams by organization (query parameter)
    useByOrganization: createParameterizedQuery<
      ITeam,
      { organizationId?: string; courseId?: string; gender?: string }
    >({
      resource: "teams/organization",
      queryKeyPrefix: "teams",
      paramTransformer: (params) => {
        // Transform params to the format expected by the API
        const transformed: Record<string, string> = {};

        // If we have an organizationId, use it as part of the URL path
        // rather than a query parameter
        if (params.organizationId) {
          transformed._path = params.organizationId;
        }

        if (params.courseId) transformed.courseId = params.courseId;
        if (params.gender) transformed.gender = params.gender;

        return transformed;
      },
      enabledFn: (params) => !!params.organizationId,
    }),

    // Get team courses
    useTeamCourses: (teamId: string | undefined) => {
      return useQuery({
        queryKey: ["teams", teamId, "courses"],
        queryFn: async () => {
          if (!teamId) throw new Error("Team ID is required");

          return await apiClient(`teams/${teamId}/courses`);
        },
        enabled: !!teamId,
      });
    },

    // Get coaches for a team
    useTeamCoaches: (teamId: string | undefined) => {
      return useQuery({
        queryKey: ["teams", teamId, "coaches"],
        queryFn: async () => {
          if (!teamId) throw new Error("Team ID is required");

          return await apiClient<{ data: IUser[] }>(`teams/${teamId}/coaches`);
        },
        enabled: !!teamId,
      });
    },

    // Add a coach to a team
    useAddCoach: () => {
      return useMutation({
        mutationFn: async ({
          teamId,
          userId,
        }: {
          teamId: string;
          userId: string;
        }) => {
          return await apiClient(`teams/${teamId}/coaches/${userId}`, {
            method: "PUT",
          });
        },
        onSuccess: (_, variables) => {
          // Invalidate relevant queries
          // Teams-related queries
          queryClient.invalidateQueries({
            queryKey: ["teams", variables.teamId, "coaches"],
          });
          queryClient.invalidateQueries({
            queryKey: ["teams", variables.teamId],
          });

          // Individual user query
          queryClient.invalidateQueries({
            queryKey: ["users", variables.userId],
          });

          // The filtered-users query used in the coaches list
          queryClient.invalidateQueries({
            queryKey: ["filtered-users"],
          });
        },
      });
    },
    // Remove a coach from a team
    useRemoveCoach: () => {
      return useMutation({
        mutationFn: async ({
          teamId,
          userId,
        }: {
          teamId: string;
          userId: string;
        }) => {
          return await apiClient(`teams/${teamId}/coaches/${userId}`, {
            method: "DELETE",
          });
        },
        onSuccess: (_, variables) => {
          // Invalidate relevant queries
          // Teams-related queries
          queryClient.invalidateQueries({
            queryKey: ["teams", variables.teamId, "coaches"],
          });
          queryClient.invalidateQueries({
            queryKey: ["teams", variables.teamId],
          });

          // Individual user query
          queryClient.invalidateQueries({
            queryKey: ["users", variables.userId],
          });

          // The filtered-users query used in the coaches list
          queryClient.invalidateQueries({
            queryKey: ["filtered-users"],
          });
        },
      });
    },
  };
};
