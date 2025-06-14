import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, PressEvent } from "@heroui/react";
import { addToast, Alert } from "@heroui/react";

import { API_BASE_URL } from "@/config/api";
import useUserStore from "@/store/useUserStore";

export default function ChangeRole() {
  const navigate = useNavigate();

  const [active, setActive] = useState<boolean>(false);
  const { user, setUser, refreshUser } = useUserStore();

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

  const changeRole = async (e: PressEvent) => {
    setActive(true);
    const target = e.target as HTMLButtonElement;
    const role = target.value;

    const request = await fetch(`${API_BASE_URL}/users/`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role }),
    });

    if (!request.ok) {
      addToast({
        title: "Något gick fel",
        description: "Lyckades inte byta roll, testa igen",
        timeout: 5000,
        color: "danger",
        icon: "mingcute:alert-fill",
      });

      return;
    }

    addToast({
      title: "Bytt roll",
      description: `Din roll är nu ${role}`,
      timeout: 5000,
      icon: "mingcute:check-circle-fill",
      color: "success",
    });
    await getUserDetails();
    setActive(false);
    if (role === "SUPERADMIN") navigate("/superadmin");
    else navigate("/dashboard");

    // return request.json();
  };

  const roles = ["USER", "ADMIN", "SUPERADMIN"];

  return (
    <>
      <Alert
        color="primary"
        title={`Byt roll (Nuvarande roll: ${user && user.role})`}
        description="Detta är för att enkelt testa all funktionalitet på denna hemsida. Byt
        mellan de olika rollerna genom att trycka på knapparna."
      >
        <div className="flex mt-2 gap-2">
          {roles.map((role) => (
            <Button
              key={role}
              type="submit"
              variant={user?.role === role ? "solid" : "light"}
              color="primary"
              size="sm"
              isDisabled={active}
              value={role}
              onPress={changeRole}
            >
              {role.toLowerCase()}
            </Button>
          ))}
        </div>
      </Alert>
    </>
  );
}
