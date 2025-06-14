import React from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

import { TableSelectionProps } from "./types";

/**
 * TableSelection component for DataTable
 *
 * Displays a selection bar that appears when table rows are selected, showing
 * how many items are currently selected and providing action buttons for
 * bulk operations on the selected items.
 *
 * The component handles two selection modes:
 * - "all" selection: when all items in the table are selected
 * - partial selection: when a specific set of items is selected
 *
 * @template T - The type of data items that can be selected
 */
export default function TableSelection<T>({
  selectedKeys,
  selectionActions,
  selectedItems,
  totalItems,
  onClearSelection,
}: TableSelectionProps<T>) {
  return (
    <div className="bg-content2 border border-divider rounded-lg p-2 mb-2 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <Icon
          icon="mingcute:check-fill"
          className="text-branding3"
          width={20}
          height={20}
        />
        <span className="text-sm">
          {selectedKeys === "all"
            ? `Alla ${totalItems} objekt markerade`
            : `${(selectedKeys as Set<React.Key>).size} ${
                (selectedKeys as Set<React.Key>).size === 1
                  ? "objekt"
                  : "objekt"
              } markerade`}
        </span>
      </div>

      <div className="flex gap-2">
        {selectionActions.map((action, index) => (
          <Button
            key={index}
            color={action.color || "warning"}
            variant={action.variant || "light"}
            size="sm"
            startContent={
              action.icon && <Icon icon={action.icon} width={18} height={18} />
            }
            onPress={() => action.onClick(selectedItems)}
          >
            {action.label}
          </Button>
        ))}
        <Button
          variant="flat"
          size="sm"
          color="warning"
          startContent={<Icon icon="tdesign:clear" width={16} height={16} />}
          onPress={onClearSelection}
        >
          Rensa
        </Button>
      </div>
    </div>
  );
}
