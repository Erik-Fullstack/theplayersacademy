import { QueryClient } from "@tanstack/react-query";

import { Entity } from "./types";

import {
  createFetchListHook,
  createFetchByIdHook,
  createCreateHook,
  createUpdateHook,
  createDeleteHook,
} from "@/services/api/crud";

/**
 * Collection of React Query hooks for CRUD operations on a specific resource
 */
export interface ApiHooks<T extends Entity, TInput = Omit<T, "id">> {
  /** Hook for fetching a paginated list of entities with optional filtering */
  useList: ReturnType<typeof createFetchListHook<T>>;

  /** Hook for fetching a single entity by its ID */
  useById: ReturnType<typeof createFetchByIdHook<T>>;

  /** Hook for creating a new entity */
  useCreate: ReturnType<typeof createCreateHook<T, TInput>>;

  /** Hook for updating an existing entity */
  useUpdate: ReturnType<typeof createUpdateHook<T, Partial<TInput>>>;

  /** Hook for deleting an entity */
  useDelete: ReturnType<typeof createDeleteHook>;
}

/**
 * Creates a set of React Query hooks for CRUD operations on a specific resource
 *
 * This factory function generates a collection of custom hooks that handle common
 * data fetching and mutation patterns, using React Query and a consistent API structure.
 *
 * All hooks are preconfigured with the appropriate resource path and query client,
 * and return standardized React Query results that match the operation type.
 *
 * @example
 * // Create team-specific API hooks
 * const teamApiHooks = createApiHooks<Team>('teams', queryClient);
 *
 * // Usage in components:
 *
 * // Fetch list with filters
 * const { data, isLoading } = teamApiHooks.useList({ gender: 'Pojkar' });
 *
 * // Fetch single entity by ID
 * const { data: team } = teamApiHooks.useById('team-123');
 *
 * // Create new entity
 * const { mutate: createTeam } = teamApiHooks.useCreate();
 * createTeam({ name: 'New Team', year: 2023 });
 *
 * // Update entity
 * const { mutate: updateTeam } = teamApiHooks.useUpdate();
 * updateTeam({ id: 'team-123', data: { name: 'Updated Name' } });
 *
 * // Delete entity
 * const { mutate: deleteTeam } = teamApiHooks.useDelete();
 * deleteTeam('team-123');
 */
export function createApiHooks<T extends Entity, TInput = Omit<T, "id">>(
  resource: string,
  queryClient: QueryClient,
): ApiHooks<T, TInput> {
  const queryKeyPrefix = resource;

  return {
    useList: createFetchListHook<T>(resource, queryKeyPrefix),

    useById: createFetchByIdHook<T>(resource, queryKeyPrefix),

    useCreate: createCreateHook<T, TInput>(
      resource,
      queryKeyPrefix,
      queryClient,
    ),

    useUpdate: createUpdateHook<T, Partial<TInput>>(
      resource,
      queryKeyPrefix,
      queryClient,
    ),

    useDelete: createDeleteHook(resource, queryKeyPrefix, queryClient),
  };
}
