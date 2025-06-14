import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import ManageCoachModal from "./ManageCoachModal";
import { createCoachTableColumns } from "./CoachTableColumns";
import { filterCoaches, sortCoaches } from "./CoachTableUtils";
import { useCoachSelectionActions } from "./CoachSelectionActions";

import ConfirmationModal from "@/components/common/Modals/ConfirmationModal";
import DataTable from "@/components/common/DataTable";
import { useDataTableFilters } from "@/components/common/DataTable/hooks";
import GeneralModal, { GeneralModalRef } from "@/components/common/Modals/Modal";
import { IUser } from "@/types/models/user";
import { useTableActions } from "@/components/common/DataTable/hooks";
import { useSeatManager } from "@/hooks/useSeatManager";

interface CoachTableProps {
  coaches: IUser[];
  isLoading?: boolean;
  onCoachChange?: () => void;
}

export default function CoachTable({
  coaches,
  onCoachChange,
}: CoachTableProps) {
  const queryClient = useQueryClient();

  const modalRef = useRef<GeneralModalRef>(null);
  const [selectedCoach, setSelectedCoach] = useState<IUser | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    confirmAssignSeat,
    confirmRemoveSeat,
    assignSeatModalRef,
    removeSeatModalRef,
    renderAssignSeatModal,
    renderRemoveSeatModal,
  } = useSeatManager({
    onSuccess: onCoachChange,
    onError: (error) => console.error("Seat operation failed:", error),
  });

  //Setup table actions
  const tableActions = useTableActions<IUser>(coaches, {
    onEdit: (user) => {
      setSelectedCoach(user);
      modalRef.current?.open();
    },
    customActions: {
      assignSeat: confirmAssignSeat,
      removeSeat: confirmRemoveSeat,
    },
  });

  // Handle team changes
  const handleTeamChange = () => {
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["filtered-users"] });

    // Also invalidate the specific user if selected
    if (selectedCoach) {
      queryClient.invalidateQueries({ queryKey: ["users", selectedCoach.id] });
    }

    // Call the parent's refresh callback
    if (onCoachChange) onCoachChange();
  };

  useEffect(() => {
    if (selectedCoach) {
      const updatedCoach = coaches.find((c) => c.id === selectedCoach.id);

      if (updatedCoach) {
        setSelectedCoach(updatedCoach);
        setRefreshKey((prev) => prev + 1);
      }
    }
  }, [coaches, selectedCoach?.id]);

  const { filterSelects, filteredItems } = useDataTableFilters(coaches, {
    filters: [
      {
        label: "Kursplats",
        id: "seat",
        field: "seat",
        transform: (coach: IUser) => (coach.seat ? "Ja" : "Nej"),
      },
    ],
  });

  // Get selection actions with callback for refreshing data
  const selectionActions = useCoachSelectionActions({
    onSuccess: () => {
      // Invalidate team queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      console.error("Selection action failed:", error);
    },
  });

  function selectCoach(selection: Selection) {
    modalRef.current?.open();
  }

  return (
    <>
      <DataTable<IUser>
        dark
        items={filteredItems}
        columns={createCoachTableColumns(
          tableActions.handleEdit,
          tableActions.handleAssignSeat,
          tableActions.handleRemoveSeat,
        )}
        getRowKey={(team) => team.id}
        initialSortDescriptor={{ column: "name", direction: "ascending" }}
        title="Tränare"
        searchPlaceholder="Sök tränare..."
        noDataContent="Inga tränare hittades"
        loadingContent="Laddar tränare..."
        filterFunction={filterCoaches}
        sortFunction={sortCoaches}
        filterSelects={filterSelects}
        selectionActions={selectionActions}
        selectionMode="multiple"
      />
      <GeneralModal ref={modalRef} title="Hantera tränare" size="md">
        {() => (
          <ManageCoachModal
            key={`coach-modal-${selectedCoach?.id}-${refreshKey}`}
            user={selectedCoach as IUser}
            onTeamChange={handleTeamChange}
          />
        )}
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
