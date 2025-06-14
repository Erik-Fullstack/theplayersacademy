import { NavbarMenu, NavbarMenuItem } from "@heroui/react";
import { Link } from "react-router-dom";

import { SiteHeaderNavItem } from "@/types";

interface MobileNavProps {
  mobileNavItems: SiteHeaderNavItem[];
  onLinkClick: () => void;
}

export default function MobileNav({
  mobileNavItems,
  onLinkClick,
}: MobileNavProps) {
  const renderMobileNavItem = (item: SiteHeaderNavItem) => {
    // Special handling for dropdown items in mobile view
    if (item.variant === "dropdown" && item.children?.length) {
      return (
        <>
          {/* For mobile, render a header for the dropdown section */}
          <NavbarMenuItem className="font-bold opacity-70">
            {item.label}
          </NavbarMenuItem>

          {/* Render each child */}
          {item.children.map((child: SiteHeaderNavItem, childIndex: number) => (
            <NavbarMenuItem
              key={`${child.href}-${childIndex}`}
              className="ml-4"
            >
              <Link
                color={
                  child.variant === "highlight"
                    ? "primary"
                    : child.variant === "danger"
                      ? "danger"
                      : "foreground"
                }
                to={child.href}
                onClick={onLinkClick}
              >
                {child.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </>
      );
    }

    // Regular mobile nav item
    return (
      <NavbarMenuItem>
        <Link
          color={
            item.variant === "highlight"
              ? "primary"
              : item.variant === "danger"
                ? "danger"
                : "foreground"
          }
          to={item.href}
          onClick={onLinkClick}
        >
          {item.label}
        </Link>
      </NavbarMenuItem>
    );
  };

  return (
    <NavbarMenu>
      <div className="mx-4 mt-2 flex flex-col gap-2">
        {mobileNavItems
          .filter((item) => item.showOnMobile !== false)
          .map((item, index) => (
            <div key={`${item.href}-${index}`}>{renderMobileNavItem(item)}</div>
          ))}
      </div>
    </NavbarMenu>
  );
}
