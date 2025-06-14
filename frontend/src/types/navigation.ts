export type NavItemVariant =
  | "default"
  | "button"
  | "highlight"
  | "danger"
  | "welcome-user"
  | "dropdown";

export interface SiteHeaderNavItem {
  label: string;
  href: string;
  variant?: NavItemVariant;
  alignment?: "left" | "right";
  children?: SiteHeaderNavItem[];
  useUserName?: boolean;
  showWhenLoggedIn?: boolean;
  showWhenLoggedOut?: boolean;
  showOnMobile?: boolean;
  roles?: string[];
  includeDashboardLinks?: boolean;
  bordered?: boolean;
}

export interface SiteSection {
  navItems: SiteHeaderNavItem[];
  mobileNavItems?: SiteHeaderNavItem[];
}
