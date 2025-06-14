import { SortDescriptor, Selection } from "@heroui/react";

/**
 * Defines the structure of a table column
 *
 * Contains information about how to display and interact with a specific column
 * in a data table, including sort behavior and custom rendering.
 *
 * @template T - The type of data item displayed in the table
 */
export interface Column<T> {
  name: string;
  uid: string;
  sortable?: boolean;
  renderCell?: (item: T, columnKey: React.Key) => React.ReactNode;
}

/**
 * Defines an action that can be performed on selected table items
 *
 * Used for bulk operations in the selection bar when one or more items are selected.
 *
 * @template T - The type of data item displayed in the table
 */
export interface SelectionAction<T> {
  label: string;
  icon?: string;
  color?: "primary" | "success" | "warning" | "danger";
  variant?: "solid" | "bordered" | "light" | "flat" | "ghost";
  onClick: (selectedItems: T[]) => void;
}

/**
 * Defines a filter dropdown for the DataTable header
 *
 * Used to create filter controls that narrow down table data based on specific field values.
 */
export interface TableFilter {
  id: string;
  label: string;
  options: { label: string; value: string }[];
  onSelectionChange: (value: string) => void;
}

/**
 * Main props interface for the DataTable component
 *
 * Provides complete configuration options for rendering and interacting with a data table.
 *
 * @template T - The type of data items displayed in the table
 */
export interface DataTableProps<T extends Record<string, any>> {
  // Data and structure
  items: T[];
  columns: Column<T>[];
  getRowKey: (item: T) => React.Key;

  // Optional table configuration
  initialSortDescriptor?: SortDescriptor;
  initialRowsPerPage?: number;
  selectionMode?: "none" | "single" | "multiple";
  dark?: boolean;

  // Optional UI elements
  title?: string;
  searchPlaceholder?: string;
  noDataContent?: React.ReactNode;
  loadingContent?: React.ReactNode;

  // Custom filtering and sorting
  filterFunction?: (item: T, filterValue: string) => boolean;
  sortFunction?: (items: T[], descriptor: SortDescriptor) => T[];

  // Actions and filters
  actionButtons?: React.ReactNode;
  filterSelects?: TableFilter[];
  onSelectionChange?: (keys: Selection) => void;
  isLoading?: boolean;
  selectionActions?: SelectionAction<T>[];
  onRowClick?: (item: T) => void;
}

/**
 * Props for the TableHeader component
 *
 * Controls the top section of the table with search, filters, and actions.
 *
 * @template T - The type of data items displayed in the table
 */
export interface TableHeaderProps<T> {
  filterValue: string;
  onSearchChange: (value: string) => void;
  rowsPerPage: number;
  onRowsPerPageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  filteredItemsCount: number;
  actionButtons?: React.ReactNode;
  filterSelects?: TableFilter[];
  searchPlaceholder: string;
  setFilterValue: (value: string) => void;
  selectedKeys?: Selection;
  selectionActions?: SelectionAction<T>[];
  selectedItems: T[];
  totalItems: number;
  onClearSelection: () => void;
  selectionMode?: "none" | "single" | "multiple";
  dark?: boolean;
}

/**
 * Props for the TablePagination component
 *
 * Controls the pagination UI at the bottom of the table.
 */
export interface TablePaginationProps {
  page: number;
  pages: number;
  setPage: (page: number) => void;
  itemCount: number;
  selectedKeys: Selection;
  selectionMode: "none" | "single" | "multiple";
  dark?: boolean;
}

/**
 * Props for the TableSelection component
 *
 * Controls the selection bar that appears when items are selected.
 *
 * @template T - The type of data items that can be selected
 */
export interface TableSelectionProps<T> {
  selectedKeys: Selection;
  selectionActions: SelectionAction<T>[];
  selectedItems: T[];
  totalItems: number;
  onClearSelection: () => void;
}

/**
 * Props for the TableSearchBar component
 *
 * Controls the search input field in the table header.
 */
export interface TableSearchBarProps {
  value: string;
  onValueChange: (value: string) => void;
  onClear: () => void;
  placeholder: string;
}

/**
 * Interface defining the common table actions and state returned by useTableActions
 */
export interface TableActions<T> {
  handleEdit: (item: T) => void;
  handleDelete: (item: T) => void;
  handleAdd: () => void;
  handleSelectionChange: (keys: Set<string>) => void;
  selectedItems: T[];
  [key: string]: any;
}

/**
 * Configuration for filtering specific entity types
 */
export interface FilterConfig<T> {
  // Fields to search within (can be direct properties or paths like "owner.name")
  searchFields?: Array<keyof T | string>;
  // Optional custom field extractors for complex objects
  fieldExtractors?: Record<string, (item: T) => string>;
  // Custom filter predicate (overrides default behavior if provided)
  customPredicate?: (item: T, filterValue: string) => boolean;
}

/**
 * Configuration for sorting specific entity types
 */
export interface SortConfig<T> {
  // Custom handling for specific columns
  columnHandlers?: Record<string, (a: T, b: T) => [any, any]>;
  // Default field to sort by if not specified
  defaultField?: string | number;
  // Custom sort predicate (overrides default behavior if provided)
  customSort?: (items: T[], descriptor: SortDescriptor) => T[];
}
