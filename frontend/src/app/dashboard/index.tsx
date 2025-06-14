import { Navigate } from "react-router-dom";

import UserDashboard from "./User";
import AdminDashboard from "./Admin";

import useUserStore from "@/store/useUserStore";

export default function Dashboard() {
  const { user, refreshUser } = useUserStore();

  if (!user) {
    refreshUser();

    return;
  }
  // Redirect to login if no user is logged in
  if (user.role === "SUPERADMIN") {
    return <Navigate replace to="/login" />;
  }
  if (!user.organization) {
    return <Navigate replace to="/register" />;
  }

  if (user.role === "ADMIN") {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
}
