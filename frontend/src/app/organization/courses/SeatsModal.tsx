import { useRef, useCallback, useMemo } from "react";
import { Button, addToast } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useQueryClient } from "@tanstack/react-query";

import { useApi } from "@/services/useApi";
import { ISeat, IUser } from "@/types";
import { useSeatManager } from "@/hooks/useSeatManager";
import useUserStore from "@/store/useUserStore";
import DataTable from "@/components/common/DataTable/DataTable";
import { useTableActions } from "@/components/common/DataTable";
import GeneralModal, { GeneralModalRef } from "@/components/common/Modals/Modal";
import SelectItemModal from "@/components/common/Modals/SelectItemModal";
import ConfirmationModal from "@/components/common/Modals/ConfirmationModal";

export default function SeatsModal() {
  const api = useApi();
  const { user: currentUser } = useUserStore();
  const orgId = currentUser?.organizationId;
  const queryClient = useQueryClient();

  // Refs for modals
  const assignUserModalRef = useRef<GeneralModalRef>(null);

  const invalidateRelatedQueries = useCallback(() => {
    // Invalidate users queries to refresh coach data
    queryClient.invalidateQueries({ queryKey: ["users"] });
    queryClient.invalidateQueries({ queryKey: ["filtered-users"] });

    // Invalidate organization data (for seat stats)
    if (orgId) {
      queryClient.invalidateQueries({ queryKey: ["organizations", orgId] });
    }

    // Invalidate seats data
    queryClient.invalidateQueries({ queryKey: ["seats"] });

    console.log("Invalidated related queries after seat operation");
  }, [queryClient, orgId]);

  const { confirmRemoveSeat, removeSeatModalRef, renderRemoveSeatModal } =
    useSeatManager({
      onSuccess: () => {
        refetchSeats();
        invalidateRelatedQueries();
      },
    });

  // Get all seats for the organization
  const {
    data: seatsResponse,
    isLoading: isLoadingSeats,
    refetch: refetchSeats,
  } = api.seats.useOrganizationSeats({ orgId, hasUser: true });

  const availableSeatsCount = currentUser?.organization?.seatStats?.available;

  const { data: usersResponse, isLoading: isLoadingUsers } =
    api.users.useFilterUsers({
      organizationId: orgId,
    });

  const updateSeatMutation = api.seats.useUpdateSeat();

  // Process the seats data
  const seats = useMemo(() => {
    return seatsResponse?.data || [];
  }, [seatsResponse]);

  // Filter users who don't already have seats
  const availableUsers = useMemo(() => {
    if (!usersResponse?.data || !seatsResponse?.data) return [];

    // Extract user IDs that already have seats
    const assignedUserIds = new Set(
      seatsResponse.data
        .filter((seat: ISeat) => seat.user)
        .map((seat: ISeat) => seat.user?.id),
    );

    // Return only users who don't have a seat
    return usersResponse.data.filter((user) => !assignedUserIds.has(user.id));
  }, [usersResponse?.data, seatsResponse?.data]);

  // Check available seats before opening the assign dialog
  const checkAvailableSeatsBeforeAssign = useCallback(() => {
    if (availableSeatsCount && availableSeatsCount > 0) {
      if (availableUsers.length === 0) {
        addToast({
          title: "Inga tillgängliga användare",
          description: "Det finns inga användare utan kursplats att tilldela",
          color: "warning",
          timeout: 5000,
          icon: "mingcute:alert-fill"
        });
      } else {
        assignUserModalRef.current?.open();
      }
    } else {
      addToast({
        title: "Inga lediga kursplatser",
        description: "Det finns inga lediga kursplatser att tilldela",
        color: "warning",
        timeout: 5000,
        icon: "mingcute:alert-fill"
      });
    }
  }, [availableSeatsCount, availableUsers.length]);

  // Handle seat operations
  const handleAssignUser = useCallback(
    async (userId: string) => {
      try {
        if (!orgId) {
          addToast({
            title: "Misslyckades att ta bort kursplats",
            description: "Kunde inte hitta förening",
            color: "danger",
            timeout: 5000,
            icon: "mingcute:alert-fill"
          });

          return false;
        }
        // Find an available seat
        const availableSeatsResponse = await api.seats.getAvailableSeats(orgId);

        // Check if we have available seats from the API response
        if (
          !availableSeatsResponse.data ||
          !availableSeatsResponse.data.length
        ) {
          throw new Error("Inga lediga kursplatser tillgängliga");
        }

        // Get the first available seat
        const seatToAssign = availableSeatsResponse.data[0];

        // Use the updateSeat API from useSeatManager
        await updateSeatMutation.mutateAsync({
          orgId,
          seatId: seatToAssign.id,
          data: { userId },
        });

        addToast({
          title: "Kursplats tilldelad",
          description: "Användaren har tilldelats en kursplats",
          color: "success",
          timeout: 5000,
          icon: "mingcute:check-circle-fill"
        });

        refetchSeats();
        invalidateRelatedQueries();

        return true;
      } catch (error) {
        console.error("Error assigning seat:", error);

        addToast({
          title: "Ett fel uppstod",
          description: "Kunde inte tilldela kursplats",
          color: "danger",
          timeout: 5000,
          icon: "mingcute:alert-fill"
        });

        return false;
      }
    },
    [orgId, updateSeatMutation, refetchSeats],
  );

  const handleRemoveSeat = useCallback(
    (seat: ISeat) => {
      if (seat.user) {
        const enhancedUser = {
          ...seat.user,
          seat: seat,
        };

        confirmRemoveSeat(enhancedUser);
      } else {
        addToast({
          title: "Kan inte ta bort",
          description: "Denna kursplats har ingen användare",
          color: "danger",
          timeout: 5000,
          icon: "mingcute:alert-fill"
        });
      }
    },
    [confirmRemoveSeat],
  );

  const actionButtons = (
    <Button
      color="primary"
      startContent={<Icon icon="mingcute:add-line" />}
      onPress={checkAvailableSeatsBeforeAssign}
    >
      Tilldela kursplats
    </Button>
  );

  // Setup table actions
  const tableActions = useTableActions<ISeat>(seats, {
    customActions: {
      removeSeat: handleRemoveSeat,
    },
  });

  // Create columns
  const columns = [
    {
      name: "Användare",
      uid: "userName",
      renderCell: (seat: ISeat) => seat.user?.fullName || "N/A",
    },
    {
      name: "",
      uid: "actions",
      renderCell: (seat: ISeat) => (
        <Button
          color="danger"
          size="sm"
          variant="light"
          startContent={<Icon icon="mingcute:delete-line" />}
          onPress={() => handleRemoveSeat(seat)}
        >
          Ta bort
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Seats DataTable */}
      <DataTable<ISeat>
        items={seats}
        columns={columns}
        getRowKey={(seat) => seat.id}
        initialSortDescriptor={{ column: "userName", direction: "ascending" }}
        searchPlaceholder="Sök efter användare..."
        isLoading={isLoadingSeats}
        noDataContent="Inga tilldelade kursplatser hittades"
        loadingContent="Laddar kursplatser..."
        actionButtons={actionButtons}
      />

      {/* Modal for selecting a user to assign to a seat */}
      <GeneralModal
        ref={assignUserModalRef}
        title="Tilldela kursplats"
        size="md"
      >
        {() => (
          <div className="space-y-4">
            <p>Välj en användare att tilldela en kursplats:</p>

            {/* Using SelectItemModal for user selection */}
            {availableSeatsCount === 0 ? (
              <div className="text-center py-4">
                Det finns inga lediga kursplatser.
              </div>
            ) : (
              <SelectItemModal<IUser>
                user={currentUser as IUser}
                title="Välj användare"
                emptyMessage="Inga användare utan kursplats hittades"
                loadingMessage="Laddar användare..."
                buttonText="Tilldela kursplats"
                successTitle="Kursplats tilldelad"
                // successMessageTemplate="{item} har tilldelats en kursplats"
                items={availableUsers}
                isLoading={isLoadingUsers}
                getItemLabel={(user) => `${user.fullName}`}
                getItemValue={(user) => user.id}
                onAddItem={handleAssignUser}
              />
            )}
          </div>
        )}
      </GeneralModal>

      {/* Seat removal confirmation modal (from useSeatManager) */}
      <GeneralModal
        ref={removeSeatModalRef}
        title="Ta bort kursplats"
        size="md"
      >
        {() => <ConfirmationModal {...renderRemoveSeatModal()} />}
      </GeneralModal>
    </div>
  );
}
