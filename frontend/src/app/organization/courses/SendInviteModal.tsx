import { useState, FormEvent, useRef } from "react";
import { Form, Input, Button, addToast, Snippet } from "@heroui/react";

import { useApi } from "@/services/useApi";
import useUserStore from "@/store/useUserStore";

interface ResultResponse {
  data: any;
}

export default function InvitesModal() {
  const api = useApi();
  const { user } = useUserStore();
  const orgId = user?.organization?.id;
  const formRef = useRef<HTMLFormElement>(null);

  const { mutate: createInvite } =
    api.invites.useCreateOrganizationInvite(orgId);

  const { refetch: refetchInvites } = api.invites.useOrganizationInvites(orgId);

  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<{
    [key: string]: FormDataEntryValue;
  } | null>(null);

  const handleCreateInvite = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    setSubmitted(data);

    createInvite(
      { email: data.email as string },
      {
        onSuccess: (result: ResultResponse) => {
          setLoading(false);

          if (result?.data?.code) {
            setInviteCode(result.data.code);
          }

          addToast({
            title: "Inbjudan skickad",
            description: `En inbjudan har skickats till ${data.email}`,
            timeout: 5000,
            icon: "mingcute:check-circle-fill",
            color: "success"
          });

          formRef.current?.reset();
          refetchInvites();
        },
        onError: (error: unknown) => {
          setLoading(false);
          setInviteCode(null);
          addToast({
            title: "Fel vid inbjudan",
            description:
              error instanceof Error ? error.message : "Något gick fel",
            timeout: 5000,
            color: "danger",
            icon: "mingcute:alert-fill"
          });
        },
      },
    );
  };

  const handleNewInvite = () => {
    setSubmitted(null);
    setInviteCode(null);
    formRef.current?.reset();
  };

  return (
    <>
      {submitted && inviteCode ? (
        <div className="text-default-500 text-center">
          <Snippet size="lg">{inviteCode}</Snippet>
          <p className="text-medium text-gray-500 mt-1">
            Dela denna kod med användaren för att de ska kunna registrera sig.
          </p>
          <Button color="primary" className="mt-4" onPress={handleNewInvite}>
            Skicka en ny inbjudan
          </Button>
        </div>
      ) : (
        <Form
          ref={formRef}
          className="w-full flex-row"
          onSubmit={handleCreateInvite}
        >
          <Input
            isRequired
            errorMessage="Ange en giltig epostadress"
            label="Email"
            name="email"
            placeholder="Fyll i emailadress"
            type="email"
            className="inline-block"
          />
          <Button
            type="submit"
            variant="bordered"
            isDisabled={loading}
            className="m-2"
          >
            {loading ? (
              <span className="ml-2">Skickar...</span>
            ) : (
              "Skicka inbjudan"
            )}
          </Button>
        </Form>
      )}
    </>
  );
}
