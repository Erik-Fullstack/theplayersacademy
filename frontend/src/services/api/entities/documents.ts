import { QueryClient, useMutation } from "@tanstack/react-query";

import apiClient from "../client";
import { createApiHooks } from "../hooks";

import { IDocument } from "@/types";

export const createDocumentApiHooks = (queryClient: QueryClient) => {
  const { useList, useDelete } = createApiHooks<IDocument>(
    "documents",
    queryClient,
  );

  const useCreate = (options = {}) => {
    return useMutation({
      mutationFn: async (formData: FormData) => {
        // Use apiClient directly with FormData
        return await apiClient<{ data: IDocument }>("documents", {
          method: "POST",
          body: formData,
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["documents"] });
      },
      ...options,
    });
  };

  const useUpdate = (options = {}) => {
    return useMutation({
      mutationFn: async ({
        id,
        formData,
      }: {
        id: string;
        formData: FormData;
      }) => {
        return await apiClient<{ data: IDocument }>(`documents/${id}`, {
          method: "PUT",
          body: formData,
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["documents"] });
      },
      ...options,
    });
  };

  return {
    useList,
    useCreate,
    useUpdate,
    useDelete,
  };
};
