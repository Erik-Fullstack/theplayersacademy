import { Tooltip, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";

import { Column } from "@/components/common/DataTable/types";
import { IUser } from "@/types/models/user";
import DefaultLogo from "@/assets/logo_02.svg";

export function createCourseCoachesColumns(
  onEdit: (user: IUser) => void,
): Column<IUser>[] {
  return [
    {
      uid: "name",
      name: "Tränare",
      sortable: true,
      renderCell: (coach) => (
        <div className="flex items-center gap-3">
          <img
            src={coach.profileImage || DefaultLogo}
            alt="profilbild"
            width="25"
            className="rounded-full"
          />
          <div className="font-medium">{coach.fullName}</div>
        </div>
      ),
    },
    {
      uid: "teams",
      name: "Lag",
      sortable: true,
      renderCell: (coach) => (
        <div className="flex gap-1 max-w-[200px] truncate">
          {coach.role !== "ADMIN" && coach.teams?.length
            ? coach.teams.map((team, index) => (
                <Chip
                  key={index}
                  variant="flat"
                  size="sm"
                  className="text-xs"
                  color={team.gender === "Pojkar" ? "primary" : "danger"}
                >
                  {`${team.gender === "Pojkar" ? "P" : "F"}${team.year}`}
                </Chip>
              ))
            : "Inga lag"}
        </div>
      ),
    },
    {
      uid: "status",
      name: "Status",
      sortable: true,
      renderCell: () => (
        <Chip color="success" variant="flat" size="sm">
          Godkänd
        </Chip>
      ),
    },
    {
      uid: "actions",
      name: "",
      renderCell: (coach) => (
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
      ),
    },
  ];
}
