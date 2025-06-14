import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";

import apiClient from "@/services/api/client";
import {
  Id,
  Entity,
  PaginatedResponse,
  EntityResponse,
  FetchListOptions,
  FetchByIdOptions,
  CreateOptions,
  UpdateOptions,
  DeleteOptions,
} from "@/services/api/types";

/**
 * Creates a custom hook for fetching a paginated list of entities
 *
 * This factory function returns a hook that handles fetching, filtering,
 * and caching of paginated entity collections.
 *
 * @example
 * // Create a hook for fetching teams
 * const useTeamsList = createFetchListHook<Team>('teams');
 *
 * // Use the hook in a component with filters
 * const { data, isLoading } = useTeamsList({ gender: 'Pojkar', year: 2023 });
 */
export function createFetchListHook<T>(
  resource: string,
  queryKeyPrefix: string = resource,
) {
  return (queryParams?: Record<string, any>, options?: FetchListOptions<T>) => {
    const queryKey = queryParams
      ? ([queryKeyPrefix, queryParams] as const)
      : ([queryKeyPrefix] as const);

    const searchParams = queryParams
      ? new URLSearchParams(
          // Filter out undefined or null values
          Object.entries(queryParams)
            .filter(([_, value]) => value != null)
            .map(([key, value]) => [key, String(value)]),
        ).toString()
      : "";

    const endpoint = searchParams ? `${resource}?${searchParams}` : resource;

    return useQuery<
      PaginatedResponse<T>,
      Error,
      PaginatedResponse<T>,
      readonly unknown[]
    >({
      queryKey,
      queryFn: () => apiClient<PaginatedResponse<T>>(endpoint),
      ...options,
    });
  };
}

/**
 * Creates a custom hook for fetching a single entity by ID
 *
 * This factory function returns a hook that handles fetching individual entities
 * by their unique identifier.
 *
 * @example
 * // Create a hook for fetching a team by ID
 * const useTeam = createFetchByIdHook<Team>('teams');
 *
 * // Use the hook in a component
 * const { data: team, isLoading } = useTeam('team-123');
 */
export function createFetchByIdHook<T extends Entity>(
  resource: string,
  queryKeyPrefix: string = resource,
) {
  return (
    id: Id | undefined,
    options?: FetchByIdOptions<EntityResponse<T>>,
  ) => {
    return useQuery<EntityResponse<T>, Error, EntityResponse<T>>({
      queryKey: [queryKeyPrefix, id],
      queryFn: () => {
        // Prevent making the API call if id is undefined
        if (id === undefined) {
          throw new Error(`${resource} ID is required`);
        }

        return apiClient<EntityResponse<T>>(`${resource}/${id}`);
      },
      // Don't run the query if id is undefined
      enabled: id !== undefined && options?.enabled !== false,
      ...options,
    });
  };
}

/**
 * Creates a custom hook for creating a new entity
 *
 * This factory function returns a hook that handles creating new entities
 * and automatically invalidates related queries.
 *
 * @example
 * // Create a hook for creating new teams
 * const useCreateTeam = createCreateHook<Team, TeamInput>('teams', 'teams', queryClient);
 *
 * // Use the hook in a component
 * const { mutate: createTeam, isLoading } = useCreateTeam();
 * // Then later:
 * createTeam({ name: 'New Team', year: 2023 });
 */
export function createCreateHook<T, TInput = Omit<T, "id">>(
  resource: string,
  queryKeyPrefix: string = resource,
  queryClient: QueryClient,
) {
  return (options?: CreateOptions<T, TInput>) => {
    return useMutation<T, Error, TInput>({
      mutationFn: (data) =>
        apiClient<T>(resource, {
          method: "POST",
          body: JSON.stringify(data),
        }),
      onSuccess: (_, __, ___) => {
        // Invalidate the list query to reflect the new entity
        queryClient.invalidateQueries({ queryKey: [queryKeyPrefix] });
      },
      ...options,
    });
  };
}

/**
 * Creates a custom hook for updating an existing entity
 *
 * This factory function returns a hook that handles updating entities
 * and managing the query cache to reflect changes.
 *
 * @example
 * // Create a hook for updating teams
 * const useUpdateTeam = createUpdateHook<Team>('teams', 'teams', queryClient);
 *
 * // Use the hook in a component
 * const { mutate: updateTeam } = useUpdateTeam();
 * // Then later:
 * updateTeam({ id: 'team-123', data: { name: 'Updated Team Name' } });
 */
export function createUpdateHook<T extends Entity, TInput = Partial<T>>(
  resource: string,
  queryKeyPrefix: string = resource,
  queryClient: QueryClient,
) {
  return (options?: UpdateOptions<T, TInput>) => {
    return useMutation<T, Error, { id: Id; data: TInput }>({
      mutationFn: ({ id, data }) =>
        apiClient<T>(`${resource}/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        }),
      onSuccess: (updatedEntity, { id }) => {
        // Update the cache for this specific entity
        queryClient.setQueryData([queryKeyPrefix, id], updatedEntity);

        // Invalidate the list query to reflect the updated entity
        queryClient.invalidateQueries({ queryKey: [queryKeyPrefix] });
      },
      ...options,
    });
  };
}

/**
 * Creates a custom hook for deleting an entity
 *
 * This factory function returns a hook that handles deleting entities
 * and managing the query cache to reflect the deletion.
 *
 * @example
 * // Create a hook for deleting teams
 * const useDeleteTeam = createDeleteHook('teams', 'teams', queryClient);
 *
 * // Use the hook in a component
 * const { mutate: deleteTeam, isLoading } = useDeleteTeam();
 * // Then later:
 * deleteTeam('team-123');
 */
export function createDeleteHook<T = void>(
  resource: string,
  queryKeyPrefix: string = resource,
  queryClient: QueryClient,
) {
  return (options?: DeleteOptions<T>) => {
    return useMutation<T, Error, Id>({
      mutationFn: (id) =>
        apiClient<T>(`${resource}/${id}`, {
          method: "DELETE",
        }),
      onSuccess: (_, id) => {
        // Remove the entity from the cache
        queryClient.removeQueries({ queryKey: [queryKeyPrefix, id] });

        // Invalidate the list query to reflect the deleted entity
        queryClient.invalidateQueries({ queryKey: [queryKeyPrefix] });
      },
      ...options,
    });
  };
}
