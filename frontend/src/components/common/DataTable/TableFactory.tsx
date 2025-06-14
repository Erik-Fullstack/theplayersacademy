import { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

import DataTable, {
  Column,
  SelectionAction,
} from "@/components/common/DataTable";
import { createTableUtils } from "@/components/common/DataTable/utils";
import { TableFilter } from "@/components/common/DataTable";

/**
 * Base type for entities that can be used in tables created by the factory
 */
type EntityWithId = { id: string };

/**
 * Configuration options for customizing table text elements
 */
interface TableTextOptions {
  title?: string;
  searchPlaceholder?: string;
  noDataContent?: string;
  loadingContent?: string;
}

/**
 * Complete configuration for generating a data table component
 *
 * @template T - The entity type displayed in the table, must include an id field
 */
interface TableFactoryConfig<T extends EntityWithId> {
  // Core entity configuration
  entityName: string;
  entityNamePlural: string;

  // Column configuration
  getColumns: () => Column<T>[];
  searchFields: string[];

  // Customized sort configuration (optional)
  columnSortHandlers?: Record<string, (a: T, b: T) => [any, any]>;
  defaultSortField?: string | number;
  initialSortDirection?: "ascending" | "descending";

  // Filter selects configuration (optional)
  getFilterSelects?: () => TableFilter[];

  // Selection actions (optional)
  getSelectionActions?: (options: {
    onSuccess: () => void;
    onError: (error: Error) => void;
  }) => SelectionAction<T>[];

  // Action buttons
  actionButtons?: ReactNode;

  // Text customizations
  textOptions?: TableTextOptions;

  // Query key for invalidation
  queryKey: string[];
}

/**
 * Factory function to create reusable table components with predefined configurations
 *
 * This factory generates a type-safe React component tailored to display specific entity types
 * with consistent behaviors, filters, and actions while reducing boilerplate code in consuming components.
 *
 * @template T - The entity type displayed in the table, must include an id field
 */
export function createTable<T extends EntityWithId>(
  config: TableFactoryConfig<T>,
) {
  // Create utility functions once
  const { filterFunction, sortFunction } = createTableUtils<T>({
    filter: {
      searchFields: config.searchFields,
    },
    sort: {
      columnHandlers: config.columnSortHandlers || {},
      defaultField: config.defaultSortField || "id",
    },
  });

  /**
   * The generated table component that renders a pre-configured DataTable
   *
   * @returns A fully configured DataTable component specific to the entity type
   */
  return function TableComponent({ items }: { items: T[] }) {
    const queryClient = useQueryClient();

    const columns = config.getColumns();
    const filterSelects = config.getFilterSelects
      ? config.getFilterSelects()
      : undefined;

    /**
     * Selection actions with query invalidation handling
     */
    const selectionActions = config.getSelectionActions
      ? config.getSelectionActions({
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: config.queryKey });
          },
          onError: (error: Error) => {
            console.error(`${config.entityName} action failed:`, error);
          },
        })
      : undefined;

    /**
     * Default text options based on entity name or custom overrides
     */
    const {
      title = config.entityNamePlural,
      searchPlaceholder = `Sök ${config.entityNamePlural.toLowerCase()}...`,
      noDataContent = `Inga ${config.entityNamePlural.toLowerCase()} hittades`,
      loadingContent = `Laddar ${config.entityNamePlural.toLowerCase()}...`,
    } = config.textOptions || {};

    return (
      <DataTable<T>
        items={items}
        columns={columns}
        getRowKey={(item) => item.id}
        initialSortDescriptor={{
          column: config.defaultSortField || "id",
          direction: config.initialSortDirection || "ascending",
        }}
        title={title}
        searchPlaceholder={searchPlaceholder}
        noDataContent={noDataContent}
        loadingContent={loadingContent}
        filterFunction={filterFunction}
        sortFunction={sortFunction}
        actionButtons={config.actionButtons}
        filterSelects={filterSelects}
        selectionMode={selectionActions ? "multiple" : "none"}
        selectionActions={selectionActions}
      />
    );
  };
}
