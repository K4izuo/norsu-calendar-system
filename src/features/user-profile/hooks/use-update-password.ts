import { useState } from "react";
import { toast } from "react-hot-toast";
import { apiClient } from "@/core/api/api-client";
import { PasswordChangeFormData } from "@/features/auth/types/auth.types";

interface UpdatePasswordResponse {
  message: string;
}

interface UseUpdatePasswordReturn {
  updatePassword: (data: PasswordChangeFormData) => Promise<boolean>;
  isLoading: boolean;
}

export function useUpdatePassword(): UseUpdatePasswordReturn {
  const [isLoading, setIsLoading] = useState(false);

  const updatePassword = async (data: PasswordChangeFormData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiClient.put<UpdatePasswordResponse, PasswordChangeFormData>(
        "update-password",
        data
      );

      if (response.error) {
        toast.error(response.error, { position: "top-center" });
        return false;
      }

      toast.success(response.data?.message ?? "Password updated successfully!", {
        position: "top-center",
      });
      return true;
    } catch (err) {
      console.error("Password update error:", err);
      toast.error("Failed to update password. Please try again.", {
        position: "top-center",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { updatePassword, isLoading };
}