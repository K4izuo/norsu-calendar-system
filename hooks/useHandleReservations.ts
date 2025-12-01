import { apiClient } from "@/lib/api-client";
import { getUserId } from "@/lib/auth";
import { EventDetails } from "@/interface/user-props";
import toast from "react-hot-toast";

interface HandleApproveParams {
  event: EventDetails;
  onSuccess?: () => void;
  onClose: () => void;
}

interface HandleDeclineParams {
  event: EventDetails;
  onSuccess?: () => void;
  onClose: () => void;
}

interface HandleEditParams {
  setShowEditModal: (show: boolean) => void;
}

export const handleApproveReservation = async ({
  event,
  onSuccess,
  onClose,
}: HandleApproveParams) => {
  const userId = getUserId();

  if (!userId) {
    toast.error('User not authenticated. Please login again.', {
      position: 'top-center',
      duration: 4000,
    });
    return { success: false, error: 'User not authenticated' };
  }

  try {
    const { data, error, status } = await apiClient.put(
      `/reservations/${event.id}`,
      {
        status: 'APPROVED',
        approved_by_user: userId,
      }
    );

    if (error) {
      toast.error(`Failed to approve reservation: ${error}`, {
        position: 'top-center',
        duration: 4000,
      });
      return { success: false, error };
    }

    // Success
    toast.success('Reservation approved successfully!', {
      position: 'top-center',
      duration: 4000,
    });

    if (onSuccess) {
      onSuccess();
    }

    onClose();

    return { success: true, data };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    toast.error(`Error: ${errorMessage}`, {
      position: 'top-center',
      duration: 4000,
    });
    return { success: false, error: errorMessage };
  }
};

export const handleDeclineReservation = async ({
  event,
  onSuccess,
  onClose,
}: HandleDeclineParams) => {
  const userId = getUserId();

  if (!userId) {
    toast.error('User not authenticated. Please login again.', {
      position: 'top-center',
      duration: 4000,
    });
    return { success: false, error: 'User not authenticated' };
  }

  try {
    const { data, error, status } = await apiClient.put(
      `/reservations/${event.id}`,
      {
        status: 'REJECTED',
        declined_by_user: userId,
      }
    );

    if (error) {
      toast.error(`Failed to decline reservation: ${error}`, {
        position: 'top-center',
        duration: 4000,
      });
      return { success: false, error };
    }

    // Success
    toast.success('Reservation declined successfully!', {
      position: 'top-center',
      duration: 4000,
    });

    if (onSuccess) {
      onSuccess();
    }

    onClose();

    return { success: true, data };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    toast.error(`Error: ${errorMessage}`, {
      position: 'top-center',
      duration: 4000,
    });
    return { success: false, error: errorMessage };
  }
};

export const handleEditReservation = ({
  setShowEditModal,
}: HandleEditParams) => {
  setShowEditModal(true);
};