import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Spinner, addToast } from "@heroui/react";

import { API_BASE_URL } from "@/config/api";
import useUserStore from "@/store/useUserStore";

const findOrg = async (code: string | undefined) => {
  const request = await fetch(
    `${API_BASE_URL}/organizations/invites/org/${code}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!request.ok) return;

  const response = await request.json();

  return response.data;
};

export default function InvitationCodeInput() {
  const [active, setActive] = useState<boolean>(false);
  const { user } = useUserStore();
  const { inviteCode } = useParams<string>();
  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ["auth", { inviteCode }],
    queryFn: () => findOrg(inviteCode),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  if (isLoading)
    return (
      <Spinner
        color="warning"
        label="Loading..."
        size="lg"
        className="place-self-center w-96 h-96"
      />
    );

  const attachUser = async () => {
    setActive(true);
    const request = await fetch(`${API_BASE_URL}/users/invite/${inviteCode}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!request.ok) {
      addToast({
        title: "Fel vid inbjudan",
        description: "Något gick fel",
        timeout: 5000,
        color: "danger",
        icon: "mingcute:alert-fill",
      });
      setActive(false);

      return;
    }

    addToast({
      title: "Konto kopplat",
      description: `Du är nu kopplad till ${data.name}`,
      timeout: 5000,
      color: "success",
      icon: "mingcute:check-circle-fill",
    });

    return await request.json();
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-6xl shadow rounded-2xl p-6">
        <h2>
          Hej {user?.firstName}, du har blivit inbjuden till
          <span className="text-yellow-500"> {data.name}</span> som tränare
        </h2>
        <Button
          className="mt-4 bg-yellow-400 hover:bg-yellow-500 w-full"
          type="submit"
          variant="bordered"
          isDisabled={active}
          onPress={attachUser}
        >
          {active ? (
            <span className="ml-2 p-4">Skickar...</span>
          ) : (
            "Acceptera inbjudan"
          )}
        </Button>
      </Card>
    );
  }

  return <></>;
}
