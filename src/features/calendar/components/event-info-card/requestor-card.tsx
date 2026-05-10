import { Users, GraduationCap, Building2, ExternalLink } from "lucide-react";
import { EventDetails } from "@/interface/user-props";

interface RequestorCardProps {
  requestor: NonNullable<EventDetails["requestor"]>;
  proofOfRequest?: string;
  proofOfApproval?: string;
}

function formatRequestorCategory(requestor: NonNullable<EventDetails["requestor"]>): string {
  if (requestor.type === 'student') {
    const labels: Record<string, string> = {
      student_org: 'Student Organization/Society',
      csg: 'College Student Government',
      lso: 'LSO',
      sgdc: 'SGDC',
    };
    return labels[requestor.student_sub_type ?? ''] ?? 'Student';
  }
  if (requestor.type === 'faculty') return 'Faculty';
  return 'Office';
}

function requestorNameLabel(requestor: NonNullable<EventDetails["requestor"]>): string {
  if (requestor.type === 'student') {
    if (requestor.student_sub_type === 'student_org') return 'Organization / Society Name';
    if (requestor.student_sub_type === 'csg') return 'College Student Government Name';
    if (requestor.student_sub_type === 'lso' || requestor.student_sub_type === 'sgdc') return 'Student Group';
    return 'Student Category';
  }
  return requestor.type === 'faculty' ? 'Degree Course' : 'Office';
}

function requestorNameValue(requestor: NonNullable<EventDetails["requestor"]>): string {
  if (requestor.type === 'student') {
    if (requestor.student_sub_type === 'student_org') return requestor.student_org_name || 'Not provided';
    if (requestor.student_sub_type === 'csg') return requestor.csg_name || 'Not provided';
    return formatRequestorCategory(requestor);
  }

  return requestor.tagged?.map(item => item.name).join(', ') || 'Not provided';
}

export function RequestorCard({ requestor, proofOfRequest, proofOfApproval }: RequestorCardProps) {
  return (
    <div className="bg-white text-card-foreground border border-border rounded-lg">
      <div className="p-6 flex items-center">
        {requestor.type === 'student' && <Users className="text-gray-700 mr-2 h-5 w-5" />}
        {requestor.type === 'faculty' && <GraduationCap className="text-gray-700 mr-2 h-5 w-5" />}
        {requestor.type === 'office' && <Building2 className="text-gray-700 mr-2 h-5 w-5" />}
        <h3 className="text-lg font-medium text-gray-700">Requestor</h3>
      </div>
      <div className="border-t border-gray-200" />
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Type</p>
          <p className="font-medium text-base capitalize">{requestor.type}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Category</p>
          <p className="font-medium text-base">{formatRequestorCategory(requestor)}</p>
        </div>
        <div className="md:col-start-1">
          <p className="text-sm text-gray-500">{requestorNameLabel(requestor)}</p>
          <p className="font-medium text-base">{requestorNameValue(requestor)}</p>
        </div>
        <div className="md:col-start-2">
          <p className="text-sm text-gray-500">Requested by</p>
          <p className="font-medium text-base">{requestor.requested_by || "Not provided"}</p>
        </div>
        {proofOfRequest && (
          <div className="md:col-start-1">
            <p className="text-sm text-gray-500">Proof of Request</p>
            <a
              href={proofOfRequest}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex max-w-full items-start gap-1.5 mt-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span className="min-w-0 break-all">{proofOfRequest}</span>
            </a>
          </div>
        )}
        {proofOfApproval && (
          <div className="md:col-start-2">
            <p className="text-sm text-gray-500">Proof of Approval/Decline</p>
            <a
              href={proofOfApproval}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex max-w-full items-start gap-1.5 mt-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span className="min-w-0 break-all">{proofOfApproval}</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
