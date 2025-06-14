import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";

import { useApi } from "@/services/useApi";
import useUserStore from "@/store/useUserStore";

export default function SwitchUser() {
  const { setUser, clearUser } = useUserStore();
  const navigate = useNavigate();
  const api = useApi();

  const handleSetUser = async (userType: string) => {
    try {
      switch (userType) {
        case "user":
        case "admin":
        case "superadmin": {
          const response = await api.test.getTestUser(userType as any);

          if (response && response.data) {
            setUser(response.data);
            navigate(userType === "superadmin" ? "/superadmin" : "/dashboard");
          }

          console.log(response.data);
          break;
        }
        default:
          clearUser();
          navigate("/");
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${userType}:`, error);
    }
  };

  return (
    <div className="flex mb-4 gap-2 justify-center">
      <Button onPress={() => handleSetUser("user")}>user</Button>
      <Button onPress={() => handleSetUser("admin")}>admin</Button>
      <Button onPress={() => handleSetUser("superadmin")}>superadmin</Button>
    </div>
  );
}
