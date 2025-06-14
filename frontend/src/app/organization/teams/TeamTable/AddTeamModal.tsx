import { useState } from "react";
import {
  Button,
  Autocomplete,
  AutocompleteItem,
  addToast,
} from "@heroui/react";

import { useApi } from "@/services/useApi";
import useUserStore from "@/store/useUserStore";
import { ApiError } from "@/services/api/client";

export default function AddTeamModal({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const api = useApi();
  const { user } = useUserStore();
  const orgId = user?.organization?.id;

  const [formData, setFormData] = useState({
    year: "",
    gender: "",
  });

  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch data for reference
  const { data: teamsData } = api.teams.useByOrganization({
    organizationId: orgId,
  });

  // Generate year options based on current year
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 20 }, (_, i) =>
    (currentYear - i).toString(),
  );

  // Gender options
  const genderOptions = [
    { key: "Pojkar", label: "Pojkar" },
    { key: "Flickor", label: "Flickor" },
  ];

  const { mutate: createTeam, isPending } = api.teams.useCreate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!orgId) {
      addToast({
        title: "Fel",
        description: "Föreningen kunde inte hittas",
        icon: "mingcute:alert-fill",
        timeout: 5000,
        color: "danger"
      });

      return;
    }

    // Ensure year is a number
    const year = parseInt(formData.year);

    if (isNaN(year)) {
      addToast({
        title: "Fel",
        description: "Årskull måste vara ett giltigt nummer",
        icon: "mingcute:alert-fill",
        timeout: 5000,
        color: "danger"
      });

      return;
    }

    // Create team data object
    const teamData = {
      year,
      gender: formData.gender,
      organizationId: orgId,
      coaches: [], // Empty array since we don't assign coaches here
    };

    createTeam(teamData, {
      onSuccess: () => {
        setIsSuccess(true);
        addToast({
          title: "Lag skapat",
          description: "Laget har skapats framgångsrikt",
          icon: "mingcute:check-circle-fill",
          timeout: 5000,
          color: "success"
        });

        // Call success callback
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: (error: Error) => {
        console.error("Team creation error:", error);
        if (error instanceof ApiError) {
          addToast({
            title: "Fel",
            description:
              error.data?.error ===
              "No game format found for the given birth year"
                ? "Inget spelformat hittades för den angivna årskullen"
                : error.data?.error ||
                  error.message ||
                  "Ett fel uppstod när laget skulle skapas",
            icon: "mingcute:alert-fill",
            timeout: 5000,
            color: "danger"
          });
        } else {
          addToast({
            title: "Fel",
            description: "Ett fel uppstod när laget skulle skapas",
            icon: "mingcute:close-circle-fill",
            color: "danger",
            timeout: 5000
          });
        }
      },
    });
  };

  if (isSuccess) {
    return (
      <div className="text-center">
        <p className="text-green-600 mb-4">Laget har skapats framgångsrikt!</p>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="year" className="block text-sm font-medium mb-1">
          Årskull
        </label>
        <Autocomplete
          required
          placeholder="Välj årskull"
          aria-label="Välj årskull"
          id="year"
          value={formData.year}
          onSelectionChange={(key) => {
            setFormData({
              ...formData,
              year: key?.toString() || "",
            });
          }}
        >
          {yearOptions.map((year) => (
            <AutocompleteItem key={year}>{year}</AutocompleteItem>
          ))}
        </Autocomplete>
      </div>

      <div>
        <label htmlFor="gender" className="block text-sm font-medium mb-1">
          Kön
        </label>
        <Autocomplete
          required
          id="gender"
          placeholder="Välj kön"
          aria-label="Välj kön"
          value={formData.gender}
          defaultSelectedKey={formData.gender}
          onSelectionChange={(key) => {
            setFormData({
              ...formData,
              gender: key?.toString() || "",
            });
          }}
        >
          {genderOptions.map((option) => (
            <AutocompleteItem key={option.key}>{option.label}</AutocompleteItem>
          ))}
        </Autocomplete>
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          color="primary"
          type="submit"
          isLoading={isPending}
          aria-label="Skapa lag"
        >
          Skapa lag
        </Button>
        <Button
          color="default"
          variant="light"
          aria-label="Avbryt"
          onPress={onSuccess}
        >
          Avbryt
        </Button>
      </div>
    </form>
  );
}
