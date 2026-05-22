"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { authService } from "@/features/auth/services/auth-service";
import { ROLE_DISPLAY_NAMES, UserRole } from "@/features/auth/types/auth.types";
import { AccountUser } from "./types";

const ADMIN_ROLE = 3;

const ALL_ROLES = Object.entries(ROLE_DISPLAY_NAMES).map(([value, label]) => ({
  value: Number(value) as UserRole,
  label,
}));

interface PrivilegeTabProps {
  accountUser: AccountUser;
  userId: number;
  currentUserId: number;
}

export function PrivilegeTab({ accountUser, userId, currentUserId }: PrivilegeTabProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(accountUser.role as UserRole);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const isSelf = accountUser.id === currentUserId;
  const isTargetAdmin = accountUser.role === ADMIN_ROLE;
  const isProtected = isSelf || isTargetAdmin;

  const currentRoleLabel =
    ROLE_DISPLAY_NAMES[accountUser.role as UserRole] ?? `Role ${accountUser.role}`;

  const newRoleLabel =
    ROLE_DISPLAY_NAMES[selectedRole] ?? `Role ${selectedRole}`;

  const hasChanged = selectedRole !== accountUser.role;

  const handleCancel = () => {
    setSelectedRole(accountUser.role as UserRole);
    setIsEditing(false);
  };

  const handleSaveClick = () => {
    if (!hasChanged) return;
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    setIsSaving(true);
    try {
      const response = await authService.updateUserRole(userId, selectedRole);
      if (response.error) {
        toast.error(response.error, { position: "top-right" });
        return;
      }
      toast.success("Role updated successfully!", { position: "top-right" });
      queryClient.invalidateQueries({ queryKey: ["accountUser", userId] });
      setIsEditing(false);
    } catch {
      toast.error("Failed to update role.", { position: "top-right" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="flex border rounded-lg flex-col items-start self-stretch">
        <div className="flex border-b p-6 justify-between items-center self-stretch">
          <h3 className="text-lg flex items-center gap-1 font-semibold text-gray-900">
            <Shield className="w-4 h-4" strokeWidth={2.5} />
            Privilege &amp; Role
          </h3>
          {!isProtected && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex cursor-pointer items-center gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <Shield className="w-3.5 h-3.5" />
              Change Role
            </Button>
          )}
        </div>

        <div className="p-6 w-full">
          {isSelf && (
            <ProtectedNotice
              icon={ShieldAlert}
              title="Cannot change your own role"
              description="You are not allowed to modify the role of your own account."
            />
          )}

          {!isSelf && isTargetAdmin && (
            <ProtectedNotice
              icon={ShieldCheck}
              title="Admin accounts are protected"
              description="The role of another admin account cannot be changed."
            />
          )}

          {!isProtected && !isEditing && (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-400 font-normal leading-none">Current Role</p>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-100">
                  <Shield className="w-3.5 h-3.5" />
                  {currentRoleLabel}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                This role controls what features and pages this user can access.
              </p>
            </div>
          )}

          {!isProtected && isEditing && (
            <div className="flex flex-col gap-6 max-w-sm">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-normal text-gray-700 leading-none">
                  Assign New Role
                </label>
                <Select
                  value={String(selectedRole)}
                  onValueChange={(val) => setSelectedRole(Number(val) as UserRole)}
                >
                  <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-150">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_ROLES.map(({ value, label }) => (
                      <SelectItem key={value} value={String(value)}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400">
                  Currently: <span className="font-medium text-gray-600">{currentRoleLabel}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleSaveClick}
                  disabled={isSaving || !hasChanged}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                >
                  {isSaving ? "Saving…" : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Confirm Role Change
            </DialogTitle>
            <DialogDescription className="pt-1">
              You are about to change{" "}
              <span className="font-medium text-gray-900">
                {accountUser.first_name} {accountUser.last_name}
              </span>
              &apos;s role from{" "}
              <span className="font-semibold text-gray-900">{currentRoleLabel}</span>{" "}
              to{" "}
              <span className="font-semibold text-blue-700">{newRoleLabel}</span>.
              This will immediately affect what they can access in the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSaving ? "Saving…" : "Confirm Change"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ProtectedNotice({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-100 bg-amber-50 p-4">
      <Icon className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-semibold text-amber-800">{title}</p>
        <p className="text-sm text-amber-700">{description}</p>
      </div>
    </div>
  );
}
