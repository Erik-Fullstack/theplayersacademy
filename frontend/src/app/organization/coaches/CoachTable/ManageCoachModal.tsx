import { useState, useRef, useCallback } from "react";
import { Button, Chip, Tooltip, addToast } from "@heroui/react";
import { Icon } from "@iconify/react";
import clsx from "clsx";
import { useQueryClient } from "@tanstack/react-query";

import AddTeamModal from "./AddTeamToCoachModal";
import AddCourseModal from "./AddCourseToCoachModal";

import { useApi } from "@/services/useApi";
import { ITeam, IUser, ICourse } from "@/types";
import { useSeatManager } from "@/hooks/useSeatManager";
import GeneralModal, { GeneralModalRef } from "@/components/common/Modals/Modal";
import ConfirmationModal from "@/components/common/Modals/ConfirmationModal";
import Logo from "@/assets/logo_02.svg";

export default function ManageCoachModal({
  user,
  onTeamChange,
}: {
  user: IUser;
  onTeamChange?: () => void;
}) {
  const queryClient = useQueryClient();
  const api = useApi();
  const [isRemoving, setIsRemoving] = useState(false);

  // Modals
  const addTeamModalRef = useRef<GeneralModalRef>(null);
  const addCourseModalRef = useRef<GeneralModalRef>(null);

  const {
    confirmAssignSeat,
    confirmRemoveSeat,
    assignSeatModalRef,
    removeSeatModalRef,
    renderAssignSeatModal,
    renderRemoveSeatModal,
  } = useSeatManager({
    onSuccess: onTeamChange,
  });

  const { mutate: removeCoach } = api.teams.useRemoveCoach();
  const { mutate: removeCourse } = api.courses.useRemoveUserFromCourse();

  const getFormatById = useCallback(
    (id: string) => {
      const { data: formatResponse } = api.gameformats.useById(id);

      return formatResponse?.data;
    },
    [api.gameformats],
  );

  const handleRemoveTeam = useCallback(
    (teamId: string) => {
      setIsRemoving(true);

      removeCoach(
        { teamId, userId: user.id },
        {
          onSuccess: async () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["filtered-users"] });
            queryClient.invalidateQueries({ queryKey: ["current-user"] });
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            queryClient.invalidateQueries({ queryKey: ["course-stats"] });
            queryClient.invalidateQueries({ queryKey: ["orgcourses"] });

            addToast({
              title: "Tränare borttagen",
              description: `${user.fullName} har tagits bort från laget.`,
              color: "success",
              icon: "mingcute:check-circle-fill",
              timeout: 5000,
            });
            setIsRemoving(false);
            if (onTeamChange) onTeamChange();
          },
          onError: (error) => {
            addToast({
              title: "Fel",
              description: "Kunde inte ta bort tränaren från laget.",
              color: "danger",
              icon: "mingcute:alert-fill",
              timeout: 5000,
            });
            setIsRemoving(false);
          },
        },
      );
    },
    [user, removeCoach, onTeamChange],
  );

  const handleRemoveCourse = useCallback(
    (courseId: string) => {
      setIsRemoving(true);

      removeCourse(
        { courseId, userId: user.id },
        {
          onSuccess: async () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["filtered-users"] });
            queryClient.invalidateQueries({ queryKey: ["current-user"] });
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            queryClient.invalidateQueries({ queryKey: ["course-stats"] });
            queryClient.invalidateQueries({ queryKey: ["orgcourses"] });

            queryClient.invalidateQueries({
              queryKey: ["users", "course", courseId],
            });

            addToast({
              title: "Kurs borttagen",
              description: `Kursen har tagits bort från ${user.fullName || user.firstName}.`,
              color: "success",
              icon: "mingcute:check-circle-fill",
              timeout: 5000,
            });
            setIsRemoving(false);
            if (onTeamChange) onTeamChange();
          },
          onError: (error) => {
            console.error("Error removing course:", error);
            addToast({
              title: "Fel",
              description: "Kunde inte ta bort kursen från tränaren.",
              color: "danger",
              icon: "mingcute:alert-fill",
              timeout: 5000,
            });
            setIsRemoving(false);
          },
        },
      );
    },
    [user, removeCourse, onTeamChange],
  );

  const onTeamAdded = useCallback(() => {
    addTeamModalRef.current?.close();
    if (onTeamChange) onTeamChange();
  }, [onTeamChange]);

  const onCourseAdded = useCallback(() => {
    addCourseModalRef.current?.close();
    if (onTeamChange) onTeamChange();
  }, [onTeamChange]);

  if (!user) {
    return <div>Ingen tränare vald</div>;
  }

  return (
    <>
      {/* User info */}
      <div className="flex w-full gap-4">
        <img
          src={user.profileImage || Logo}
          alt="Profile"
          className="circle-img max-w-[50px]"
        />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-xl truncate">{user.fullName}</div>
          <div className="text-gray-500 text-sm truncate">{user.email}</div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Chip size="sm" color={user.seat ? "primary" : "danger"}>
            Kursplats: {user.seat ? "Ja" : "Nej"}
          </Chip>
          <Tooltip
            content={user.seat ? "Ta bort kursplats" : "Lägg till kursplats"}
          >
            <Button
              isIconOnly
              size="md"
              variant="light"
              radius="full"
              onPress={
                user.seat
                  ? () => confirmRemoveSeat(user)
                  : () => confirmAssignSeat(user)
              }
            >
              <Icon
                className={clsx(
                  "text-3xl",
                  user.seat ? "text-blue-600" : "text-emerald-600",
                )}
                icon={user.seat ? "game-icons:read" : "zondicons:add-solid"}
              />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center gap-2 justify-between mt-4">
        <div className="font-bold text-xl">Lag</div>
        <Button
          size="sm"
          variant="light"
          endContent={<Icon icon="fluent:add-12-filled" />}
          onPress={() => addTeamModalRef.current?.open()}
        >
          Lägg till
        </Button>
      </div>
      {user.role !== "ADMIN" && user.teams && user.teams.length > 0 ? (
        <div className="flex flex-col gap-1">
          {user.teams.map((team: ITeam) => (
            <div key={team.id} className="list-card flex gap-2 items-center">
              <Icon icon="famicons:football-outline" fontSize={30} />
              <div className="mr-auto">
                {team.gender} {team.year}
              </div>

              <Chip size="sm" variant="bordered">
                Spelformat: {getFormatById(team?.gameFormatId ?? "")?.name}
              </Chip>

              <Tooltip content="Ta bort lag">
                <Button
                  isIconOnly
                  size="sm"
                  className="p-[5px] text-cyan-800"
                  variant="light"
                  radius="full"
                  aria-label="Ta bort från lag"
                  onPress={() => handleRemoveTeam(team.id)}
                >
                  <Icon icon="gg:remove" fontSize={32} />
                </Button>
              </Tooltip>
            </div>
          ))}
        </div>
      ) : (
        <div>Inga lag.</div>
      )}

      {/* Courses */}
      <div className="flex items-center gap-2 justify-between mt-4">
        <div className="font-bold text-xl">Kurser</div>
        <Button
          size="sm"
          variant="light"
          endContent={<Icon icon="fluent:add-12-filled" />}
          onPress={() => addCourseModalRef.current?.open()}
        >
          Lägg till
        </Button>
      </div>
      {user.courses && user.courses.length > 0 ? (
        <div className="flex flex-col gap-1">
          {user.courses.map((course: ICourse) => (
            <div key={course.id} className="list-card flex gap-2 items-center">
              <Icon icon="ri:progress-2-line" fontSize={30} />
              <div className="mr-auto">{course.name}</div>
              <Tooltip content="Ta bort kurs">
                <Button
                  isIconOnly
                  size="sm"
                  className="p-[5px] text-cyan-800"
                  variant="light"
                  radius="full"
                  aria-label="Ta bort kurs"
                  isDisabled={isRemoving}
                  onPress={() => handleRemoveCourse(course.id)}
                >
                  <Icon icon="gg:remove" fontSize={32} />
                </Button>
              </Tooltip>
            </div>
          ))}
        </div>
      ) : (
        <div>Inga kurser.</div>
      )}

      {/* Modal: Add team */}
      <GeneralModal ref={addTeamModalRef} title="Lägg till lag" size="md">
        {() => <AddTeamModal user={user} onSuccess={onTeamAdded} />}
      </GeneralModal>

      {/* Modal: Add course */}
      <GeneralModal ref={addCourseModalRef} title="Lägg till kurs" size="md">
        {() => <AddCourseModal user={user} onSuccess={onCourseAdded} />}
      </GeneralModal>

      {/* Seat assignment confirmation modal */}
      <GeneralModal
        ref={assignSeatModalRef}
        title="Lägg till kursplats"
        size="md"
      >
        {() => <ConfirmationModal {...renderAssignSeatModal()} />}
      </GeneralModal>

      {/* Seat removal confirmation modal */}
      <GeneralModal
        ref={removeSeatModalRef}
        title="Ta bort kursplats"
        size="md"
      >
        {() => <ConfirmationModal {...renderRemoveSeatModal()} />}
      </GeneralModal>
    </>
  );
}
