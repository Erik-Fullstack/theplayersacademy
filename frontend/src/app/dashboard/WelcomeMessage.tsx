import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Textarea, addToast } from "@heroui/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import breaks from "remark-breaks";
import { FaPen } from "react-icons/fa";

import { API_BASE_URL } from "@/config/api";
import useUserStore from "@/store/useUserStore";
import { useApi } from "@/services/useApi";
import Section from "@/components/layout/Section";
import { IOrganization } from "@/types";
import Logo from "@/assets/logo_01.svg";

export default function WelcomeMessage() {
  const { user, setUser, refreshUser } = useUserStore();
  const api = useApi();
  const queryClient = useQueryClient();
  const orgId = user?.organization?.id;
  const [logoError, setLogoError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newIntroText, setNewIntroText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (orgId) {
      queryClient.invalidateQueries({
        queryKey: ["organizations", orgId],
      });
      refreshUser();
    }
  }, [orgId, queryClient, refreshUser]);

  const {
    data: orgResponse,
    isLoading,
    isError,
    error,
  } = api.organizations.useById(orgId);

  const { mutateAsync: updateProfile } = api.organizations.useUpdateProfile();

  const handleSave = async () => {
    if (!orgId) return;

    setIsSaving(true);

    try {
      const formData = new FormData();

      formData.append("introText", newIntroText);

      if (org.profile?.logo) {
      }

      if (org.profile?.colors) {
        formData.append("colors", JSON.stringify(org.profile.colors));
      }

      updateProfile(
        { orgId, formData },
        {
          onSuccess: (result) => {
            addToast({
              title: "Välkomsttexten uppdaterad",
              description: "Din välkomsttext har sparats",
              icon: "mingcute:check-circle-fill",
              color: "success",
              timeout: 5000,
            });

            setIsEditing(false);

            if (orgResponse && orgResponse.data) {
              orgResponse.data.profile.introText = newIntroText;
            }

            // Update the user state with new data
            if (user && result.data) {
              const updatedUser = { ...user };

              if (
                updatedUser.organization &&
                updatedUser.organization.profile
              ) {
                updatedUser.organization.profile = {
                  ...updatedUser.organization.profile,
                  introText: result.data.introText,
                };
                setUser(updatedUser);
              }
            }
          },
          onError: (error) => {
            console.error("Error updating profile:", error);

            addToast({
              title: "Fel vid uppdatering",
              description: "Det gick inte att spara välkomsttexten",
              color: "danger",
              icon: "mingcute:alert-fill",
              timeout: 5000,
            });
          },
          onSettled: () => {
            setIsSaving(false);
          },
        },
      );
    } catch (error) {
      console.error("Error updating profile:", error);

      // Error toast notification
      addToast({
        title: "Fel vid uppdatering",
        description: "Det gick inte att spara välkomsttexten",
        color: "danger",
        icon: "mingcute:alert-fill",
        timeout: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!orgId) {
    return (
      <Section>
        <h1>Välkommen</h1>
        <p>
          Du är inte kopplad till någon organisation.{" "}
          <Link to="/register" className="link">
            Klicka här
          </Link>{" "}
          för att registrera en förening.
        </p>
      </Section>
    );
  }

  if (isLoading) return <Section>Laddar...</Section>;
  if (isError) return <Section>Fel: {error.message}</Section>;

  const org = orgResponse?.data || ({} as IOrganization);
  const introText = isEditing
    ? newIntroText
    : org.profile?.introText || "Välkommen till vår förening!";

  const logoSrc =
    logoError || !org.profile?.logo
      ? Logo
      : `${API_BASE_URL}/${org.profile.logo}`;

  return (
    <Section maxWidth="5xl">
      <div className="flex gap-10 flex-col sm:flex-row items-center">
        <img
          alt="deras logga"
          src={logoSrc}
          className="max-w-[180px] w-[20vw] min-w-[100px"
          onError={() => setLogoError(true)}
        />
        <div className="flex-1">
          <h1 className="text-4xl text-left">{org.name}</h1>

          <div className="flex justify-between">
            {isEditing ? (
              <div className="flex flex-col w-full gap-2">
                <Textarea
                  value={newIntroText}
                  onChange={(e) => setNewIntroText(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    className="border-medium border-branding3 bg-white"
                    isDisabled={isSaving}
                    onPress={() => setIsEditing(false)}
                  >
                    Avbryt
                  </Button>
                  <Button
                    color="success"
                    isLoading={isSaving}
                    isDisabled={isSaving}
                    onPress={handleSave}
                  >
                    Spara
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between w-full">
                <div className="welcome-message flex flex-col gap-3">
                  <Markdown remarkPlugins={[remarkGfm, breaks]}>
                    {introText}
                  </Markdown>
                </div>
                {user.role === "ADMIN" && (
                  <Button
                    isIconOnly
                    className="rounded-full bg-slate-100"
                    onPress={() => {
                      setNewIntroText(introText);
                      setIsEditing(true);
                    }}
                  >
                    <FaPen className="text-branding3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}
