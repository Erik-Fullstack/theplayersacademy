import { addToast } from "@heroui/react";

/**
 * Configuration for CSV export
 */
export interface CSVExportConfig<T> {
  /** Data to export */
  data: T[];
  /** File name (without extension) */
  fileName?: string;
  /** Column definitions */
  columns: {
    /** Header label */
    header: string;
    /** Function to get the value from an item */
    accessor: (item: T) => string | number | null | undefined;
  }[];
  /** Show toast notification on completion */
  showToast?: boolean;
}

/**
 * Exports data to a CSV file and triggers download
 *
 * @param config Export configuration
 */
export function exportToCSV<T>(config: CSVExportConfig<T>): void {
  const { data, fileName = "export", columns, showToast = true } = config;

  try {
    // Create headers row
    const headers = columns.map((col) => col.header).join(",");

    // Create data rows
    const rows = data
      .map((item) => {
        return columns
          .map((column) => {
            // Get the value and handle null/undefined
            const value = column.accessor(item) ?? "";

            // Properly escape values with commas or quotes
            if (
              typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }

            return value;
          })
          .join(",");
      })
      .join("\n");

    // Combine headers and rows
    const csv = `${headers}\n${rows}`;

    // Create and download the file
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show success notification
    if (showToast) {
      addToast({
        title: "Export slutförd",
        description: `${data.length} poster har exporterats`,
        timeout: 5000,
        shouldShowTimeoutProgress: true,
        icon: "mingcute:check-circle-fill",
        color: "success"
      });
    }
  } catch (error) {
    console.error("Error exporting to CSV:", error);

    // Show error notification
    if (showToast) {
      addToast({
        title: "Export misslyckades",
        description: "Ett fel uppstod vid export av data",
        color: "danger",
        icon: "mingcute:alert-fill",
        timeout: 5000
      });
    }
  }
}
