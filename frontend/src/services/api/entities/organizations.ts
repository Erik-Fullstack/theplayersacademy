import { QueryClient, useMutation } from "@tanstack/react-query";

import { createApiHooks } from "../hooks";
import { createSingleParamQuery } from "../queries";
import apiClient from "../client";

import { IOrganization, IUser, IInvitationCode, IOrgProfile } from "@/types";

export const createOrgApiHooks = (queryClient: QueryClient) => {
  return {
    // All crud operations:
    ...createApiHooks<IOrganization>("organizations", queryClient),

    // Query for organization users
    useOrganizationUsers: createSingleParamQuery<
      IUser,
      "organizationId",
      string | undefined // Allow undefined here
    >({
      resource: "organizations",
      paramName: "organizationId",
      queryKeyPrefix: ["organizations", "users"],
      endpointBuilder: (resource, paramName, value) =>
        value ? `${resource}/${value}/users` : "",
      enabled: (params) => !!params.organizationId,
    }),

    // Add invitation code queries
    useOrganizationInvites: createSingleParamQuery<
      IInvitationCode,
      "organizationId",
      string | undefined
    >({
      resource: "organizations",
      paramName: "organizationId",
      queryKeyPrefix: ["organizations", "invites"],
      endpointBuilder: (resource, paramName, value) =>
        value ? `${resource}/${value}/invites` : "",
      enabled: (params) => !!params.organizationId,
    }),

    // Add organization profile
    useOrganizationProfile: createSingleParamQuery<
      IOrgProfile,
      "organizationId",
      string | undefined
    >({
      resource: "orgprofiles",
      paramName: "organizationId",
      queryKeyPrefix: ["organizations", "profile"],
      endpointBuilder: (_, __, value) => (value ? `orgprofiles/${value}` : ""),
      enabled: (params) => !!params.organizationId,
    }),

    // Add profile update mutation
    useUpdateProfile: () => {
      return useMutation<
        { data: IOrgProfile },
        Error,
        {
          orgId: string;
          formData: FormData;
        }
      >({
        mutationFn: async ({ orgId, formData }) => {
          const response = await apiClient<{ data: IOrgProfile }>(
            `orgprofiles/${orgId}`,
            {
              method: "PUT",
              body: formData,
            },
          );

          return response;
        },
        onSuccess: (_, variables) => {
          // Invalidate relevant queries
          queryClient.invalidateQueries({
            queryKey: ["organizations", "profile", variables.orgId],
          });
          queryClient.invalidateQueries({ queryKey: ["users", "me"] });
        },
      });
    },
  };
};
