import { Button } from "@heroui/react";
import { Link } from "react-router-dom";
import { link as linkStyles } from "@heroui/theme";
import clsx from "clsx";

import DropdownNavItem from "./DropdownNavItem";

import { SiteHeaderNavItem } from "@/types";
import useUserStore from "@/store/useUserStore";

interface NavItemProps {
  item: SiteHeaderNavItem;
  bordered: boolean;
}

export default function NavItem({ item, bordered }: NavItemProps) {
  const { user } = useUserStore();

  // Handle dropdown variant
  if (item.variant === "dropdown" && item.children?.length) {
    return <DropdownNavItem item={item} bordered={bordered} />;
  }

  // Handle other variants
  switch (item.variant) {
    case "button":
      return (
        <Button
          as={Link}
          to={item.href}
          radius="sm"
          variant="bordered"
          className="nav-item bg-white text-black border-1 border-branding1"
        >
          {item.label}
        </Button>
      );
    case "highlight":
      return (
        <Link
          className={clsx(linkStyles({ color: "primary" }), "font-medium")}
          to={item.href}
        >
          {item.label}
        </Link>
      );
    case "danger":
      return (
        <Link
          className={clsx(linkStyles({ color: "danger" }), "font-medium")}
          to={item.href}
        >
          {item.label}
        </Link>
      );
    case "welcome-user":
      return (
        <div>
          Hej <b>{user?.firstName}</b>!
        </div>
      );
    default:
      return (
        <Link
          className={clsx(
            linkStyles({ color: "foreground" }),
            "data-[active=true]:text-branding1 data-[active=true]:font-medium",
          )}
          color="foreground"
          to={item.href}
        >
          {item.label}
        </Link>
      );
  }
}
