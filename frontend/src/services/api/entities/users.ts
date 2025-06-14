import {
  QueryClient,
  useQuery,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";

import { createApiHooks } from "../hooks";
import { createParameterizedQuery } from "../queries";
import apiClient from "../client";

import { IUser } from "@/types";

export const createUserApiHooks = (queryClient: QueryClient) => {
  return {
    ...createApiHooks<IUser>("users", queryClient),

    useById: (userId?: string, options?: { include?: string[] }) => {
      const includeParam = options?.include?.join(",") || "";

      return createParameterizedQuery<IUser, { include?: string }>({
        resource: `users/${userId}`,
        queryKeyPrefix: "user-by-id",
        paramTransformer: (params) => ({
          ...(params.include && { include: params.include }),
        }),
        enabledFn: () => !!userId,
      })({ include: includeParam });
    },

    // Get current user data (me endpoint)
    useCurrentUser: (force = false) => {
      return useQuery({
        queryKey: ["current-user"],
        queryFn: () => apiClient<{ data: IUser }>(`me`),
        staleTime: force ? 0 : 5 * 60 * 1000, // Force refresh or 5 minutes
      });
    },

    // Get coaches by course ID
    useByCourse: (courseId?: string, organizationId?: string) => {
      return useQuery({
        queryKey: ["users", "course", courseId, organizationId],
        queryFn: async () => {
          if (!courseId) return { data: [] };

          const params = new URLSearchParams();

          if (organizationId) params.append("organizationId", organizationId);

          const queryString = params.toString();
          const url = `users/course/${courseId}${queryString ? `?${queryString}` : ""}`;

          return apiClient<{ data: IUser[]; meta: any }>(url);
        },
        enabled: !!courseId,
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    },

    useUpdate: (options?: {
      onSuccess?: (data: any) => void;
      onError?: (error: any) => void;
    }) => {
      const queryClient = useQueryClient();

      return useMutation({
        mutationFn: async ({
          data,
        }: {
          data: {
            firstName?: string;
            lastName?: string;
            password?: string;
            profileImage?: string;
            role?: string;
          };
        }) => {
          return apiClient<{ data: IUser }>(`me`, {
            method: "PUT",
            body: JSON.stringify(data),
          });
        },
        onSuccess: (data) => {
          // Invalidate current user queries
          queryClient.invalidateQueries({ queryKey: ["current-user"] });
          queryClient.invalidateQueries({ queryKey: ["users"] });

          // Call custom onSuccess if provided
          options?.onSuccess?.(data);
        },
        onError: (error) => {
          // Call custom onError if provided
          options?.onError?.(error);
        },
      });
    },

    useFilterUsers: createParameterizedQuery<
      IUser,
      {
        organizationId?: string;
        role?: string;
        courseId?: string;
        include?: string;
      }
    >({
      resource: "users",
      queryKeyPrefix: "filtered-users",
      paramTransformer: (params) => {
        const transformed: Record<string, string> = {};

        if (params.organizationId)
          transformed.organizationId = params.organizationId;
        if (params.role) transformed.role = params.role;
        if (params.courseId) transformed.courseId = params.courseId;
        if (params.include) transformed.include = params.include;

        return transformed;
      },
      enabledFn: (params) => true, // Can be used without any parameters
    }),
  };
};
