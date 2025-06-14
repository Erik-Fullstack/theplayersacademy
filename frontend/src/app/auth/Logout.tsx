import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { API_BASE_URL } from "@/config/api";
import useUserStore from "@/store/useUserStore";

export default function LogoutPage() {
  const { clearUser, refreshUser, user } = useUserStore();
  const navigate = useNavigate();

  const clearCookies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  useEffect(() => {
    clearUser();
    refreshUser();
    clearCookies();
    const timeout = setTimeout(() => {
      clearUser();
      navigate("/");
    }, 1000);

    return () => {
      if (!user) clearTimeout(timeout);
    };
  }, [clearUser, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-2xl font-semibold">Loggar ut...</p>
    </div>
  );
}
