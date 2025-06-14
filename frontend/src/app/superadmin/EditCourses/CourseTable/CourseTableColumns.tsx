import { Button, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";

import { useApi } from "@/services/useApi";
import { ICourse } from "@/types/models/course";
import { GeneralModalRef } from "@/components/common/Modals/Modal";
import { Column } from "@/components/common/DataTable";
import logo from "@/assets/logo_02.svg";

function AssignedUsersCell({ courseId }: { courseId: string }) {
  const api = useApi();
  const { data: usersData } = api.courses.useCourseUsers({ courseId });

  return (
    <div className="flex items-center gap-2">
      <img src={logo} alt="Trainer" className="w-4 h-4" />
      <span>{usersData?.data?.length || 0}</span>
    </div>
  );
}

export function createCourseTableColumns(
  modalRef: React.RefObject<GeneralModalRef>,
): Column<ICourse>[] {
  return [
    { name: "Namn", uid: "name", sortable: true },
    {
      name: "Tilldelade tränare",
      uid: "trainerCount",
      sortable: true,
      renderCell: (item) => <AssignedUsersCell courseId={item.id} />,
    },
    {
      name: "Åtgärder",
      uid: "actions",
      renderCell: (item) => (
        <div className="flex justify-end">
          <Tooltip content="Redigera kurs">
            <Button
              isIconOnly
              size="sm"
              color="warning"
              variant="light"
              onPress={() => modalRef.current?.open(item)}
            >
              <Icon icon="uil:edit" className="text-2xl text-rose-700" />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];
}
