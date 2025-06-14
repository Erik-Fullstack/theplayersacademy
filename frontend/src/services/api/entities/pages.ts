import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";

import { createApiHooks } from "../hooks";
import apiClient from "../client";

import { IPage, ISection } from "@/types";

interface PageSectionUpdatePayload {
  content: string; // "title" or "text"
  updatedData: string;
}

export const createPagesApiHooks = (queryClient: QueryClient) => {
  return {
    ...createApiHooks<IPage>("pages", queryClient),

    // Get full configuration for all pages
    useConfig: () => {
      return useQuery({
        queryKey: ["pages", "config"],
        queryFn: async () => {
          const response = await apiClient<{ data: Record<string, IPage> }>(
            "pages/config"
          );

          return response.data;
        },
      });
    },

    // Get iterable pages list specifically
    useIterablePages: () => {
      return useQuery({
        queryKey: ["pages", "iterable"],
        queryFn: async () => {
          const response = await apiClient<{ data: string[] }>(
            "pages/iterable"
          );

          return response.data;
        },
      });
    },

    // Get specific page content by section and content type
    usePageContent: (page: string, sectionId?: string, content?: string) => {
      return useQuery({
        queryKey: ["pages", page, sectionId, content],
        queryFn: async () => {
          const params = new URLSearchParams();

          if (content) params.append("content", content);
          if (sectionId) params.append("id", sectionId);

          const queryString = params.toString();
          const url = `pages/${page}${queryString ? `?${queryString}` : ""}`;

          const response = await apiClient<{ data: string }>(url);

          return response.data;
        },
        enabled: !!page && !!sectionId && !!content,
        staleTime: 0,
      });
    },

    // Create a new section on a page
    useCreatePageSection: () => {
      return useMutation({
        mutationFn: async ({
          page,
          section,
        }: {
          page: string;
          section: { sectionId: string; title: string; text: string };
        }) => {
          const response = await apiClient<{ data: ISection }>(
            `pages/${page}`,
            {
              method: "POST",
              body: JSON.stringify(section),
            }
          );

          return response.data;
        },
        onSuccess: (_, variables) => {
          queryClient.invalidateQueries({
            queryKey: ["pages", variables.page],
          });
          queryClient.invalidateQueries({ queryKey: ["pages", "config"] });
        },
      });
    },

    // Update a section on a page
    useUpdatePageSection: () => {
      return useMutation({
        mutationFn: async ({
          page,
          sectionId,
          update,
        }: {
          page: string;
          sectionId: string;
          update: { content: string; updatedData: string };
        }) => {
          const response = await apiClient<{ data: ISection }>(
            `pages/${page}/${sectionId}`, // This matches your backend route
            {
              method: "PUT",
              body: JSON.stringify(update),
            }
          );

          return response.data;
        },
        onSuccess: (_, variables) => {
          queryClient.invalidateQueries({
            queryKey: ["pages", variables.page],
          });
          queryClient.invalidateQueries({ queryKey: ["pages", "config"] });
          queryClient.invalidateQueries({
            queryKey: ["pages", variables.page, variables.sectionId],
          });
        },
      });
    },

    // Delete a section from a page
    useDeletePageSection: () => {
      return useMutation({
        mutationFn: async ({
          page,
          sectionId,
        }: {
          page: string;
          sectionId: string;
        }) => {
          const response = await apiClient<{ data: string }>(
            `pages/${page}/${sectionId}`,
            {
              method: "DELETE",
            },
          );

          return response.data;
        },
        onSuccess: (_, variables) => {
          queryClient.invalidateQueries({
            queryKey: ["pages", variables.page],
          });
          queryClient.invalidateQueries({ queryKey: ["pages", "config"] });
        },
      });
    },

    useDeletePage: () => {
      return useMutation({
        mutationFn: async ({ page }: { page: string }) => {
          const response = await apiClient<{ data: string }>(`pages/${page}`, {
            method: "DELETE",
          });

          return response.data;
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["pages"] });
          queryClient.invalidateQueries({ queryKey: ["pages", "config"] });
        },
      });
    },
  };
};
