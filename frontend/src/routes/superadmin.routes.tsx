import SuperAdminDashboard from "@/app/superadmin/Dashboard";
import EditCourses from "@/app/superadmin/EditCourses";
import EditPrices from "@/app/superadmin/EditPrices";
import EditPages from "@/app/superadmin/EditPages";
import Organizations from "@/app/superadmin/Organizations";
import Inbox from "@/app/superadmin/Inbox";
import EditFreeResources from "@/app/superadmin/Documents";

export const superadminRoutes = [
  {
    path: "/superadmin",
    children: [
      { index: true, element: <SuperAdminDashboard /> },
      { path: "inbox", element: <Inbox /> },
      { path: "edit-prices", element: <EditPrices /> },
      { path: "edit-pages", element: <EditPages /> },
      { path: "edit-courses", element: <EditCourses /> },
      { path: "organizations", element: <Organizations /> },
      { path: "edit-free-resources", element: <EditFreeResources /> },
    ],
  },
];
