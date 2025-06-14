import Coaches from "@/app/organization/coaches";
import Teams from "@/app/organization/teams";
import Subscription from "@/app/organization/settings/Subscription";
import Settings from "@/app/organization/settings/Profile";
import Courses from "@/app/organization/courses";

export const organizationRoutes = [
  {
    path: "/organization",
    children: [
      { path: "coaches", element: <Coaches /> },
      { path: "teams", element: <Teams /> },
      { path: "courses", element: <Courses /> },
      { path: "subscription", element: <Subscription /> },
      { path: "settings", element: <Settings /> },
    ],
  },
];
