import { NavbarItem } from "@heroui/react";

import NavItem from "./NavItem";

import { SiteHeaderNavItem } from "@/types";

interface DesktopNavProps {
  navItems: SiteHeaderNavItem[];
}

export default function DesktopNav({ navItems }: DesktopNavProps) {
  return (
    <div className="hidden sm:flex w-full">
      <div className="flex-grow" />
      <ul className="flex gap-6 justify-end items-center mr-2">
        {navItems.map((item: SiteHeaderNavItem, index: number) => (
          <NavbarItem key={`${item.href}-${item.label}-${index}`}>
            <NavItem item={item} bordered={item.bordered || false} />
          </NavbarItem>
        ))}
      </ul>
    </div>
  );
}
