import { useState } from "react";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { authService } from "@/features/auth/services/auth-service";
import { useAuth } from "@/shared/components/context/auth-context";
import { getUserId } from "@/core/auth/auth";
import { AccountUpdateFormData } from "@/features/auth/types/auth.types";

interface UseUpdateProfileReturn {
  updateProfile: (data: AccountUpdateFormData) => Promise<boolean>;
  isLoading: boolean;
}

export function useUpdateProfile(): UseUpdateProfileReturn {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { user, login } = useAuth();

  const updateProfile = async (data: AccountUpdateFormData): Promise<boolean> => {
    const userId = getUserId();
    if (!userId) return false;

    setIsLoading(true);
    try {
      const response = await authService.updateAccount(userId, data);

      if (response.error) {
        toast.error(response.error, { position: "top-center" });
        return false;
      }

      toast.success("Profile updated successfully!", { position: "top-center" });

      // Refresh the currentUser query so left panel stats stay in sync
      queryClient.invalidateQueries({ queryKey: ["currentUser", userId] });

      // Update the auth context so the header name reflects changes immediately
      if (user) {
        login({
          ...user,
          first_name: data.first_name ?? user.first_name,
          last_name: data.last_name ?? user.last_name,
          email: data.email ?? user.email,
        });
      }

      return true;
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error("Failed to update profile. Please try again.", {
        position: "top-center",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateProfile, isLoading };
}
