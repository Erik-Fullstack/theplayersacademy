import { useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { Select, SelectItem, Button, Form, addToast } from "@heroui/react";

import { useApi } from "@/services/useApi";
import useUserStore from "@/store/useUserStore";
import PriceCalculatorCard from "@/components/common/PriceCalculatorCard";

interface SubscriptionFormValues {
  plan: string;
  seats: number;
}

export default function EditSubscriptionModal() {
  const api = useApi();
  const { user, refreshUser } = useUserStore();
  const queryClient = useQueryClient();
  const orgId = user?.organizationId;
  const subscription = user?.organization?.subscription;

  const { control, handleSubmit } = useForm<SubscriptionFormValues>({
    defaultValues: {
      plan: subscription?.pricePlan,
      seats: subscription?.seatLimit,
    },
  });

  const {
    mutate: updateSubscription,
    isPending,
    isError,
    error,
  } = api.subscriptions.useUpdate();

  const onSubmit = (data: SubscriptionFormValues) => {
    if (!orgId) {
      addToast({
        title: "Fel",
        description: "Organisationsdata saknas",
        timeout: 5000,
        color: "danger",
        icon: "mingcute:alert-fill"
      });

      return;
    }

    if (!subscription) {
      addToast({
        title: "Fel",
        description: "Abonnemangsdata saknas",
        timeout: 5000,
        color: "danger",
        icon: "mingcute:alert-fill"
      });

      return;
    }

    updateSubscription(
      {
        orgId,
        data: {
          pricePlan: data.plan,
          seatLimit: data.seats,
        },
      },
      {
        onSuccess: async () => {
          queryClient.invalidateQueries({ queryKey: ["organizations", orgId] });
          queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
          queryClient.invalidateQueries({ queryKey: ["seats"] });

          await refreshUser();

          addToast({
            title: "Abonnemanget har uppdaterats",
            description: "",
            timeout: 5000,
            icon: "mingcute:check-circle-fill",
            color: "success"
          });
        },
        onError: (err) => {
          addToast({
            title: "Misslyckades att uppdatera abonnemang",
            description: err.message || "Ett okänt fel uppstod",
            timeout: 5000,
            color: "danger",
            icon: "mingcute:alert-fill"
          });
        },
      },
    );
  };

  return (
    <Form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="font-medium">Ändra prisplan:</p>
          <Controller
            name="plan"
            control={control}
            render={({ field }) => (
              <Select
                placeholder="Ändra kursplatser"
                aria-label="Ändra prisplan"
                selectedKeys={new Set([String(field.value)])}
                onSelectionChange={(keys) =>
                  field.onChange(Array.from(keys)[0])
                }
              >
                <SelectItem key="YEARLY">Årsvis</SelectItem>
                <SelectItem key="MONTHLY">Månadsvis</SelectItem>
              </Select>
            )}
          />
        </div>
        <div>
          <p className="font-medium">Ändra antal kursplatser:</p>
          <Controller
            name="seats"
            control={control}
            render={({ field }) => (
              <Select
                aria-label="Ändra kursplatser"
                selectedKeys={new Set([String(field.value)])}
                onSelectionChange={(keys) =>
                  field.onChange(Number(Array.from(keys)[0]))
                }
              >
                <SelectItem key="25">25 Kursplatser</SelectItem>
                <SelectItem key="50">50 Kursplatser</SelectItem>
                <SelectItem key="75">75 Kursplatser</SelectItem>
                <SelectItem key="100">100 Kursplatser</SelectItem>
                <SelectItem key="125">125 Kursplatser</SelectItem>
              </Select>
            )}
          />
        </div>
      </div>
      <PriceCalculatorCard />
      {isError && (
        <p className="text-red-600 text-sm mt-2">
          Ett fel uppstod: {error?.message || "Något gick fel"}
        </p>
      )}
      <div className="flex justify-end mt-4">
        <Button type="submit" className="bg-branding2" disabled={isPending}>
          Spara ändringar
        </Button>
      </div>
    </Form>
  );
}
