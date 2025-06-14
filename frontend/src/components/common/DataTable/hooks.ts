import { useState, useMemo } from "react";

import { getValueByPath } from "./utils";
import { TableActions } from "./types";

/**
 * Hook that provides common table action handlers and selection state management
 *
 * Manages selection state and provides standardized handlers for edit, delete,
 * add, and selection change events that can be used with DataTable components.
 *
 * @template T - Type of data items, must include an id property
 */
export function useTableActions<T extends { id: string }>(
  items: T[],
  options: {
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    onAdd?: () => void;
    onSelectionChange?: (selectedItems: T[]) => void;
    customActions?: Record<string, (item: T) => void>;
  },
): TableActions<T> {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  // Filtered items based on the current selection state
  const selectedItems = items.filter((item) =>
    selectedKeys.has(item.id.toString()),
  );

  // Create standard action handlers
  const standardActions = {
    // Handle edit action
    handleEdit: (item: T) => {
      if (options.onEdit) {
        options.onEdit(item);
      }
    },

    // Handle delete action
    handleDelete: (item: T) => {
      if (options.onDelete) {
        options.onDelete(item);
      }
    },

    // Handle add action
    handleAdd: () => {
      if (options.onAdd) {
        options.onAdd();
      }
    },

    // Handle selection change
    handleSelectionChange: (keys: Set<string>) => {
      setSelectedKeys(keys);

      if (options.onSelectionChange) {
        const selected = items.filter((item) => keys.has(item.id.toString()));

        options.onSelectionChange(selected);
      }
    },

    // Current selection state
    selectedItems,
  };

  // Create custom action handlers (prefixed with 'handle')
  const customActionHandlers: Record<string, (item: T) => void> = {};

  if (options.customActions) {
    for (const [actionName, actionFn] of Object.entries(
      options.customActions,
    )) {
      // Convert from camelCase to handle format (e.g., assignSeat -> handleAssignSeat)
      const handlerName = `handle${actionName.charAt(0).toUpperCase()}${actionName.slice(1)}`;

      customActionHandlers[handlerName] = actionFn;
    }
  }

  // Combine standard and custom actions
  return {
    ...standardActions,
    ...customActionHandlers,
  };
}

/**
 * Hook to create and manage data table filters
 *
 * Extracts unique values from specified fields in the data items to create
 * filter options, manages filter state, and returns filtered items based on
 * the current filter selections.
 *
 * @template T - Type of data items to filter
 */
export function useDataTableFilters<T extends Record<string, any>>(
  items: T[],
  filterConfig: {
    filters: {
      id: string;
      label: string;
      field: keyof T | string;
      sortFn?: (a: string, b: string) => number;
      transform?: (item: T) => string;
    }[];
  },
) {
  /**
   * State holding the current value for each filter
   */
  const [filterValues, setFilterValues] = useState<Record<string, string>>(
    Object.fromEntries(filterConfig.filters.map((filter) => [filter.id, ""])),
  );

  /**
   * Creates filter select components with options extracted from the data
   */
  const filterSelects = useMemo(() => {
    return filterConfig.filters.map((filter) => {
      // Extract values using the transform function if provided
      const values = items.map((item) => {
        if (filter.transform) {
          return filter.transform(item);
        } else if (filter.field.toString().includes(".")) {
          return getValueByPath(item, filter.field.toString());
        } else {
          return item[filter.field as keyof T];
        }
      });

      // Get unique values
      const uniqueValues = new Set(values.map(String));

      // Convert to options array
      let options = Array.from(uniqueValues).map((value) => ({
        label: value,
        value: value,
      }));

      // Apply custom sort if provided
      if (filter.sortFn) {
        options = options.sort((a, b) => filter.sortFn!(a.value, b.value));
      }

      return {
        id: filter.id,
        label: filter.label,
        options,
        onSelectionChange: (value: string) => {
          setFilterValues((prev) => ({ ...prev, [filter.id]: value }));
        },
      };
    });
  }, [items, filterConfig]);

  /**
   * Filters items based on the current filter values
   */
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      return filterConfig.filters.every((filter) => {
        const filterValue = filterValues[filter.id];

        if (!filterValue) return true;

        // Use the transform function for filtering if provided
        if (filter.transform) {
          const transformedValue = filter.transform(item);

          return String(transformedValue) === filterValue;
        } else if (filter.field.toString().includes(".")) {
          const itemValue = String(
            getValueByPath(item, filter.field.toString()),
          );

          return itemValue === filterValue;
        } else {
          const itemValue = String(item[filter.field as keyof T]);

          return itemValue === filterValue;
        }
      });
    });
  }, [items, filterValues, filterConfig.filters]);

  return {
    filterSelects,
    filteredItems,
    filterValues,
    setFilterValues,
    resetFilters: () =>
      setFilterValues(
        Object.fromEntries(
          filterConfig.filters.map((filter) => [filter.id, ""]),
        ),
      ),
  };
}
