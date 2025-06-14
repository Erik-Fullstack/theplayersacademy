import { UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";

/**
 * Represents a unique identifier for entities
 * Can be either a string (e.g. UUID) or a number
 */
export type Id = string | number;

/**
 * Base interface for all entities that require an ID
 * All model interfaces should extend this to ensure ID presence
 */
export interface Entity {
  id: Id;
}

/**
 * HTTP request methods supported by the API client
 */
export type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Configuration options for API requests
 * Used when making calls with the apiClient
 */
export interface RequestOptions {
  /** HTTP method to use (defaults to GET) */
  method?: RequestMethod;

  /** Custom headers to include in the request */
  headers?: Record<string, string>;

  /** Request body that will be JSON stringified */
  body?: any;

  /** Credentials mode for cross-origin requests (defaults to 'include') */
  credentials?: RequestCredentials;
}

/**
 * Standard response format for endpoints returning collections of items
 * Includes pagination metadata for list views
 */
export interface PaginatedResponse<T> {
  /** Array of entities returned by the API */
  data: T[];
  meta: { [key: string]: any };
}

/**
 * Standard response format for endpoints returning a single entity
 * Wraps the entity in a data property for consistency with list responses
 */
export interface EntityResponse<T> {
  /** Single entity returned by the API */
  data: T;
  meta?: { [key: string]: any };
}

/**
 * Options for list query hooks
 * Extends React Query's UseQueryOptions with our PaginatedResponse type
 * Omits queryKey and queryFn which are handled internally by our hooks
 */
export type FetchListOptions<T> = Omit<
  UseQueryOptions<
    PaginatedResponse<T>,
    Error,
    PaginatedResponse<T>,
    readonly unknown[]
  >,
  "queryKey" | "queryFn"
>;

/**
 * Options for fetching a single entity by ID
 * Extends React Query's UseQueryOptions for single entity responses
 * Omits queryKey and queryFn which are handled internally by our hooks
 */
export type FetchByIdOptions<T> = Omit<
  UseQueryOptions<T, Error, T, readonly unknown[]>,
  "queryKey" | "queryFn"
>;

/**
 * Options for creating a new entity mutation
 * Extends React Query's UseMutationOptions for create operations
 * TInput represents the data structure required to create a new entity
 */
export type CreateOptions<T, TInput> = Omit<
  UseMutationOptions<T, Error, TInput, unknown>,
  "mutationFn"
>;

/**
 * Options for updating an existing entity mutation
 * Extends React Query's UseMutationOptions for update operations
 * Takes both an ID and the data to update
 */
export type UpdateOptions<T, TInput> = Omit<
  UseMutationOptions<T, Error, { id: Id; data: TInput }, unknown>,
  "mutationFn"
>;

/**
 * Options for deleting an entity mutation
 * Extends React Query's UseMutationOptions for delete operations
 * Takes just the ID of the entity to delete
 */
export type DeleteOptions<T> = Omit<
  UseMutationOptions<T, Error, Id, unknown>,
  "mutationFn"
>;
