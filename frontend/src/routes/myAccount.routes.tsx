import UserSettings from "@/app/my-account";
import ConsumeInviteCode from "@/app/auth/InviteCode/RegisterToOrg";

export const myAccountRoutes = [
  {
    path: "/my-account",
    children: [
      { path: "settings", element: <UserSettings /> },
      { path: ":inviteCode", element: <ConsumeInviteCode /> },
    ],
  },
];
