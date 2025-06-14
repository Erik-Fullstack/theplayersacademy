import { QueryClient, useMutation } from "@tanstack/react-query";

import { createApiHooks } from "../hooks";
import { createSingleParamQuery } from "../queries";

import { API_BASE_URL } from "@/config/api";
import { IInvitationCode } from "@/types/models/invitecode";

export const createInviteApiHooks = (queryClient: QueryClient) => {
  return {
    // Get invitation codes for an organization
    useOrganizationInvites: createSingleParamQuery<
      IInvitationCode,
      "orgId",
      string | undefined
    >({
      resource: "organizations",
      paramName: "orgId",
      queryKeyPrefix: ["organizations", "invites"],
      endpointBuilder: (resource, paramName, value) =>
        value ? `${resource}/${value}/invites` : "",
      enabled: (params) => !!params.orgId,
    }),

    // Create an invitation for an organization
    useCreateOrganizationInvite: (orgId: string | undefined) => {
      const baseMutation = createApiHooks<IInvitationCode>(
        "invites",
        queryClient,
      ).useCreate();

      return {
        ...baseMutation,
        mutate: async (data: { email: string }, options?: any) => {
          if (!orgId) throw new Error("Organization ID is required");

          try {
            // Use the invites endpoint with organization prefix
            const response = await fetch(
              `${API_BASE_URL}/organizations/${orgId}/invites`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include", // Important for auth cookies
                body: JSON.stringify(data),
              },
            );

            if (!response.ok) {
              const error = await response.json();

              throw new Error(error.message || "Failed to create invitation");
            }

            const responseData = await response.json();

            // Invalidate ALL related invite queries to ensure fresh data everywhere
            queryClient.invalidateQueries({
              queryKey: ["organizations", "invites", orgId],
            });

            // Also invalidate the organizations hook queries
            queryClient.invalidateQueries({
              queryKey: ["organizations", orgId, "invites"],
            });

            // Call onSuccess callback if provided
            if (options?.onSuccess) {
              options.onSuccess(responseData);
            }

            // Invalidate relevant queries
            queryClient.invalidateQueries({
              queryKey: ["organizations", "invites", orgId],
            });

            return responseData;
          } catch (error) {
            // Call onError callback if provided
            if (options?.onError) {
              options.onError(error);
            }
            throw error;
          } finally {
            // Call onSettled callback if provided
            if (options?.onSettled) {
              options.onSettled();
            }
          }
        },
        mutateAsync: async (data: { email: string }) => {
          if (!orgId) throw new Error("Organization ID is required");

          // Use the invites endpoint with organization prefix
          const response = await fetch(
            `${API_BASE_URL}/organizations/${orgId}/invites`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include", // Important for auth cookies
              body: JSON.stringify(data),
            },
          );

          if (!response.ok) {
            const error = await response.json();

            throw new Error(error.message || "Failed to create invitation");
          }

          // Invalidate query after successful creation
          queryClient.invalidateQueries({
            queryKey: ["organizations", "invites", orgId],
          });

          return response.json();
        },
      };
    },
    useDeleteOrganizationInvite: (orgId: string | undefined) => {
      return useMutation({
        mutationFn: async ({ inviteId }: { inviteId: string }) => {
          if (!orgId) throw new Error("Organization ID is required");

          const response = await fetch(
            `${API_BASE_URL}/organizations/${orgId}/invites/${inviteId}`,
            {
              method: "DELETE",
              credentials: "include",
            },
          );

          if (!response.ok) {
            const error = await response.json();

            throw new Error(error.message || "Failed to delete invitation");
          }

          return await response.json();
        },
        onSuccess: (_, variables) => {
          // Invalidate the specific organization's invites query
          queryClient.invalidateQueries({
            queryKey: ["organizations", "invites", orgId],
          });
        },
      });
    },
  };
};
