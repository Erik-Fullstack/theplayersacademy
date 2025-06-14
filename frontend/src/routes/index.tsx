// Import route modules
import { publicRoutes } from "./public.routes";
import { myAccountRoutes } from "./myAccount.routes";
import { organizationRoutes } from "./organization.routes";
import { superadminRoutes } from "./superadmin.routes";

import DefaultLayout from "@/layouts/DefaultLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import Dashboard from "@/app/dashboard";
import Logout from "@/app/auth/Logout";
import Register from "@/app/auth/Register";
import PageNotFound from "@/app/PageNotFound";

export const routes = [
  {
    path: "/",
    element: <DefaultLayout />,
    children: publicRoutes,
  },
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      ...myAccountRoutes,
      ...organizationRoutes,
      ...superadminRoutes,
    ],
  },
  { path: "/logout", element: <Logout /> },
  { path: "/register", element: <Register /> },
  { path: "*", element: <PageNotFound /> },
];
