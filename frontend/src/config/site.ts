export type SiteConfig = typeof siteConfig;
import { API_BASE_URL } from "@/config/api";
import { SiteSection } from "@/types";

export const siteConfig = {
  name: "The Players Academy",
  description: "Varför Players Academy?",
  frontPage: {
    navItems: [
      {
        label: "Vår spelarutbildningsplan",
        href: "/spelarutbildningsplan",
      },
      { label: "Frågor & Svar", href: "/faq" },
      { label: "Kom igång", href: "/onboarding" },
      {
        label: "Logga in",
        href: `${API_BASE_URL}/auth/google`,
        variant: "button",
        showWhenLoggedOut: true,
      },
      {
        label: "Inställningar",
        href: "#",
        variant: "dropdown",
        useUserName: true,
        showWhenLoggedIn: true,
        children: [
          { label: "Dashboard", href: "/dashboard", roles: ["USER", "ADMIN"] },
          { label: "Dashboard", href: "/superadmin", roles: ["SUPERADMIN"] },
          {
            label: "Våra tränare",
            href: "/organization/coaches",
            roles: ["ADMIN"],
          },
          { label: "Våra lag", href: "/organization/teams", roles: ["ADMIN"] },
          { label: "Kurser", href: "/organization/courses", roles: ["ADMIN"] },
          {
            label: "Föreningsinställningar",
            href: "/organization/settings",
            roles: ["ADMIN"],
          },
          {
            label: "Föreningar",
            href: "/superadmin/organizations",
            roles: ["SUPERADMIN"],
          },
          {
            label: "Hantera priser",
            href: "/superadmin/edit-prices",
            roles: ["SUPERADMIN"],
          },
          {
            label: "Hantera sidor",
            href: "/superadmin/edit-pages",
            roles: ["SUPERADMIN"],
          },
          {
            label: "Hantera kurser",
            href: "/superadmin/edit-courses",
            roles: ["SUPERADMIN"],
          },
          { label: "Mitt konto", href: "/my-account/settings" },
          { label: "Logga ut", href: "/logout", variant: "danger" },
        ],
      },
    ],
    mobileNavItems: [
      { label: "Vår spelarutbildningsplan", href: "/spelarutbildningsplan" },
      { label: "Frågor & Svar", href: "/faq" },
      { label: "Kom igång", href: "/onboarding" },
      {
        label: "Dashboard",
        href: "/dashboard",
        roles: ["USER", "ADMIN"],
        showWhenLoggedIn: true,
      },
      {
        label: "Logga in",
        href: `${API_BASE_URL}/auth/google`,
        showWhenLoggedOut: true,
      },
      {
        label: "Logga ut",
        href: "/logout",
        variant: "danger",
        showWhenLoggedIn: true,
      },
    ],
  } as SiteSection,
  userDashboard: {
    navItems: [
      {
        label: "Dashboard",
        href: "/dashboard",
        showWhenLoggedIn: true,
      },
      {
        label: "Inställningar",
        href: "#",
        variant: "dropdown",
        useUserName: true,
        children: [
          {
            label: "Mitt konto",
            href: "/my-account/settings",
          },
          {
            label: "Logga ut",
            href: "/logout",
            variant: "danger",
          },
        ],
      },
    ],
    mobileNavItems: [
      { label: "Dashboard", href: "/dashboard", showWhenLoggedIn: true },
      {
        label: "Inställningar",
        href: "/my-account/settings",
        showWhenLoggedIn: true,
      },
      {
        label: "Logga ut",
        href: "/logout",
        variant: "danger",
        showWhenLoggedIn: true,
      },
    ],
  } as SiteSection,
  adminDashboard: {
    navItems: [
      { label: "Dashboard", href: "/dashboard" },
      {
        label: "Våra tränare",
        href: "/organization/coaches",
      },
      { label: "Våra lag", href: "/organization/teams" },
      { label: "Kurser", href: "/organization/courses" },
      {
        label: "Inställningar",
        href: "#",
        variant: "dropdown",
        useUserName: true,
        children: [
          {
            label: "Mitt konto",
            href: "/my-account/settings",
          },
          {
            label: "Föreningsinställningar",
            href: "/organization/settings",
          },
          {
            label: "Hantera prenumeration",
            href: "/organization/subscription",
          },
          {
            label: "Logga ut",
            href: "/logout",
            variant: "danger",
          },
        ],
      },
    ],
  } as SiteSection,
  superadminDashboard: {
    navItems: [
      { label: "Dashboard", href: "/superadmin" },
      { label: "Föreningar", href: "/superadmin/organizations" },
      { label: "Inkorg", href: "/superadmin/inbox" },
      {
        label: "Hantera",
        href: "#",
        variant: "dropdown",
        children: [
          { label: "Hantera priser", href: "/superadmin/edit-prices" },
          { label: "Hantera sidor", href: "/superadmin/edit-pages" },
          { label: "Hantera kurser", href: "/superadmin/edit-courses" },
          { label: "Gratis material", href: "/superadmin/edit-free-resources" },
        ],
      },

      {
        label: "Inställningar",
        href: "#",
        variant: "dropdown",
        bordered: true,
        useUserName: true,
        children: [
          { label: "Mitt konto", href: "/my-account/settings" },
          { label: "Logga ut", href: "/logout", variant: "danger" },
        ],
      },
    ],
  } as SiteSection,
};
