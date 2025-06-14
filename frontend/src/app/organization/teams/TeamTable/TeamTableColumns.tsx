import { Button, Chip, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";

import { Column } from "@/components/common/DataTable";
import { ITeam } from "@/types/models/team";

export function createTeamTableColumns(
  onEdit: (team: ITeam) => void,
): Column<ITeam>[] {
  return [
    {
      name: "Lag",
      uid: "name",
      sortable: true,
      renderCell: (team) => (
        <div className="font-medium">
          {team.gender} {team.year}
        </div>
      ),
    },
    { name: "Årskull", uid: "year", sortable: true },
    {
      name: "Tränare",
      uid: "coaches",
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
    },
    {
      name: "Spelform",
      uid: "format",
      sortable: true,
      renderCell: (team) => (
        <Chip size="sm" variant="flat" color="warning" className="capitalize">
          {team.format?.name || "Ej angiven"}
        </Chip>
      ),
    },
    {
      name: "Åtgärder",
      uid: "actions",
      renderCell: (team) => (
        <div className="flex justify-end">
          <Tooltip content="Hantera lag">
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
        </div>
      ),
    },
  ];
}
