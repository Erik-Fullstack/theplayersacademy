import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { createApiHooks } from "../hooks";
import apiClient from "../client";

import { IFeedback } from "@/types";

export const createFeedbackApiHooks = (queryClient: QueryClient) => {
  const { useList, useById, useCreate, useDelete } = createApiHooks<IFeedback>(
    "feedback",
    queryClient,
  );

  return {
    useList,
    useById,
    useCreate,
    useDelete,

    // Add custom mutation to resolve feedback
    useResolveFeedback: () => {
      const queryClient = useQueryClient();

      return useMutation({
        mutationFn: async (feedbackId: string) => {
          const response = await apiClient<{ data: IFeedback }>(
            `feedback/${feedbackId}`,
            {
              method: "PUT",
              body: JSON.stringify({ isResolved: true }),
            },
          );

          return response;
        },
        onSuccess: () => {
          // Invalidate and refetch feedback queries when we resolve one
          queryClient.invalidateQueries({ queryKey: ["feedback"] });
        },
      });
    },
  };
};
