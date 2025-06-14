import { useState, useRef, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import ManageCoachModal from "../coaches/CoachTable/ManageCoachModal";

import { createCourseCoachesColumns } from "./CourseCoachesColumns";

import GeneralModal, { GeneralModalRef } from "@/components/common/Modals/Modal";
import { useApi } from "@/services/useApi";
import useUserStore from "@/store/useUserStore";
import DataTable from "@/components/common/DataTable/DataTable";
import { IUser, IOrgCourse } from "@/types";
import { useTableActions } from "@/components/common/DataTable";

export default function CourseCoaches({ course }: { course: IOrgCourse }) {
  const [selectedCoach, setSelectedCoach] = useState<IUser | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const manageCoachModalRef = useRef<GeneralModalRef>(null);
  const queryClient = useQueryClient();

  const api = useApi();
  const { user } = useUserStore();

  const {
    data: coachesResponse,
    isLoading,
    refetch: refetchCoaches,
  } = api.users.useByCourse(course.course.id, user?.organizationId);

  const coaches = coachesResponse?.data || [];

  useEffect(() => {
    if (selectedCoach) {
      const updatedCoach = coaches.find(
        (c: IUser) => c.id === selectedCoach.id,
      );

      if (updatedCoach) {
        setSelectedCoach(updatedCoach);
        setRefreshKey((prev) => prev + 1);
      }
    }
  }, [coaches, selectedCoach?.id]);

  const handleTeamCourseChange = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["users", "course"] });
    queryClient.invalidateQueries({ queryKey: ["filtered-users"] });
    queryClient.invalidateQueries({ queryKey: ["teams"] });
    queryClient.invalidateQueries({ queryKey: ["course-stats"] });
    queryClient.invalidateQueries({ queryKey: ["orgcourses"] });

    refetchCoaches();

    if (selectedCoach) {
      queryClient.invalidateQueries({ queryKey: ["users", selectedCoach.id] });
    }

    setRefreshKey((prev) => prev + 1);
  }, [queryClient, refetchCoaches, selectedCoach]);

  const tableActions = useTableActions<IUser>(coaches, {
    onEdit: (user) => {
      setSelectedCoach(user);
      manageCoachModalRef.current?.open();
    },
  });

  return (
    <>
      <DataTable
        items={coaches}
        columns={createCourseCoachesColumns(tableActions.handleEdit)}
        getRowKey={(coach) => coach.id}
        isLoading={isLoading}
        title="Tränare"
        searchPlaceholder="Sök efter tränare"
        noDataContent="Inga tränare hittades"
        loadingContent="Laddar tränare..."
        initialSortDescriptor={{ column: "name", direction: "ascending" }}
      />
      <GeneralModal
        ref={manageCoachModalRef}
        size="md"
        title={`Hantera tränare: ${selectedCoach?.fullName || ""}`}
      >
        {() => (
          <ManageCoachModal
            key={`coach-modal-${selectedCoach?.id}-${refreshKey}`}
            user={selectedCoach as IUser}
            onTeamChange={handleTeamCourseChange}
          />
        )}
      </GeneralModal>
    </>
  );
}
