import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";

import { createApiHooks } from "../hooks";
import { createQueryWithParams } from "../queries";
import apiClient from "../client";
import { EntityResponse } from "../types";

import { ICourse, IUser } from "@/types";

export const createCourseApiHooks = (queryClient: QueryClient) => {
  return {
    // Base CRUD operations
    ...createApiHooks<ICourse>("courses", queryClient),

    // Get users assigned to a course with optional org filter
    useCourseUsers: createQueryWithParams<
      IUser,
      { courseId: string; orgId?: string }
    >({
      queryKey: (params) => ["courses", params.courseId, "users", params.orgId],
      queryFn: async ({ queryKey }) => {
        const [, courseId, , orgId] = queryKey;
        const urlParams = orgId ? `?org=${orgId}` : "";

        return await apiClient<EntityResponse<IUser[]>>(
          `courses/${courseId}/users${urlParams}`
        );
      },
      enabled: (params) => !!params.courseId,
    }),

    useCourseStats: (organizationId?: string) => {
      return useQuery({
        queryKey: ["courses", "stats", organizationId],
        queryFn: () => apiClient(`courses/stats/${organizationId}`),
        enabled: !!organizationId,
      });
    },

    // Assign a user to a course
    useAssignUserToCourse: () => {
      return useMutation({
        mutationFn: async ({
          courseId,
          userId,
        }: {
          courseId: string;
          userId: string;
        }) => {
          const response = await apiClient(`courses/${courseId}/users`, {
            method: "POST",
            body: JSON.stringify({ userId }), // Only send userId, not the whole user object
          });

          return response;
        },
        onSuccess: (_, variables) => {
          // Invalidate relevant queries
          queryClient.invalidateQueries({
            queryKey: ["courses", variables.courseId, "users"],
          });

          // Also invalidate user's data
          queryClient.invalidateQueries({
            queryKey: ["users", variables.userId],
          });

          // Invalidate filtered users list if it exists
          queryClient.invalidateQueries({
            queryKey: ["filtered-users"],
          });
        },
      });
    },

    // Remove a user from a course
    useRemoveUserFromCourse: () => {
      return useMutation({
        mutationFn: async ({
          courseId,
          userId,
        }: {
          courseId: string;
          userId: string;
        }) => {
          const response = await apiClient(
            `courses/${courseId}/users/${userId}`,
            {
              method: "DELETE",
            }
          );

          return response;
        },
        onSuccess: (_, variables) => {
          // Invalidate relevant queries
          queryClient.invalidateQueries({
            queryKey: ["courses", variables.courseId, "users"],
          });

          // Also invalidate any organization-filtered queries
          queryClient.invalidateQueries({
            queryKey: ["courses", variables.courseId, "users", undefined],
            exact: false,
          });
        },
      });
    },
  };
};
