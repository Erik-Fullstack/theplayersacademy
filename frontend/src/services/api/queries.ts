import { UseQueryOptions, useQuery } from "@tanstack/react-query";

import apiClient from "./client";
import { PaginatedResponse, EntityResponse } from "./types";

/**
 * Options for creating a query with parameters
 */
export interface CreateParameterizedQueryOptions<
  T,
  TParams extends Record<string, any>,
> {
  /** Base resource endpoint */
  resource: string;

  /** Query key prefix */
  queryKeyPrefix?: string;

  /** Parameter transformation function */
  paramTransformer?: (params: TParams) => Record<string, any>;

  /** Function to determine if the query should be enabled */
  enabledFn?: (params: TParams) => boolean;
}

/**
 * Creates a hook for fetching data with parameterized queries
 *
 * This function generates a custom query hook that handles URL parameter building,
 * query key management, and automatic query enabling/disabling based on params.
 *
 * @example
 * // Create a hook for fetching teams by organization
 * const useTeamsByOrganization = createParameterizedQuery<Team[], { orgId: string }>({
 *   resource: 'teams',
 *   queryKeyPrefix: 'teams',
 *   enabledFn: (params) => !!params.orgId
 * });
 *
 * // Use in component
 * const { data } = useTeamsByOrganization({ orgId: '123' });
 */
export function createParameterizedQuery<
  T,
  TParams extends Record<string, any> = Record<string, any>,
>(options: CreateParameterizedQueryOptions<T, TParams>) {
  const {
    resource,
    queryKeyPrefix = resource,
    paramTransformer = (params) => params,
    enabledFn = () => true,
  } = options;

  return (
    params: TParams,
    queryOptions?: Omit<
      UseQueryOptions<
        PaginatedResponse<T>,
        Error,
        PaginatedResponse<T>,
        readonly unknown[]
      >,
      "queryKey" | "queryFn"
    >,
  ) => {
    // Transform parameters if needed
    const transformedParams = paramTransformer(params);

    // Extract special _path parameter if it exists
    const pathParam = transformedParams._path;

    delete transformedParams._path;

    // Create query key
    const queryKey = [queryKeyPrefix, params] as const;

    // Build URL query parameters
    const searchParams = new URLSearchParams();

    Object.entries(transformedParams).forEach(([key, value]) => {
      if (value != null) {
        searchParams.append(key, String(value));
      }
    });

    // Build the endpoint URL
    const baseResource = pathParam
      ? `${resource}/${encodeURIComponent(String(pathParam))}`
      : resource;

    const queryString = searchParams.toString();
    const endpoint = queryString ? `${baseResource}?${queryString}` : baseResource;

    // Create query
    return useQuery<
      PaginatedResponse<T>,
      Error,
      PaginatedResponse<T>,
      readonly unknown[]
    >({
      queryKey,
      queryFn: () => apiClient<PaginatedResponse<T>>(endpoint),
      enabled: enabledFn(params),
      ...queryOptions,
    });
  };
}

/**
 * Creates a hook for fetching data with a single parameter query
 *
 * Simplified version for cases where you just need to filter by one parameter.
 * The hook automatically handles undefined/null parameter values and returns
 * an empty array when the parameter is not provided.
 *
 * @example
 * // Create a hook for fetching teams by organization ID
 * const useTeamsByOrganization = createSingleParamQuery<Team, 'org', string>({
 *   resource: 'teams',
 *   paramName: 'org',
 *   queryKeyPrefix: ['teams', 'byOrg']
 * });
 *
 * // Use in a component
 * function TeamList() {
 *   const orgId = '123';
 *   const { data, isLoading } = useTeamsByOrganization(orgId);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   // data.data is guaranteed to be an array (never undefined)
 *   return (
 *     <ul>
 *       {data.data.map(team => (
 *         <li key={team.id}>{team.name}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 */
export function createSingleParamQuery<
  T,
  ParamName extends string,
  ParamType = string | undefined,
>({
  resource,
  paramName,
  queryKeyPrefix = [resource],
  select,
  endpointBuilder,
  enabled = () => true,
}: {
  resource: string;
  paramName: ParamName;
  queryKeyPrefix?: readonly unknown[];
  select?: (data: any) => any;
  endpointBuilder?: (
    resource: string,
    paramName: string,
    value: ParamType,
  ) => string;
  enabled?: (params: Record<ParamName, ParamType>) => boolean;
}) {
  return (
    paramValue: ParamType,
    options?: Omit<
      UseQueryOptions<
        EntityResponse<T[]>,
        Error,
        EntityResponse<T[]>,
        readonly unknown[]
      >,
      "queryKey" | "queryFn"
    >,
  ) => {
    // Create params object for use in enabled function
    const params = { [paramName]: paramValue } as Record<ParamName, ParamType>;

    // Determine if the query should run
    const isQueryEnabled =
      paramValue !== undefined &&
      paramValue !== null &&
      enabled(params) &&
      options?.enabled !== false;

    // Safe string conversion for valid values
    const transformedParam =
      paramValue != null ? String(paramValue) : undefined;

    const queryKey = [
      ...queryKeyPrefix,
      { [paramName]: transformedParam },
    ] as const;

    // Use custom endpoint builder if provided, otherwise use default
    const endpoint = endpointBuilder
      ? endpointBuilder(resource, paramName, paramValue)
      : paramValue != null // Only add param to URL if it exists
        ? `${resource}?${paramName}=${encodeURIComponent(String(paramValue))}`
        : resource;

    return useQuery<EntityResponse<T[]>, Error, EntityResponse<T[]>>({
      queryKey,
      queryFn: async () => {
        // Only fetch if paramValue is provided
        if (paramValue == null) {
          return {
            data: [],
            meta: { total: 0 },
          } as EntityResponse<T[]>;
        }

        return apiClient<EntityResponse<T[]>>(endpoint);
      },
      // Control if query runs
      enabled: isQueryEnabled,
      // Only use custom selector if provided
      select: select || undefined,
      ...options,
    });
  };
}

/**
 * Creates a hook for fetching data with multiple parameters and custom query key
 */
export function createQueryWithParams<
  T,
  TParams extends Record<string, any> = Record<string, any>,
>({
  queryKey,
  queryFn,
  enabled = () => true,
}: {
  queryKey: (params: TParams) => readonly unknown[];
  queryFn: ({
    queryKey,
    signal,
  }: {
    queryKey: readonly unknown[];
    signal?: AbortSignal;
  }) => Promise<any>;
  enabled?: (params: TParams) => boolean;
}) {
  return (
    params: TParams,
    options?: Omit<
      UseQueryOptions<any, Error, any, readonly unknown[]>,
      "queryKey" | "queryFn"
    >,
  ) => {
    // Create the query key based on provided function
    const finalQueryKey = queryKey(params);

    // Determine if the query should run
    const isQueryEnabled = enabled(params) && options?.enabled !== false;

    return useQuery({
      queryKey: finalQueryKey,
      queryFn: ({ signal }) => queryFn({ queryKey: finalQueryKey, signal }),
      enabled: isQueryEnabled,
      ...options,
    });
  };
}
