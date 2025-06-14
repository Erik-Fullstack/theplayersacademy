import { SortDescriptor } from "@heroui/react";
import React from "react";

import { FilterConfig, SortConfig } from "./types";

/**
 * Get a value from an object using a path string (e.g., "owner.firstName")
 */
export function getValueByPath(obj: any, path: string) {
  const parts = path.split(".");
  let current = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[part];
  }

  return current;
}

/**
 * Extract searchable text from an item
 */
function extractSearchableText<T>(
  item: T,
  config: FilterConfig<T> = {},
): string[] {
  const searchTexts: string[] = [];

  // If specific search fields are provided, use those
  if (config.searchFields?.length) {
    config.searchFields.forEach((field) => {
      const fieldAsString = String(field);

      // Check if we have a custom extractor for this field
      if (config.fieldExtractors && fieldAsString in config.fieldExtractors) {
        const extract = config.fieldExtractors[fieldAsString];

        searchTexts.push(extract(item).toLowerCase());

        return;
      }

      // Handle dot notation for nested properties
      if (fieldAsString.includes(".")) {
        const value = getValueByPath(item, fieldAsString);

        if (value !== undefined && value !== null) {
          searchTexts.push(String(value).toLowerCase());
        }

        return;
      }

      // Handle regular properties
      const value = item[field as keyof T];

      if (value !== undefined && value !== null) {
        searchTexts.push(String(value).toLowerCase());
      }
    });
  } else {
    // Otherwise, try to extract text from all direct properties
    const objectEntries = Object.entries(item as any);

    objectEntries.forEach(([_, value]) => {
      if (value === null || value === undefined) return;

      if (typeof value !== "object") {
        searchTexts.push(String(value));
      }
    });
  }

  return searchTexts.map((text) => text.toLowerCase());
}

/**
 * Create a generic filter function using a configuration
 */
export function createFilterFunction<T extends Record<string, any>>(
  config: FilterConfig<T> = {},
) {
  return (item: T, filterValue: string): boolean => {
    // If a custom predicate is provided, use it
    if (config.customPredicate) {
      return config.customPredicate(item, filterValue);
    }

    const lowercasedFilter = filterValue.toLowerCase().trim();

    if (!lowercasedFilter) return true;

    // Extract searchable text from the item
    const searchTexts = extractSearchableText(item, config);

    // Check if any of the extracted texts include the filter value
    return searchTexts.some((text) => text.includes(lowercasedFilter));
  };
}

/**
 * Default filter function with improved object handling
 */
export function defaultFilterFunction<T extends Record<string, any>>(
  item: T,
  filterValue: string
): boolean {
  return createFilterFunction<T>()(item, filterValue);
}

/**
 * Create a generic sort function using a configuration
 */
export function createSortFunction<T extends Record<string, any>>(
  config: SortConfig<T> = {}
) {
  return (items: T[], descriptor: SortDescriptor): T[] => {
    // If a custom sort is provided, use it
    if (config.customSort) {
      return config.customSort(items, descriptor);
    }

    // No sorting if no column specified
    if (!descriptor.column) {
      return items;
    }

    const column = descriptor.column.toString();

    return [...items].sort((a, b) => {
      // Check if we have a custom handler for this column
      if (config.columnHandlers && column in config.columnHandlers) {
        const [valA, valB] = config.columnHandlers[column](a, b);

        return compareValues(valA, valB, descriptor.direction === "descending");
      }

      // Handle dot notation for nested properties
      if (column.includes(".")) {
        const valA = getValueByPath(a, column);
        const valB = getValueByPath(b, column);

        return compareValues(valA, valB, descriptor.direction === "descending");
      }

      // Normal property access
      const valA = a[column as keyof T];
      const valB = b[column as keyof T];

      return compareValues(valA, valB, descriptor.direction === "descending");
    });
  };
}

/**
 * Compare two values for sorting
 */
function compareValues(a: any, b: any, isDescending = false): number {
  if (a === b) return 0;

  // Handle null and undefined
  if (a == null) return isDescending ? 1 : -1;
  if (b == null) return isDescending ? -1 : 1;

  // Try to convert to numbers if possible
  if (!isNaN(Number(a)) && !isNaN(Number(b))) {
    return isDescending ? Number(b) - Number(a) : Number(a) - Number(b);
  }

  // String comparison
  const strA = String(a).toLowerCase();
  const strB = String(b).toLowerCase();

  return isDescending ? strB.localeCompare(strA) : strA.localeCompare(strB);
}

/**
 * Default sort function - now with improved type safety
 */
export function defaultSortFunction<T extends Record<string, any>>(
  items: T[],
  descriptor: SortDescriptor,
): T[] {
  return createSortFunction<T>()(items, descriptor);
}

/**
 * Get default cell renderer with improved object handling
 */
export function defaultCellRenderer<T>(
  item: T,
  columnKey: React.Key,
): React.ReactNode {
  const value = (item as any)[String(columnKey)];

  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

/**
 * Create a table configuration that includes both filtering and sorting
 */
export function createTableUtils<T extends Record<string, any>>(
  config: {
    filter?: FilterConfig<T>;
    sort?: SortConfig<T>;
  } = {},
) {
  return {
    filterFunction: createFilterFunction<T>(config.filter),
    sortFunction: createSortFunction<T>(config.sort),
  };
}
