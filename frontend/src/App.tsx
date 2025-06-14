import { useEffect } from "react";
import { useRoutes } from "react-router-dom";

import useUserStore from "./store/useUserStore";

import { API_BASE_URL } from "@/config/api";
import { routes } from "@/routes";

function App() {
  const { setUser, refreshUser } = useUserStore();

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/current/log`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const { data } = await response.json();

        setUser(data);
        refreshUser();

        return data;
      } catch (error) {
        console.error("Error: ", error);
      }
    };

    getUserDetails();
  }, []);

  const element = useRoutes(routes);

  return element;
}

export default App;
