import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import clsx from "clsx";
import { Icon } from "@iconify/react/dist/iconify.js";

import { SiteHeaderNavItem } from "@/types";
import useUserStore from "@/store/useUserStore";

interface DropdownNavItemProps {
  item: SiteHeaderNavItem;
  bordered?: boolean;
}

export default function DropdownNavItem({
  item,
  bordered,
}: DropdownNavItemProps) {
  const { user } = useUserStore();

  const displayLabel =
    item.useUserName && user?.fullName ? user.fullName : item.label;

  return (
    <Dropdown className="ml-auto">
      <DropdownTrigger>
        <Button
          className={clsx(
            "bg-white text-branding3 text-md",
            bordered && "border-branding3 border-1",
          )}
          variant={bordered ? "bordered" : "light"}
          radius="sm"
        >
          {displayLabel}
          <Icon icon="fe:arrow-down" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label={`${item.label} Options`}>
        {item.children?.map((child: SiteHeaderNavItem, index: number) => (
          <DropdownItem
            key={`${item.label}-${child.href}-${child.label}-${index}`}
            href={child.href}
            className={clsx({
              "text-primary font-medium": child.variant === "highlight",
              "text-danger": child.variant === "danger",
            })}
          >
            {child.label}
          </DropdownItem>
        )) || []}
        {/* Above: Return empty array if there are no children */}
      </DropdownMenu>
    </Dropdown>
  );
}
