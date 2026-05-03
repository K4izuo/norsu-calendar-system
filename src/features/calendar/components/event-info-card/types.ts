import { EventDetails } from "@/interface/user-props";
import { UserRole } from "@/shared/components/utils/role-colors";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: EventDetails;
  loading?: boolean;
  role?: UserRole;
  userRoleNumber?: number;
  onApprove?: () => void;
  onDecline?: () => void;
  onResubmit?: (event: EventDetails) => void;
  showBackdropBlur?: boolean;
  fromMovedEvents?: boolean;
}
