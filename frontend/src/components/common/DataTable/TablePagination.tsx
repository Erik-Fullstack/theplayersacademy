import { Pagination } from "@heroui/react";

import { TablePaginationProps } from "./types";

/**
 * TablePagination component for DataTable
 *
 * Renders pagination controls at the bottom of a data table along with
 * selection status information when items are selected.
 *
 * Provides navigation between table pages and displays how many items are
 * currently selected out of the total available.
 */
export default function TablePagination({
  page,
  pages,
  setPage,
  itemCount,
  selectedKeys,
  selectionMode,
  dark = false,
}: TablePaginationProps) {
  return (
    <div className="py-2 px-2 flex flex-col sm:flex-row justify-between items-center">
      <Pagination
        showControls
        color="warning"
        page={page}
        total={pages}
        className="mr-2"
        onChange={setPage}
      />
      {selectionMode !== "none" && (
        <span
          className={`text-small ${dark ? "text-white" : "text-default-400"} mt-2 sm:mt-0`}
        >
          {selectedKeys === "all"
            ? "Allt är markerat"
            : `${selectedKeys.size} av ${itemCount} markerade`}
        </span>
      )}
    </div>
  );
}
