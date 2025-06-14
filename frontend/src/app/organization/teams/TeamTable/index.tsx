import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@heroui/react";

import { useTeamSelectionActions } from "./TeamSelectionActions";
import ManageTeamModal from "./ManageTeamModal";
import { createTeamTableColumns } from "./TeamTableColumns";
import { filterTeams, sortTeams } from "./TeamTableUtils";
import AddTeamModal from "./AddTeamModal";

import {
  useDataTableFilters,
  useTableActions,
} from "@/components/common/DataTable/hooks";
import DataTable from "@/components/common/DataTable";
import GeneralModal, { GeneralModalRef } from "@/components/common/Modals/Modal";
import { ITeam } from "@/types/models/team";

interface TeamTableProps {
  teams: ITeam[];
  isLoading?: boolean;
  onTeamChange?: () => void;
}

export default function TeamTable({
  teams,
  isLoading,
  onTeamChange,
}: TeamTableProps) {
  const queryClient = useQueryClient();
  const manageTeamModalRef = useRef<GeneralModalRef>(null);
  const addTeamModalRef = useRef<GeneralModalRef>(null);
  const [selectedTeam, setSelectedTeam] = useState<ITeam | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Setup table actions
  const { handleEdit } = useTableActions<ITeam>(teams, {
    onEdit: (team) => {
      setSelectedTeam(team);
      manageTeamModalRef.current?.open(team);
    },
  });

  // Get selection actions with callback for refreshing data
  const selectionActions = useTeamSelectionActions({
    onSuccess: () => {
      // Invalidate team queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: (error: any) => {
      console.error("Selection action failed:", error);
    },
  });

  // Setup filters with our new helper hook
  const { filterSelects, filteredItems } = useDataTableFilters(teams, {
    filters: [
      {
        id: "gender",
        label: "Kön",
        field: "gender",
      },
      {
        id: "year",
        label: "Årskull",
        field: "year",
        sortFn: (a, b) => Number(b) - Number(a),
      },
    ],
  });

  const actionButtons = (
    <Button
      color="warning"
      variant="solid"
      aria-label="Lägg till lag"
      onPress={() => addTeamModalRef.current?.open()}
    >
      + Lägg till lag
    </Button>
  );

  // Handle coach changes
  const handleCoachChange = () => {
    queryClient.invalidateQueries({ queryKey: ["teams"] });

    if (selectedTeam) {
      queryClient.invalidateQueries({ queryKey: ["teams", selectedTeam.id] });
    }

    if (onTeamChange) onTeamChange();
  };

  useEffect(() => {
    if (selectedTeam) {
      const updatedTeam = teams.find((t) => t.id === selectedTeam.id);

      if (updatedTeam) {
        setSelectedTeam(updatedTeam);
        setRefreshKey((prev) => prev + 1);
      }
    }
  }, [teams, selectedTeam?.id]);

  return (
    <>
      <DataTable<ITeam>
        dark
        items={filteredItems}
        columns={createTeamTableColumns(handleEdit)}
        getRowKey={(team) => team.id}
        initialSortDescriptor={{ column: "name", direction: "ascending" }}
        title="Lag"
        searchPlaceholder="Sök lag..."
        noDataContent="Inga lag hittades"
        loadingContent="Laddar lag..."
        filterFunction={filterTeams}
        sortFunction={sortTeams}
        selectionMode="multiple"
        actionButtons={actionButtons}
        filterSelects={filterSelects}
        selectionActions={selectionActions}
      />

      {/* Team management modal */}
      <GeneralModal ref={manageTeamModalRef} title="Hantera lag">
        {() => (
          <ManageTeamModal
            key={`team-modal-${selectedTeam?.id}-${refreshKey}`}
            team={selectedTeam as ITeam}
            onCoachChange={handleCoachChange}
          />
        )}
      </GeneralModal>

      {/* Add new team modal */}
      <GeneralModal ref={addTeamModalRef} title="Skapa nytt lag">
        {() => (
          <AddTeamModal
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["teams"] });
              addTeamModalRef.current?.close();
            }}
          />
        )}
      </GeneralModal>
    </>
  );
}
