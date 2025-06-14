import { useCallback } from "react";
import { addToast } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";

import { useApi } from "@/services/useApi";
import { IUser, ISeat } from "@/types";
import useUserStore from "@/store/useUserStore";
import { useConfirmation } from "@/hooks/useConfirmation";

interface UseSeatManagerOptions {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

/**
 * Hook for managing seat assignments and removals
 *
 * Provides utilities to:
 * - Find the first available seat in an organization
 * - Assign a user to an available seat
 * - Remove a user from their current seat
 * - Refs for confirmation modals
 * - Handlers that trigger the confirmation flow
 */
export function useSeatManager(options?: UseSeatManagerOptions) {
  const api = useApi();
  const queryClient = useQueryClient();
  const { user: storedUser, refreshUser } = useUserStore();
  const organizationId = storedUser?.organization?.id;

  const updateSeatMutation = api.seats.useUpdateSeat();

  /**
   * Finds the first available (unassigned) seat in the organization
   */
  const findAvailableSeat = useCallback(async (): Promise<ISeat | null> => {
    if (!organizationId) {
      addToast({
        title: "Fel",
        description: "Ingen förening hittad",
        color: "danger",
        timeout: 5000,
        icon: "mingcute:alert-fill"
      });

      return null;
    }

    try {
      // Get all seats for the organization
      const { data: response } =
        await api.seats.getAvailableSeats(organizationId);

      if (!response || !Array.isArray(response)) {
        return null;
      }

      // If we have seats, return the first one
      return response.length > 0 ? response[0] : null;
    } catch (error) {
      console.error("Error finding available seat:", error);

      return null;
    }
  }, [organizationId, api.seats, addToast]);

  /**
   * Assigns a user to a seat
   * Finds the first available seat and assigns the user to it
   */
  const assignSeat = useCallback(
    async (user: IUser): Promise<boolean> => {
      if (!organizationId) {
        addToast({
          title: "Fel",
          description: "Ingen förening hittad",
          color: "danger",
          timeout: 5000,
          icon: "mingcute:alert-fill"
        });

        return false;
      }

      // Check if user already has a seat
      if (user.seat) {
        addToast({
          title: "Information",
          description: `${user.firstName} ${user.lastName} har redan en kursplats`,
          color: "warning",
          timeout: 5000,
          icon: "mingcute:alert-fill"
        });

        return false;
      }

      try {
        // Find an available seat
        const availableSeat = await findAvailableSeat();

        if (!availableSeat) {
          addToast({
            title: "Inga lediga platser",
            description: "Alla kursplatser är redan upptagna",
            color: "danger",
            timeout: 5000,
            icon: "mingcute:alert-fill"
          });

          return false;
        }

        // Assign the user to the seat
        await updateSeatMutation.mutateAsync({
          orgId: organizationId,
          seatId: availableSeat.id,
          data: { userId: user.id },
        });

        await refreshUser();

        queryClient.invalidateQueries({ queryKey: ["users", user] });
        queryClient.invalidateQueries({ queryKey: ["filtered-users"] });
        queryClient.invalidateQueries({ queryKey: ["users"] });

        addToast({
          title: "Kursplats tilldelad",
          description: `${user.firstName} ${user.lastName} har tilldelats en kursplats`,
          color: "success",
          timeout: 5000,
          icon: "mingcute:check-circle-fill"
        });

        return true;
      } catch (error) {
        console.error("Error assigning seat:", error);
        addToast({
          title: "Fel vid tilldelning",
          description: "Kunde inte tilldela kursplats",
          color: "danger",
          icon: "mingcute:alert-fill",
          timeout: 5000
        });

        return false;
      }
    },
    [
      organizationId,
      updateSeatMutation,
      findAvailableSeat,
      refreshUser,
      queryClient,
      options,
    ],
  );

  /**
   * Removes a user from their assigned seat
   */
  const removeSeat = useCallback(
    async (user: IUser): Promise<boolean> => {
      console.log("User received in removeSeat:", user);
console.log("User seat property:", user.seat);
console.log("User seat ID:", user.seat?.id);
      if (!organizationId) {
        addToast({
          title: "Fel",
          description: "Ingen förening hittad",
          color: "warning",
          timeout: 5000,
          icon: "mingcute:alert-fill"
        });

        return false;
      }

      // Check if user has a seat
      if (!user.seat) {
        addToast({
          title: "Information",
          description: `${user.firstName} ${user.lastName} har ingen tilldelad kursplats`,
          timeout: 5000,
          color: "warning",
          icon: "mingcute:alert-fill"
        });

        return false;
      }

      try {
        // Remove the user from the seat
        await updateSeatMutation.mutateAsync({
          orgId: organizationId,
          seatId: user.seat.id,
          data: { userId: "" },
        });

        await refreshUser();

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["filtered-users"] });
        queryClient.invalidateQueries({ queryKey: ["users", user.id] });
        queryClient.invalidateQueries({ queryKey: ["seats"] });

        // Call success callback if provided
        if (options?.onSuccess) options.onSuccess();

        addToast({
          title: "Kursplats borttagen",
          description: `${user.firstName} ${user.lastName} har förlorat sin kursplats`,
          color: "success",
          timeout: 5000,
          icon: "mingcute:check-circle-fill"
        });

        return true;
      } catch (error) {
        console.error("Error removing seat:", error);

        if (options?.onError) options.onError(error);

        addToast({
          title: "Fel vid borttagning",
          description: "Kunde inte ta bort kursplats",
          color: "danger",
          timeout: 5000,
          icon: "mingcute:alert-fill"
        });

        return false;
      }
    },
    [organizationId, updateSeatMutation, refreshUser, queryClient, options],
  );

  // Setup seat assignment confirmation
  const {
    modalRef: assignSeatModalRef,
    confirm: confirmAssignSeat,
    renderConfirmationModal: renderAssignSeatModal,
  } = useConfirmation<IUser>({
    title: "Lägg till kursplats",
    message: (user: IUser) =>
      `Vill du lägga till en kursplats för ${user.firstName} ${user.lastName}?`,
    confirmLabel: "Lägg till",
    onConfirm: assignSeat,
  });

  const {
    modalRef: removeSeatModalRef,
    confirm: confirmRemoveSeat,
    renderConfirmationModal: renderRemoveSeatModal,
  } = useConfirmation<IUser>({
    title: "Ta bort kursplats",
    message: (user: IUser) =>
      `Är du säker på att du vill ta bort kursplatsen för ${user.firstName} ${user.lastName}?`,
    confirmLabel: "Ta bort",
    confirmColor: "danger",
    onConfirm: removeSeat,
  });

  return {
    // Core functionality
    findAvailableSeat,
    assignSeat,
    removeSeat,

    // Confirmation helpers
    confirmAssignSeat,
    confirmRemoveSeat,

    // Modal refs
    assignSeatModalRef,
    removeSeatModalRef,

    // Render helpers for confirmation modals
    renderAssignSeatModal,
    renderRemoveSeatModal,
  };
}
