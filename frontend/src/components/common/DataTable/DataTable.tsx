import React, { useMemo, useState, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Selection,
  SortDescriptor,
} from "@heroui/react";
import debounce from "lodash/debounce";

import { DataTableProps } from "./types";
import { defaultFilterFunction, defaultSortFunction } from "./utils";
import TableHeaderComponent from "./TableHeader";
import TablePagination from "./TablePagination";

/**
 * A generic data table component that provides common table functionality
 * including sorting, filtering, pagination, and selection.
 *
 * This component wraps the Hero UI Table with additional features for enterprise use cases.
 *
 * @template T - The type of data items to be displayed in the table
 */
export default function DataTable<T extends Record<string, any>>({
  items,
  columns,
  getRowKey,
  initialSortDescriptor = { column: "", direction: "ascending" },
  initialRowsPerPage = 10,
  selectionMode = "none",
  title = "Tabell",
  searchPlaceholder = "Söker...",
  noDataContent = "Inget innehåll hittat",
  loadingContent = "Laddar innehåll...",
  filterFunction,
  sortFunction,
  filterSelects,
  actionButtons,
  onSelectionChange,
  isLoading = false,
  selectionActions = [],
  onRowClick,
  dark = false,
}: DataTableProps<T>) {
  // Table state
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>(
    initialSortDescriptor,
  );
  const [page, setPage] = useState(1);

  const handleRowClick = useCallback(
    (item: T) => {
      if (onRowClick) {
        // Use setTimeout to prevent long-running operations from blocking the UI
        setTimeout(() => {
          onRowClick(item);
        }, 0);
      }
    },
    [onRowClick],
  );

  /**
   * Updates the selected rows and notifies parent components of the selection change
   */
  const handleSelectionChange = (keys: Selection) => {
    setSelectedKeys(keys);
    if (onSelectionChange) {
      onSelectionChange(keys);
    }
  };

  /**
   * Filters items based on the current search query
   */
  const filteredItems = useMemo(() => {
    if (!filterValue.trim()) return items;

    // To improve performance, only re-filter when items or filterValue change
    const normalizedFilter = filterValue.toLowerCase().trim();

    // Use custom filter function if provided, or default
    return items.filter((item) =>
      filterFunction
        ? filterFunction(item, normalizedFilter)
        : defaultFilterFunction(item, normalizedFilter),
    );
  }, [items, filterValue, filterFunction]);

  /**
   * Calculates pagination and slices the filtered items for the current page
   */
  const pages = Math.ceil(filteredItems.length / rowsPerPage);
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  /**
   * Sorts the paginated items based on the current sort descriptor
   */
  const sortedItems = useMemo(() => {
    if (!sortDescriptor.column) return paginatedItems;

    // Use custom sort function if provided, or default
    return sortFunction
      ? sortFunction([...paginatedItems], sortDescriptor)
      : defaultSortFunction([...paginatedItems], sortDescriptor);
  }, [sortDescriptor, paginatedItems, sortFunction]);

  /**
   * Handles changes to the number of rows per page
   */
  const onRowsPerPageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    [],
  );

  /**
   * Handles changes to the search input, resets to first page
   */
  const onSearchChange = useCallback(
    debounce((value: string) => {
      setFilterValue(value);
      setPage(1);
    }, 300),
    [],
  );

  /**
   * Renders a cell's content based on column definition and item data
   */
  const renderCell = useCallback(
    (item: T, columnKey: React.Key) => {
      // First check if the column has a custom renderer
      const column = columns.find((col) => col.uid === columnKey);

      if (column?.renderCell) {
        return column.renderCell(item, columnKey);
      }

      // Otherwise, render the value directly
      const value = (item as any)[String(columnKey)];

      if (value === null || value === undefined) {
        return "";
      }

      // If it's an object, convert it to a string representation
      if (typeof value === "object") {
        return JSON.stringify(value);
      }

      return String(value);
    },
    [columns],
  );

  /**
   * Retrieves the currently selected items based on selected keys
   */
  const selectedItems = useMemo(() => {
    if (selectedKeys === "all") return items;

    return items.filter((item) =>
      (selectedKeys as Set<React.Key>).has(getRowKey(item)),
    );
  }, [items, selectedKeys, getRowKey]);

  /**
   * Clears the current selection
   */
  const handleClearSelection = useCallback(() => {
    setSelectedKeys(new Set());
  }, []);

  return (
    <div className="w-full overflow-visible">
      <Table
        aria-label={title}
        color="warning"
        className="overflow-visible"
        bottomContent={
          <TablePagination
            dark={dark}
            page={page}
            pages={pages}
            setPage={setPage}
            itemCount={filteredItems.length}
            selectedKeys={selectedKeys}
            selectionMode={selectionMode}
          />
        }
        bottomContentPlacement="outside"
        topContent={
          <TableHeaderComponent
            dark={dark}
            filterValue={filterValue}
            rowsPerPage={rowsPerPage}
            filteredItemsCount={filteredItems.length}
            actionButtons={actionButtons}
            filterSelects={filterSelects}
            searchPlaceholder={searchPlaceholder}
            setFilterValue={setFilterValue}
            selectedKeys={selectedKeys}
            selectionActions={selectionActions}
            selectedItems={selectedItems}
            totalItems={items.length}
            selectionMode={selectionMode}
            onSearchChange={onSearchChange}
            onRowsPerPageChange={onRowsPerPageChange}
            onClearSelection={handleClearSelection}
          />
        }
        topContentPlacement="outside"
        sortDescriptor={sortDescriptor}
        selectedKeys={selectedKeys}
        selectionMode={selectionMode}
        onSelectionChange={handleSelectionChange}
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "end" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent={noDataContent}
          items={sortedItems}
          loadingContent={loadingContent}
          isLoading={isLoading}
        >
          {(item) => (
            <TableRow
              key={getRowKey(item)}
              className="cursor-pointer hover:bg-default-100 rounded-lg"
              onClick={() => handleRowClick(item)}
            >
              {(columnKey) => (
                <TableCell className="first:rounded-l-lg last:rounded-r-lg">
                  {renderCell(item, columnKey)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
