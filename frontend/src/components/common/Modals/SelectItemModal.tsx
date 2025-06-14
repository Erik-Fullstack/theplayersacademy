import { useState, useMemo } from "react";
import {
  Autocomplete,
  AutocompleteItem,
  Card,
  CardBody,
  Button,
  addToast,
} from "@heroui/react";

import useUserStore from "@/store/useUserStore";
import { IUser } from "@/types";

// Generic item interface with minimal required properties
interface SelectableItem {
  id: string;
  [key: string]: any;
}

interface SelectItemModalProps<T extends SelectableItem> {
  user: IUser;
  title: string;
  emptyMessage: string;
  loadingMessage: string;
  buttonText: string;
  successTitle: string;
  successMessageTemplate?: string;
  items: T[];
  isLoading: boolean;
  getItemLabel: (item: T) => string;
  getItemValue: (item: T) => string;
  userItems?: T[];
  onAddItem: (itemId: string, userId: string) => Promise<any>;
  onSuccess?: () => void;
  shouldRefreshUser?: boolean;
}

export default function SelectItemModal<T extends SelectableItem>({
  user,
  title,
  emptyMessage,
  loadingMessage,
  buttonText,
  successTitle,
  successMessageTemplate,
  items,
  isLoading,
  getItemLabel,
  getItemValue,
  userItems = [],
  onAddItem,
  onSuccess,
  shouldRefreshUser = true,
}: SelectItemModalProps<T>) {
  const { refreshUser } = useUserStore();

  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter out items the user already has
  const userItemIds = new Set((userItems || []).map((item) => item.id));
  const availableItems = items.filter((item) => !userItemIds.has(item.id));

  // Format options for the Autocomplete
  const itemOptions = useMemo(() => {
    return availableItems.map((item) => ({
      value: getItemValue(item),
      label: getItemLabel(item),
      item: item,
    }));
  }, [availableItems, getItemLabel, getItemValue]);

  // Handle item selection
  const handleSelectionChange = (selectedKey: React.Key | null) => {
    if (!selectedKey) {
      setSelectedItem(null);

      return;
    }

    const item =
      availableItems.find((i) => getItemValue(i) === selectedKey.toString()) ||
      null;

    setSelectedItem(item);
  };

  const handleAddItem = async () => {
    if (!selectedItem || !user) return;

    setIsSubmitting(true);

    try {
      await onAddItem(selectedItem.id, user.id);

      if (successMessageTemplate) {
        addToast({
          title: successTitle,
          description: successMessageTemplate.replace(
            "{item}",
            getItemLabel(selectedItem),
          ),
          timeout: 5000,
          icon: "mingcute:check-circle-fill",
          color: "success"
        });
      }

      setSelectedItem(null);

      if (shouldRefreshUser) {
        await refreshUser();
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      addToast({
        title: "Ett fel uppstod",
        description: error instanceof Error ? error.message : "Något gick fel",
        timeout: 5000,
        color: "danger",
        icon: "mingcute:alert-fill"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (availableItems.length === 0) {
    return (
      <Card>
        <CardBody>
          <p className="text-center text-gray-500">
            {isLoading ? loadingMessage : emptyMessage}
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Autocomplete
        label={title}
        aria-label={title}
        placeholder={`Sök...`}
        defaultItems={itemOptions}
        isDisabled={isLoading || isSubmitting}
        defaultSelectedKey={
          selectedItem ? getItemValue(selectedItem) : undefined
        }
        onSelectionChange={handleSelectionChange}
      >
        {(item) => (
          <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>
        )}
      </Autocomplete>

      <Button
        color="warning"
        className="w-full"
        isDisabled={!selectedItem || isSubmitting}
        isLoading={isSubmitting}
        aria-label={buttonText}
        onPress={handleAddItem}
      >
        {buttonText}
      </Button>
    </div>
  );
}
