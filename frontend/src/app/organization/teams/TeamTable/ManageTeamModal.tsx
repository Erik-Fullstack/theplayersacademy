import { useState, useRef } from "react";
import { Button, Chip, Tooltip, addToast } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useQueryClient } from "@tanstack/react-query";

import AddCoachToTeamModal from "./AddCoachToTeamModal";

import { useApi } from "@/services/useApi";
import GeneralModal, { GeneralModalRef } from "@/components/common/Modals/Modal";
import { ITeam } from "@/types";
import logo from "@/assets/logo_02.svg";

interface ManageTeamModalProps {
  team: ITeam;
  onCoachChange?: () => void;
}

export default function ManageTeamModal({
  team,
  onCoachChange,
}: ManageTeamModalProps) {
  const api = useApi();
  const [isRemoving, setIsRemoving] = useState(false);
  const [loadingCoachId, setLoadingCoachId] = useState<string | null>(null);

  // Modal ref for adding coaches
  const addCoachModalRef = useRef<GeneralModalRef>(null);

  // Get game format information
  const { data: formatResponse } = api.gameformats.useById(team?.gameFormatId);
  const gameFormat = formatResponse?.data;

  // Mutation for removing a coach
  const { mutate: removeCoach } = api.teams.useRemoveCoach();

  const handleRemoveCoach = (coachId: string) => {
    setIsRemoving(true);
    setLoadingCoachId(coachId);

    removeCoach(
      {
        teamId: team.id,
        userId: coachId,
      },
      {
        onSuccess: () => {
          addToast({
            title: "Tränare borttagen",
            description: "Tränaren har tagits bort från laget",
            icon: "mingcute:check-circle-fill",
            timeout: 5000,
            color: "success"
          });
          setIsRemoving(false);
          setLoadingCoachId(null);
          // Callback to refresh data
          if (onCoachChange) onCoachChange();
        },
        onError: (error) => {
          console.error("Error removing coach:", error);
          addToast({
            title: "Fel",
            description: "Kunde inte ta bort tränaren",
            icon: "mingcute:close-circle-fill",
            color: "danger",
            timeout: 5000,
          });
          setIsRemoving(false);
          setLoadingCoachId(null);
        },
      },
    );
  };

  const onCoachAdded = () => {
    addCoachModalRef.current?.close();
    if (onCoachChange) onCoachChange();
  };

  return (
    <>
      {/* Team Info Section */}
      <div className="flex w-full gap-4 items-center">
        <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
          <Icon icon="famicons:football-outline" fontSize={24} />
        </div>
        <div className="flex-1">
          <div className="font-bold text-xl">
            {team.gender} {team.year}
          </div>
          <div className="text-gray-500">
            {team.coaches?.length || 0} tränare
          </div>
        </div>
        {gameFormat && (
          <Chip size="sm" variant="bordered">
            Spelformat: {gameFormat.name}
          </Chip>
        )}
      </div>

      {/* Coaches Section */}
      <div className="mt-6">
        <div className="flex items-center gap-2 justify-between mb-4">
          <div className="font-bold text-xl">Tränare</div>
          <Button
            size="sm"
            variant="light"
            endContent={<Icon icon="fluent:add-12-filled" />}
            onPress={() => addCoachModalRef.current?.open()}
          >
            Lägg till
          </Button>
        </div>

        {team.coaches && team.coaches.length > 0 ? (
          <div className="flex flex-col gap-1">
            {team.coaches.map((coach) => (
              <div
                key={coach.id}
                className="list-card flex items-center justify-between p-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={coach.profileImage || logo}
                    alt={coach.firstName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="font-medium">
                      {coach.firstName} {coach.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{coach.email}</div>
                  </div>
                </div>

                <Tooltip content="Ta bort tränare">
                  <Button
                    isIconOnly
                    size="sm"
                    className="p-[5px] text-cyan-800"
                    variant="light"
                    radius="full"
                    aria-label="Ta bort tränare"
                    isDisabled={isRemoving && loadingCoachId === coach.id}
                    onPress={() => handleRemoveCoach(coach.id)}
                  >
                    <Icon icon="gg:remove" fontSize={32} />
                  </Button>
                </Tooltip>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
            Inga tränare tilldelade till detta lag.
          </div>
        )}
      </div>

      {/* Modal: Add coach */}
      <GeneralModal ref={addCoachModalRef} title="Lägg till tränare" size="md">
        {(data) => <AddCoachToTeamModal team={team} onSuccess={onCoachAdded} />}
      </GeneralModal>
    </>
  );
}
