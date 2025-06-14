import { Button, Tooltip, Chip } from "@heroui/react";
import clsx from "clsx";
import { Icon } from "@iconify/react/dist/iconify.js";

import { Column } from "@/components/common/DataTable";
import { IUser } from "@/types/models/user";
import DefaultLogo from "@/assets/logo_02.svg";

export function createCoachTableColumns(
  onEdit: (user: IUser) => void,
  onAssignSeat: (user: IUser) => void,
  onRemoveSeat: (user: IUser) => void,
): Column<IUser>[] {
  return [
    {
      name: "",
      uid: "profileImage",
      renderCell: (user) => (
        <img
          src={user.profileImage || DefaultLogo}
          alt="profilbild"
          className="w-9 h-9 rounded-full object-cover"
          onError={(e) => {
            e.currentTarget.src = DefaultLogo;
          }}
        />
      ),
    },
    {
      name: "Namn",
      uid: "fullName",
      sortable: true,
      renderCell: (user) => (
        <>
          <div className="font-medium">{user.fullName}</div>
          <div className="font-normal">{user.email}</div>
        </>
      ),
    },
    {
      name: "Lag",
      uid: "teams",
      sortable: true,
      renderCell: (coach) => (
        <div className="flex flex-col gap-1">
          {coach.role !== "ADMIN" && coach.teams && coach.teams.length > 0 ? (
            <>
              {coach.teams.slice(0, 2).map((team, index) => (
                <Chip
                  key={index}
                  size="sm"
                  variant="flat"
                  color={team.gender === "Pojkar" ? "danger" : "warning"}
                  className="text-xs"
                >
                  {team.gender} {team.year}
                </Chip>
              ))}
              {coach.teams.length > 3 && (
                <Chip
                  size="sm"
                  variant="flat"
                  color="default"
                  className="text-xs"
                >
                  +{coach.teams.length - 2} till...
                </Chip>
              )}
            </>
          ) : (
            <span className="text-gray-500">Inga lag</span>
          )}
        </div>
      ),
    },
    {
      name: "Kursplats",
      uid: "seat",
      renderCell: (user) => (
        <div className="flex justify-center">
          <Tooltip
            content={user.seat ? "Ta bort kursplats" : "Lägg till kursplats"}
          >
            <Button
              isIconOnly
              size="sm"
              variant="light"
              radius="full"
              onPress={
                user.seat ? () => onRemoveSeat(user) : () => onAssignSeat(user)
              }
            >
              <Icon
                className={clsx(
                  "text-xl",
                  user.seat ? "text-blue-600" : "text-emerald-600",
                )}
                icon={user.seat ? "game-icons:read" : "zondicons:add-solid"}
              />
            </Button>
          </Tooltip>
        </div>
      ),
    },
    {
      name: "",
      uid: "actions",
      renderCell: (coach) => (
        <div className="flex justify-end">
          <Tooltip content="Hantera tränare">
            <Button
              isIconOnly
              size="sm"
              color="warning"
              variant="light"
              onPress={() => onEdit(coach)}
            >
              <Icon icon="uil:edit" className="text-2xl text-rose-700" />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];
}
