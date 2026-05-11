import {
  CalendarPlus2,
  MapPin,
  NotebookPen,
  FileText,
  Package,
  User,
  Users,
  GraduationCap,
  Building2,
  ExternalLink,
} from "lucide-react";
import { ReservationFormData, RequestorInfo } from "@/interface/user-props";
import { formatDisplayDate } from "@/features/reservations/components/reserve-event/reserve-modal/modal-constants";

interface Props {
  formData: ReservationFormData;
  categories: { value: string; label: string }[];
  infoTypes: { value: string; label: string }[];
  taggedPeople: { id: number; name: string }[];
  requestorInfo?: RequestorInfo | null;
}

function formatRequestorLabel(r: RequestorInfo): string {
  if (r.type === 'student') {
    const subLabels: Record<string, string> = {
      student_org: 'Student Organization/Society',
      csg: 'College Student Government',
      lso: 'LSO',
      sgdc: 'SGDC',
    };
    return subLabels[r.student_sub_type ?? ''] ?? 'Student';
  }
  if (r.type === 'faculty') return 'Faculty';
  return 'Office';
}

function requestorNameLabel(r: RequestorInfo): string {
  if (r.type === 'student') {
    if (r.student_sub_type === 'student_org') return 'Organization / Society Name';
    if (r.student_sub_type === 'csg') return 'College Student Government Name';
    if (r.student_sub_type === 'lso' || r.student_sub_type === 'sgdc') return 'Student Group';
    return 'Student Category';
  }
  return r.type === 'faculty' ? 'Degree Course' : 'Office';
}

function requestorNameValue(r: RequestorInfo): string {
  if (r.type === 'student') {
    if (r.student_sub_type === 'student_org') return r.student_org_name || 'Not provided';
    if (r.student_sub_type === 'csg') return r.csg_name || 'Not provided';
    return formatRequestorLabel(r);
  }

  return r.tagged?.map(item => item.name).join(', ') || 'Not provided';
}

