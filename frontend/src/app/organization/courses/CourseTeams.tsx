import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import ManageTeamModal from "../teams/TeamTable/ManageTeamModal";

import { createCourseTeamsColumns } from "./CourseTeamsColumns";

import GeneralModal, { GeneralModalRef } from "@/components/common/Modals/Modal";
import { useApi } from "@/services/useApi";
import useUserStore from "@/store/useUserStore";
import DataTable from "@/components/common/DataTable/DataTable";
import { useTableActions } from "@/components/common/DataTable";
import { ITeam, IOrgCourse } from "@/types";

export default function CourseTeams({ course }: { course: IOrgCourse }) {
  const [selectedTeam, setSelectedTeam] = useState<ITeam | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const manageTeamModalRef = useRef<GeneralModalRef>(null);
  const queryClient = useQueryClient();
  const api = useApi();
  const { user } = useUserStore();

  // Get teams
  const {
    data: teamsResponse,
    isLoading: isLoadingTeams,
    refetch: refetchTeams,
  } = api.teams.useByOrganization({
    organizationId: user?.organizationId,
    courseId: course.course.id,
  });

  const teams = teamsResponse?.data || [];

  // Get all coaches for the organization
  const { data: coachesResponse, isLoading: isLoadingCoaches } =
    api.users.useFilterUsers({
      organizationId: user?.organizationId,
      role: "USER",
    });

  const coaches = coachesResponse?.data || [];
  const isLoading = isLoadingTeams || isLoadingCoaches;

  // Add coaches to teams data
  const teamsWithCoaches = useMemo(
    () =>
      teams.map((team) => ({
        ...team,
        coaches: coaches.filter((coach) =>
          coach.teams?.some((t) => t.id === team.id),
        ),
        currentCourse: course.course,
      })),
    [teams, coaches, course],
  );

  useEffect(() => {
    if (selectedTeam) {
      const updatedTeam = teamsWithCoaches.find(
        (t) => t.id === selectedTeam.id,
      );

      if (updatedTeam) {
        setSelectedTeam(updatedTeam);
        setRefreshKey((prev) => prev + 1);
      }
    }
  }, [teamsWithCoaches, selectedTeam?.id]);

  const tableActions = useTableActions<ITeam>(teamsWithCoaches, {
    onEdit: (team) => {
      setSelectedTeam(team);
      manageTeamModalRef.current?.open();
    },
  });

  const handleTeamCourseChange = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["teams"] });

    if (selectedTeam) {
      queryClient.invalidateQueries({ queryKey: ["teams", selectedTeam.id] });
    }

    queryClient.invalidateQueries({
      queryKey: [
        "teams",
        { organizationId: user?.organizationId, courseId: course.course.id },
      ],
    });
    refetchTeams();

    queryClient.invalidateQueries({ queryKey: ["users"] });

    setRefreshKey((prev) => prev + 1);

    console.log(
      "Team change detected - data refreshed, new key:",
      refreshKey + 1,
    );
  }, [queryClient, refetchTeams, selectedTeam, refreshKey]);

  return (
    <>
      <DataTable
        items={teamsWithCoaches}
        columns={createCourseTeamsColumns(tableActions.handleEdit)}
        getRowKey={(team) => team.id}
        isLoading={isLoading}
        title="Lag"
        searchPlaceholder="Sök efter lag"
        noDataContent="Inga lag hittades"
        loadingContent="Laddar lag..."
        initialSortDescriptor={{ column: "name", direction: "ascending" }}
      />
      <GeneralModal
        ref={manageTeamModalRef}
        size="md"
        title={`Hantera lag: ${selectedTeam?.gender} ${selectedTeam?.year}`}
      >
        {() => (
          <ManageTeamModal
            key={`coach-modal-${selectedTeam?.id}-${refreshKey}`}
            team={selectedTeam as ITeam}
            onCoachChange={handleTeamCourseChange}
          />
        )}
      </GeneralModal>
    </>
  );
}
