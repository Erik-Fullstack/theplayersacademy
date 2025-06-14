import { Tooltip, Button } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";

import { Column } from "@/components/common/DataTable/types";
import { ITeam } from "@/types/models/team";
import DefaultLogo from "@/assets/logo_02.svg";

export function createCourseTeamsColumns(
  onEdit: (team: ITeam) => void,
): Column<ITeam>[] {
  return [
    {
      uid: "name",
      name: "Lag",
      sortable: true,
      renderCell: (team) => (
        <div className="flex items-center gap-3">
          <img
            src={DefaultLogo}
            alt="lag"
            width="25"
            className="rounded-full"
          />
          <div className="font-medium">{`${team.gender} ${team.year}`}</div>
        </div>
      ),
    },
    {
      uid: "coaches",
      name: "Tränare",
      sortable: true,
      renderCell: (team) => (
        <div className="flex flex-col gap-1">
          {team.coaches && team.coaches.length > 0 ? (
            team.coaches.map((coach, index) => (
              <div key={index} className="text-sm">
                {coach.firstName} {coach.lastName}
              </div>
            ))
          ) : (
            <span className="text-danger">Ingen tränare</span>
          )}
        </div>
      ),
      // renderCell: (team) => (
      // <div className="flex flex-col gap-1">
      //   {team.coaches.length} st
      // </div>
      // ),
    },
    {
      uid: "actions",
      name: "",
      renderCell: (team) => (
        <Tooltip content="Hantera tränare">
          <Button
            isIconOnly
            size="sm"
            color="warning"
            variant="light"
            onPress={() => onEdit(team)}
          >
            <Icon icon="uil:edit" className="text-2xl text-rose-700" />
          </Button>
        </Tooltip>
      ),
    },
  ];
}