export function ReserveEventSummaryTab({
  formData,
  categories,
  infoTypes,
  taggedPeople,
  requestorInfo,
}: Props) {
  const asset = formData.asset;
  const requestorDisplayName = requestorInfo
    ? requestorNameValue(requestorInfo)
    : "";

  const formatTime = (time: string) => {
    if (!time) return "Not specified";
    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };
  return (
    <div className="space-y-4 sm:space-y-6 pb-4 sm:pb-8">
      {requestorInfo && (
        <div className="bg-white text-card-foreground border border-border rounded-lg">
          <div className="flex items-center px-6 pt-6 pb-4">
            {requestorInfo.type === 'student' && <Users className="text-gray-500 mr-2 h-6 w-6" />}
            {requestorInfo.type === 'faculty' && <GraduationCap className="text-gray-500 mr-2 h-6 w-6" />}
            {requestorInfo.type === 'office' && <Building2 className="text-gray-500 mr-2 h-6 w-6" />}
            <h3 className="text-lg font-medium text-gray-700">Requestor Information</h3>
          </div>
          <div className="border-t border-gray-200" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 py-4">
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-medium text-base capitalize">{requestorInfo.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-medium text-base">{formatRequestorLabel(requestorInfo)}</p>
            </div>
            <div className="md:col-start-1">
              <p className="text-sm text-gray-500">{requestorNameLabel(requestorInfo)}</p>
              <p className="font-medium text-base">{requestorDisplayName}</p>
            </div>
            <div className="md:col-start-2">
              <p className="text-sm text-gray-500">Requested by</p>
              <p className="font-medium text-base">{requestorInfo.requested_by || "Not provided"}</p>
            </div>
            {formData.proof_of_request && (
              <div className="md:col-start-1">
                <p className="text-sm text-gray-500">Proof of Request</p>
                <a
                  href={formData.proof_of_request}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex max-w-full items-start gap-1.5 mt-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span className="min-w-0 break-all">{formData.proof_of_request}</span>
                </a>
              </div>
            )}
            {formData.proof_of_approval && (
              <div className="md:col-start-2">
                <p className="text-sm text-gray-500">Proof of Approval/Decline</p>
                <a
                  href={formData.proof_of_approval}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex max-w-full items-start gap-1.5 mt-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span className="min-w-0 break-all">{formData.proof_of_approval}</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white text-card-foreground border border-border rounded-lg">
        <div className="flex items-center px-6 pt-6 pb-4">
          <CalendarPlus2 className="text-gray-500 mr-2 h-6 w-6" />
          <h3 className="text-lg font-medium text-gray-700">
            Basic Information
          </h3>
        </div>
        <div className="border-t border-gray-200" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 py-4">
          <div>
            <p className="text-sm text-gray-500">Event Title</p>
            <p className="font-medium text-base">
              {formData.title_name || "Not provided"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Information Type</p>
            <p className="font-medium text-base">
              {infoTypes.find((type) => type.value === formData.info_type)
                ?.label || "Not provided"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Required Attendees</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {taggedPeople.length > 0 ? (
                taggedPeople.map((person) => (
                  <span
                    key={person.id}
                    className="inline-flex text-base font-medium text-gray-800"
                  >
                    {/* <User className="w-3 h-3 mr-1.5 text-gray-800" /> */}
                    {person.name}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-sm">None</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Category</p>
            <p className="font-medium text-base">
              {formData.category === "other" && formData.other_category
                ? formData.other_category
                : categories.find((cat) => cat.value === formData.category)?.label || "Not provided"}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white text-card-foreground border border-border rounded-lg">
        <div className="flex items-center px-6 pt-6 pb-4">
          <MapPin className="text-gray-500 mr-2 h-6 w-6" />
          <h3 className="text-lg font-medium text-gray-700">
            Asset Information
          </h3>
        </div>
        <div className="border-t border-gray-200" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 py-4">
          {/* <div>
            <p className="text-base text-gray-500">Asset Type</p>
            <p className="font-medium text-base">{asset?.asset_type || "Not selected"}</p>
          </div> */}
          <div>
            <p className="text-sm text-gray-500">Asset Name</p>
            <p className="font-medium text-base">
              {asset?.asset_name || "Not selected"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Capacity</p>
            <p className="font-medium text-base">{asset?.capacity || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Selected Date</p>
            <p className="font-medium text-base">
              {formatDisplayDate(formData.date) || "Not selected"}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white text-card-foreground border border-border rounded-lg">
        <div className="flex items-center px-6 pt-6 pb-4">
          <Package className="text-gray-500 mr-2 h-6 w-6" />
          <h3 className="text-lg font-medium text-gray-700">Equipment</h3>
        </div>
        <div className="border-t border-gray-200" />
        <div className="px-6 py-4">
          {formData.equipment && formData.equipment.filter(e => e?.name).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {formData.equipment.filter(e => e?.name).map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2.5 py-1.5 rounded-full text-sm font-medium bg-gray-100"
                >
                  {item.name} × {item.quantity}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No equipment selected</p>
          )}
        </div>
      </div>
      <div className="bg-white text-card-foreground border border-border rounded-lg">
        <div className="flex items-center px-6 pt-6 pb-4">
          <NotebookPen className="text-gray-500 mr-2 h-6 w-6" />
          <h3 className="text-lg font-medium text-gray-700">
            Reservation Details
          </h3>
        </div>
        <div className="border-t border-gray-200" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 py-4">
          <div>
            <p className="text-sm text-gray-500">Start Time</p>
            <div className="flex items-center">
              {/* <Clock className="h-4 w-4 mr-1.5 text-gray-500" /> */}
              <p className="font-medium text-base">
                {formatTime(formData.time_start)}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">End Time</p>
            <div className="flex items-center">
              {/* <Clock className="h-4 w-4 mr-1.5 text-gray-500" /> */}
              <p className="font-medium text-base">
                {formatTime(formData.time_end)}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Reservation Day(s)</p>
            <p className="font-medium text-base">
              {formData.range} day{formData.range > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>
      {(formData.description || formData.outsource || (formData.guests && formData.guests.length > 0)) && (
        <div className="bg-white text-card-foreground border border-border rounded-lg">
          <div className="flex items-center px-6 pt-6 pb-4">
            <FileText className="text-gray-500 mr-2 h-6 w-6" />
            <h3 className="text-lg font-medium text-gray-700">
              Additional Details
            </h3>
          </div>
          <div className="border-t border-gray-200" />
          <div className="px-6 py-4 space-y-4">
            {formData.description && (
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="mt-1 text-base">{formData.description}</p>
              </div>
            )}
            {formData.outsource && (
              <div>
                <p className="text-sm text-gray-500">Outsource</p>
                <p className="mt-1 text-base">{formData.outsource}</p>
              </div>
            )}
            {formData.guests && formData.guests.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Guests</p>
                <div className="flex flex-col gap-2">
                  {formData.guests.map((guest, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50"
                    >
                      <User className="w-4 h-4 shrink-0 text-gray-500" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800">{guest.name}</p>
                        {guest.details && (
                          <p className="text-xs text-gray-500">{guest.details}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
