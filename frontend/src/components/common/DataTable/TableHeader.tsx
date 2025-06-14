import { Select, SelectItem } from "@heroui/react";
import { useMemo, useCallback } from "react";
import debounce from "lodash/debounce";

import { TableHeaderProps } from "./types";
import TableSearchBar from "./TableSearchBar";
import TableSelection from "./TableSelection";

/**
 * TableHeader component for DataTable
 *
 * Provides the top section of a data table with search functionality,
 * filter dropdowns, action buttons, selection indicators, and pagination controls.
 *
 * @template T - The type of data items in the table
 */
export default function TableHeader<T extends Record<string, any>>({
  filterValue,
  onSearchChange,
  rowsPerPage,
  onRowsPerPageChange,
  filteredItemsCount,
  actionButtons,
  filterSelects,
  searchPlaceholder,
  setFilterValue,
  selectedKeys,
  selectionActions,
  selectedItems,
  totalItems,
  onClearSelection,
  selectionMode,
  dark = false,
}: TableHeaderProps<T>) {
  /**
   * Creates select dropdown options from the provided options array
   *
   * @returns An array of SelectItem components
   */
  const renderSelectOptions = useCallback(
    (options: { label: string; value: string }[]) => {
      // First add the "All" option
      // const allOptions = [{ label: "Alla", value: "" }, ...options];
      const allOptions = options;

      // Return the JSX elements one by one, not as an array
      return allOptions.map((option) => (
        <SelectItem key={option.value}>{option.label}</SelectItem>
      ));
    },
    [],
  );

  // Debounce the search change handler
  const debouncedSearchChange = useCallback(
    debounce((value: string) => {
      onSearchChange(value);
    }, 250),
    [onSearchChange],
  );

  /**
   * Handles selection changes in filter dropdowns
   *
   * Extracts the selected value from the Hero UI selection keys format
   * and passes the value to the provided onChange handler.
   */
  const handleSelectionChange = useCallback(
    (keys: any, onSelectionChange: (value: string) => void) => {
      let value = "";

      if (keys && typeof keys === "object" && "has" in keys) {
        const keySet = keys as Set<string>;

        if (keySet.size > 0) {
          value = Array.from(keySet)[0];
        }
      }

      // Use setTimeout to avoid blocking the UI thread
      setTimeout(() => {
        onSelectionChange(value);
      }, 0);
    },
    [],
  );

  // Memoize filter selects to prevent unnecessary re-renders
  const filterSelectsSection = useMemo(() => {
    if (!filterSelects || filterSelects.length === 0) return null;

    return (
      <div className="flex gap-2 items-center">
        {filterSelects.map((filter) => (
          <div key={filter.id} className="min-w-[120px]">
            <Select
              label={filter.label}
              size="md"
              placeholder={filter.label}
              labelPlacement="outside"
              className={`max-w-xs ${dark ? "dark-label" : ""}`}
              onSelectionChange={(keys) =>
                handleSelectionChange(keys, filter.onSelectionChange)
              }
            >
              {renderSelectOptions(filter.options)}
            </Select>
          </div>
        ))}
      </div>
    );
  }, [filterSelects, handleSelectionChange, renderSelectOptions]);

  // Memoize selection bar
  const selectionBar = useMemo(() => {
    if (
      selectionMode !== "multiple" ||
      !selectedKeys ||
      (selectedKeys !== "all" && (selectedKeys as Set<React.Key>).size === 0)
    ) {
      return null;
    }

    return (
      <TableSelection
        selectedKeys={selectedKeys}
        selectionActions={selectionActions || []}
        selectedItems={selectedItems}
        totalItems={totalItems}
        onClearSelection={onClearSelection}
      />
    );
  }, [
    selectionMode,
    selectedKeys,
    selectionActions,
    selectedItems,
    totalItems,
    onClearSelection,
  ]);

  const handleClearSearch = useCallback(() => {
    setFilterValue("");
  }, [setFilterValue]);

  return (
    <div className="flex flex-col gap-4">
      {/* Top row with search, filters and actions */}
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-end">
        <TableSearchBar
          value={filterValue}
          placeholder={searchPlaceholder}
          onValueChange={debouncedSearchChange}
          onClear={handleClearSearch}
        />

        {/* Filter selects */}
        {filterSelectsSection}

        {actionButtons && <div>{actionButtons}</div>}
      </div>

      {/* Selection bar - only show for multiple selection mode */}
      {selectionBar}

      {/* Bottom row with table info */}
      <div className="flex justify-between items-center">
        <span className={`${dark ? "text-white" : "text-default-400"} text-sm`}>
          Totalt {filteredItemsCount} objekt
        </span>
        <label
          className={`flex items-center ${dark ? "text-white" : "text-default-400"} text-sm`}
        >
          Rader per sida:
          <select
            className={`bg-transparent outline-none ${dark ? "text-white" : "text-default-400"} ml-2`}
            value={String(rowsPerPage)}
            onChange={onRowsPerPageChange}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
          </select>
        </label>
      </div>
    </div>
  );
}
