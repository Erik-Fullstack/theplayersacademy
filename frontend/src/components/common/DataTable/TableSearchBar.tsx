import { useState, useEffect, useCallback } from "react";
import { Input } from "@heroui/react";
import { Icon } from "@iconify/react";

import { TableSearchBarProps } from "./types";

/**
 * TableSearchBar component for DataTable
 *
 * Provides a search input field with an icon and clear button functionality.
 * Used for filtering table data by user input, with configurable placeholder text.
 * Automatically handles value changes and clear actions through provided callbacks.
 */
export default function TableSearchBar({
  value,
  onValueChange,
  onClear,
  placeholder,
}: TableSearchBarProps) {
  // Create a local state to track input changes
  const [inputValue, setInputValue] = useState(value);

  // Sync local state with props when value changes from outside

  // Debounce the actual search
  useEffect(() => {
    if (inputValue === value) return; // Skip if unchanged

    const timer = setTimeout(() => {
      onValueChange(inputValue);
    }, 300); // 300ms delay before applying the search

    return () => clearTimeout(timer);
  }, [inputValue, onValueChange, value]);

  // Handle clear action
  const handleClear = useCallback(() => {
    setInputValue("");
    if (onClear) onClear();
  }, [onClear]);

  return (
    <Input
      isClearable
      placeholder={placeholder}
      value={inputValue}
      startContent={
        <Icon icon="mingcute:search-line" className="text-default-300" />
      }
      className="w-full md:max-w-[40%]"
      onValueChange={setInputValue}
      onClear={handleClear}
    />
  );
}
