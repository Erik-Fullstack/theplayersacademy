import { useState } from "react";
import {
  Navbar,
  NavbarContent,
  NavbarMenuToggle,
  NavbarBrand,
} from "@heroui/react";
import { Link } from "react-router-dom";
import clsx from "clsx";

import { useNavigation } from "./useNavigation";
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";

import { siteConfig } from "@/config/site";
import Logo from "@/assets/logo_01.svg";

interface SiteHeaderProps {
  bg?: string;
  className?: string;
  navType?:
    | "auto"
    | "frontPage"
    | "userDashboard"
    | "adminDashboard"
    | "superadminDashboard";
}

export default function SiteHeader({
  bg = "white",
  className,
  navType = "auto",
}: SiteHeaderProps) {
  const { navItems, mobileNavItems } = useNavigation(navType);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const bgClass = `bg-${bg}`;

  return (
    <Navbar
      maxWidth="2xl"
      position="sticky"
      isBlurred={false}
      className={clsx("site-header", bgClass, className)}
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <Link className="flex justify-start items-center gap-4" to="/">
            <img src={Logo} alt="Logga" className="w-8" />
            <p className="hidden lg:block font-semibold text-branding1">
              {siteConfig.name}
            </p>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      {/* Desktop navigation with left/right aligned items */}
      <NavbarContent className="hidden sm:flex basis-4/5" justify="center">
        <DesktopNav navItems={navItems} />
      </NavbarContent>

      {/* Mobile navigation toggle */}
      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <NavbarMenuToggle />
      </NavbarContent>

      <MobileNav
        mobileNavItems={mobileNavItems}
        onLinkClick={() => setIsMenuOpen(false)}
      />
    </Navbar>
  );
}
