import { useLocation } from "react-router-dom";
import { cloneDeep } from "lodash";

import { SiteHeaderNavItem } from "@/types";
import { siteConfig } from "@/config/site";
import useUserStore from "@/store/useUserStore";

export function useNavigation(
  navType:
    | "auto"
    | "frontPage"
    | "userDashboard"
    | "adminDashboard"
    | "superadminDashboard" = "auto",
) {
  const location = useLocation();
  const { user } = useUserStore();
  const userRole = user?.role;

  let actualNavType = navType;

  if (navType === "auto") {
    const { pathname } = location;

    // Public pages that should always show frontPage navigation
    const frontPagePaths = [
      "/",
      "/faq",
      "/spelarutbildningsplan",
      "/login",
      "/register",
    ];

    if (frontPagePaths.includes(pathname)) {
      actualNavType = "frontPage";
    }
    // When logged in, base navigation on user role
    else if (user) {
      if (userRole === "SUPERADMIN") {
        actualNavType = "superadminDashboard";
      } else if (userRole === "ADMIN") {
        actualNavType = "adminDashboard";
      } else {
        actualNavType = "userDashboard";
      }
    }
    // Default to frontPage for non-logged in users
    else {
      actualNavType = "frontPage";
    }
  }

  // Get the appropriate navigation configuration
  let navItems: SiteHeaderNavItem[] = [];
  let mobileNavItems: SiteHeaderNavItem[] = [];

  switch (actualNavType) {
    case "superadminDashboard":
      navItems = cloneDeep(siteConfig.superadminDashboard.navItems);
      mobileNavItems = cloneDeep(
        siteConfig.superadminDashboard.mobileNavItems || navItems,
      );
      break;
    case "adminDashboard":
      navItems = cloneDeep(siteConfig.adminDashboard.navItems);
      mobileNavItems = cloneDeep(
        siteConfig.adminDashboard.mobileNavItems || navItems,
      );
      break;
    case "userDashboard":
      navItems = cloneDeep(siteConfig.userDashboard.navItems);
      mobileNavItems = cloneDeep(
        siteConfig.userDashboard.mobileNavItems || navItems,
      );
      break;
    case "frontPage":
    default:
      navItems = cloneDeep(siteConfig.frontPage.navItems);
      mobileNavItems = cloneDeep(
        siteConfig.frontPage.mobileNavItems || navItems,
      );
      break;
  }

  // Process navigation items recursively to filter by login status and role
  const processItems = (items: SiteHeaderNavItem[]): SiteHeaderNavItem[] => {
    return items
      .filter((item) => {
        // Login status filtering
        if (user && item.showWhenLoggedOut) return false;
        if (!user && item.showWhenLoggedIn) return false;

        return true;
      })
      .map((item) => {
        // Clone the item to avoid modifying the original
        const processedItem = { ...item };

        // Process children recursively if they exist
        if (processedItem.children && processedItem.children.length > 0) {
          // Filter children based on roles if specified
          processedItem.children = processedItem.children.filter((child) => {
            // If no roles are specified, show to everyone
            if (!child.roles || child.roles.length === 0) return true;

            // If roles are specified, only show if user role matches
            return userRole && child.roles.includes(userRole);
          });
        }

        return processedItem;
      });
  };

  // Apply processing to both navigation types
  navItems = processItems(navItems);
  mobileNavItems = processItems(mobileNavItems);

  return { navItems, mobileNavItems, navType: actualNavType };
}
