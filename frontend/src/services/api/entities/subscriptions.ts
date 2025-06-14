import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { createApiHooks } from "../hooks";
import { createSingleParamQuery } from "../queries";
import apiClient from "../client";

import { ISubscription } from "@/types";

export const createSubscriptionApiHooks = (queryClient: QueryClient) => {
  // Get base hooks
  const { useList } = createApiHooks<ISubscription>(
    "subscriptions",
    queryClient,
  );

  return {
    // Get all subscriptions
    useList,

    // Get subscription by organization ID
    useByOrganizationId: createSingleParamQuery<
      ISubscription,
      "orgId",
      string | undefined
    >({
      resource: "subscriptions",
      paramName: "orgId",
      queryKeyPrefix: ["subscriptions", "organization"],
      endpointBuilder: (resource, _, value) =>
        value ? `${resource}/organization/${value}` : "",
      enabled: (params) => !!params.orgId,
    }),

    // Update subscription
    useUpdate: () => {
      const queryClient = useQueryClient();

      return useMutation({
        mutationFn: async ({
          orgId,
          data,
        }: {
          orgId: string;
          data: {
            paymentInfo?: string;
            seatLimit?: number;
            pricePlan?: string;
          };
        }) => {
          const response = await apiClient<{ data: ISubscription }>(
            `subscriptions/organization/${orgId}`,
            {
              method: "PUT",
              body: JSON.stringify(data),
            },
          );

          return response;
        },
        onSuccess: (_, variables) => {
          // Invalidate relevant queries
          queryClient.invalidateQueries({
            queryKey: ["subscriptions", "organization", variables.orgId],
          });
          // Also update the user data since it contains the subscription
          queryClient.invalidateQueries({
            queryKey: ["me"],
          });
        },
      });
    },

    // Update seat limit
    useUpdateSeatLimit: () => {
      const queryClient = useQueryClient();

      return useMutation({
        mutationFn: async ({
          orgId,
          seatLimit,
        }: {
          orgId: string;
          seatLimit: number;
        }) => {
          const response = await apiClient<{
            data: ISubscription;
            message: string;
          }>(`subscriptions/organization/${orgId}/seats`, {
            method: "PUT",
            body: JSON.stringify({ seatLimit }),
          });

          return response;
        },
        onSuccess: (_, variables) => {
          queryClient.invalidateQueries({
            queryKey: ["subscriptions", "organization", variables.orgId],
          });
        },
      });
    },

    // Activate subscription
    useActivate: () => {
      const queryClient = useQueryClient();

      return useMutation({
        mutationFn: async ({
          orgId,
          seatLimit,
        }: {
          orgId: string;
          seatLimit: number;
        }) => {
          const response = await apiClient<{
            data: ISubscription;
            message: string;
          }>(`subscriptions/organization/${orgId}/activate`, {
            method: "POST",
            body: JSON.stringify({ seatLimit }),
          });

          return response;
        },
        onSuccess: (_, variables) => {
          queryClient.invalidateQueries({
            queryKey: ["subscriptions", "organization", variables.orgId],
          });
          // Also refresh organization data since subscription status affects it
          queryClient.invalidateQueries({
            queryKey: ["organizations", variables.orgId],
          });
        },
      });
    },

    // Deactivate subscription
    useDeactivate: () => {
      const queryClient = useQueryClient();

      return useMutation({
        mutationFn: async ({ orgId }: { orgId: string }) => {
          const response = await apiClient<{
            data: ISubscription;
            message: string;
          }>(`subscriptions/organization/${orgId}/deactivate`, {
            method: "POST",
          });

          return response;
        },
        onSuccess: (_, variables) => {
          queryClient.invalidateQueries({
            queryKey: ["subscriptions", "organization", variables.orgId],
          });
          // Also refresh organization data since subscription status affects it
          queryClient.invalidateQueries({
            queryKey: ["organizations", variables.orgId],
          });
        },
      });
    },
  };
};
