import React from "react";
import { ClipboardCheck } from "lucide-react";
import { EventDetails } from "@/interface/user-props";
import { SignatoryRow } from "./signatory-row";

interface SignatoriesCardProps {
  event: EventDetails;
}

export function SignatoriesCard({ event }: SignatoriesCardProps) {
  const showAdminSignatoryRow =
    event.campus_director_action === "endorse" ||
    event.current_stage === "university_president" ||
    event.approvals?.some(a => a.stage === "university_president");

  const findApproval = (stage: string) =>
    event.approvals?.find(a => a.stage === stage);

  return (
    <div className="bg-white text-card-foreground border border-border rounded-lg">
      <div className="p-6 flex items-center">
        <ClipboardCheck className="text-gray-700 mr-2 h-5 w-5" />
        <h3 className="text-lg font-medium text-gray-700">Signatories</h3>
      </div>
      <div className="border-t border-gray-200" />
      <div className="p-6 space-y-3">
        {event.involves_students && (
          <SignatoryRow label="Student Director" approval={findApproval("student_director")} />
        )}
        {event.requires_vpaa && (
          <SignatoryRow label="VPAA" approval={findApproval("vpaa")} />
        )}
        {event.requires_vpsas && (
          <SignatoryRow label="VPSAS" approval={findApproval("vpsas")} />
        )}
        {!!event.requires_vpaf && (
          <SignatoryRow label="VPAF" approval={findApproval("vpaf")} />
        )}
        {!!event.requires_vprde && (
          <SignatoryRow label="VPRDE" approval={findApproval("vprde")} />
        )}
        <SignatoryRow label="Campus Director" approval={findApproval("campus_director")} />
        {showAdminSignatoryRow && (
          <SignatoryRow label="University President" approval={findApproval("university_president")} />
        )}
      </div>
    </div>
  );
}
