import { useState, useEffect } from "react";
import { Input, Button, addToast } from "@heroui/react";

import Section from "@/components/layout/Section";
import ImageUpload from "@/app/organization/settings/Profile/ImageUpload";
import DescriptionEditor from "@/app/organization/settings/Profile/DescriptionEditor";
import useUserStore from "@/store/useUserStore";
import { useApi } from "@/services/useApi";

export default function Page() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [logoRemoved, setLogoRemoved] = useState(false);
  const { user, setUser, refreshUser } = useUserStore();
  const api = useApi();

  const organizationId = user?.organization?.id;

  useEffect(() => {
    if (user?.organization?.profile?.introText) {
      setDescription(user.organization.profile.introText);
    }
  }, [user?.organization?.profile?.introText]);

  const { mutate: updateProfile } = api.organizations.useUpdateProfile();

  const handleSaveSettings = async () => {
    if (!organizationId) {
      addToast({
        title: "Error",
        description: "Föreningens ID kunde inte hittas",
        color: "danger",
        timeout: 5000,
        icon: "mingcute:alert-fill"
      });

      return;
    }

    // Check if any changes were made
    const noChanges =
      selectedImage === null &&
      !logoRemoved &&
      description === user?.organization?.profile?.introText;

    if (noChanges) {
      addToast({
        title: "Finns inget att spara",
        color: "warning",
        timeout: 5000,
        icon: "mingcute:alert-fill"
      });

      return;
    }

    setIsLoading(true);

    try {
      // Create form data to send to the server
      const formData = new FormData();

      // Add text data
      formData.append("introText", description);

      // Handle logo - either add new image or flag for removal
      if (selectedImage) {
        formData.append("logo", selectedImage);
      } else if (logoRemoved) {
        formData.append("removeLogo", "true");
      }

      updateProfile(
        {
          orgId: organizationId,
          formData,
        },
        {
          onSuccess: (result) => {
            addToast({
              title: "Inställningar sparade",
              timeout: 5000,
              icon: "mingcute:check-circle-fill",
              color: "success"
            });

            // Reset state after successful update
            setSelectedImage(null);
            setLogoRemoved(false);

            // Update user state with new data
            if (user && result.data) {
              const updatedUser = { ...user };

              if (
                updatedUser.organization &&
                updatedUser.organization.profile
              ) {
                updatedUser.organization.profile = {
                  ...updatedUser.organization.profile,
                  logo: result.data.logo,
                  introText: result.data.introText,
                };
                setUser(updatedUser);
              }
              refreshUser();
            }
          },
          onError: (error) => {
            addToast({
              title: "Misslyckades att spara inställningar",
              description: error instanceof Error ? error.message : "Okänt fel",
              timeout: 5000,
              color: "danger",
              icon: "mingcute:alert-fill"
            });
            console.error("Failed to update settings:", error);
          },
          onSettled: () => {
            setIsLoading(false);
          },
        }
      );
    } catch (error) {
      console.error("Error updating settings:", error);
      setIsLoading(false);
    }
  };

  // Handle logo removal in the UI
  const handleLogoRemove = () => {
    setSelectedImage(null);
    setLogoRemoved(true);
  };

  // Handle logo selection in the UI
  const handleLogoSelect = (file: File | null) => {
    setSelectedImage(file);
    if (file !== null) {
      setLogoRemoved(false);
    }
  };

  return (
    <Section
      classes={{ innerContainer: "flex justify-between flex-wrap gap-4" }}
    >
      <div className="w-full sm:w-auto">
        <h1 className="text-4xl sm:text-2xl md:text-3xl mb-4">
          Föreningsinställningar
        </h1>

        <div className="flex flex-col gap-4">
          <Input
            isDisabled
            label="Föreningsnamn"
            labelPlacement="outside"
            type="text"
            defaultValue={user?.organization?.name}
            variant="bordered"
            radius="sm"
          />
          <Input
            isDisabled
            label="Email för kontakt"
            labelPlacement="outside"
            type="email"
            defaultValue={user?.email}
            variant="bordered"
            radius="sm"
            className="mb-4"
          />
        </div>
      </div>

      <div>
        <ImageUpload
          selectedImage={selectedImage}
          setSelectedImage={handleLogoSelect}
          currentLogo={logoRemoved ? null : user?.organization?.profile?.logo}
          onRemove={handleLogoRemove}
        />
      </div>

      <div className="w-full mt-4">
        <DescriptionEditor
          initialValue={user?.organization?.profile.introText || ""}
          onChange={setDescription}
        />
      </div>
      <Button
        color="success"
        className="text-white"
        isLoading={isLoading}
        isDisabled={isLoading || !organizationId}
        onPress={handleSaveSettings}
      >
        Spara inställningar
      </Button>
    </Section>
  );
}
