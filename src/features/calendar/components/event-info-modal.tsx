"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  NotebookPen,
  CalendarClock,
  MapPin,
  Info,
  X,
  CircleCheckBig,
  XCircle,
  MoveRight,
  GripVertical,
  Package,
  User,
  Users,
  GraduationCap,
  Building2,
  ClipboardCheck,
  RotateCcw,
} from "lucide-react";
import { Button } from "../../../shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { EventDetails, ReservationApproval } from "@/interface/user-props";
import { UserRole } from "@/shared/components/utils/role-colors";
import {
  useApproveReservation,
  useDeclineReservation,
} from "@/features/calendar/services/reservation-service";
import { ConfirmationModal } from "../../reservations/components/confirmation-modal";
import { CampusDirectorApprovalModal } from "../../reservations/components/campus-director-approval-modal";
import { formatTime } from "@/core/lib/utils";
import { MoveReservationModal } from "../../reservations/components/move-reservation-modal";

interface ModalProps {
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

const getStatus = (event: EventDetails): "PENDING" | "APPROVED" | "DECLINED" => {
  if (!event.registration_status) return "PENDING";
  const status = event.registration_status.toUpperCase();
  if (status === "OPEN") return "APPROVED";
  if (status === "CLOSED") return "DECLINED";
  if (status === "PENDING" || status === "APPROVED" || status === "DECLINED") {
    return status as "PENDING" | "APPROVED" | "DECLINED";
  }
  return "PENDING";
};

const getStatusColor = (status: "PENDING" | "APPROVED" | "DECLINED") => {
  if (status === "APPROVED") return "bg-green-100 text-green-800";
  if (status === "PENDING") return "bg-yellow-100 text-yellow-800";
  if (status === "DECLINED") return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
};

const getStartedAgo = (eventDate: string, eventTime: string): string | null => {
  if (!eventDate || !eventTime) return null;
  try {
    const eventStart = new Date(eventDate + " " + eventTime);
    if (isNaN(eventStart.getTime())) return null;
    const now = new Date();
    if (eventStart > now) {
      return eventStart.toDateString() === now.toDateString() ? `Starts at ${eventTime}` : "Upcoming";
    }
    const diffMs = now.getTime() - eventStart.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Started just now";
    if (diffMins < 60) return `Started ${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Started ${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `Started ${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  } catch {
    return null;
  }
};

const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return dateStr;
  }
};

function getApprovalBadge(approval?: ReservationApproval) {
  if (!approval) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
  }
  const action = approval.action;
  if (action === "APPROVED" || action === "APPROVE" || action === "ENDORSE") {
    const label = action === "ENDORSE" ? "Endorsed" : "Approved";
    const approverName = approval.user
      ? `${approval.user.first_name} ${approval.user.last_name}`
      : null;
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{label}</span>
        {approverName && <span className="text-xs text-gray-500">by {approverName}</span>}
        <span className="text-xs text-gray-400">{new Date(approval.created_at).toLocaleDateString()}</span>
      </div>
    );
  }
  if (action === "DECLINED") {
    const approverName = approval.user
      ? `${approval.user.first_name} ${approval.user.last_name}`
      : null;
    return (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Declined</span>
          {approverName && <span className="text-xs text-gray-500">by {approverName}</span>}
        </div>
        {approval.reason && <span className="text-xs text-gray-500 pl-1">Reason: {approval.reason}</span>}
      </div>
    );
  }
  return null;
}

function SignatoryRow({ label, approval }: { label: string; approval?: ReservationApproval }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <span className="text-sm text-gray-600 min-w-32">{label}</span>
      <div className="flex-1">{getApprovalBadge(approval)}</div>
    </div>
  );
}

export const EventInfoModal = React.memo(function EventInfoModal({
  isOpen,
  onClose,
  event,
  loading = false,
  role,
  userRoleNumber,
  onApprove,
  onDecline,
  onResubmit,
  showBackdropBlur = false,
  fromMovedEvents = false,
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [showCdModal, setShowCdModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showDotsMenu, setShowDotsMenu] = useState(false);

  const { mutate: approveReservation, isPending: isApproving } = useApproveReservation();
  const { mutate: declineReservation, isPending: isDeclining } = useDeclineReservation();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const startedAgoText = event ? getStartedAgo(event.date, event.time_start) : null;
  const eventRange = Number(event?.range ?? 0);
  const asset = event?.asset;
  const assetName = asset?.asset_name || "Not specified";
  const assetCapacity = asset?.capacity || "N/A";
  const assetAminities = asset?.aminities;

  const status = event ? getStatus(event) : "PENDING";
  const isCampusDirectorRole = userRoleNumber === 5;
  const currentStage = event?.current_stage;

  const isSubmitterDeclined =
    status === "DECLINED" &&
    (userRoleNumber === 1 || userRoleNumber === 10);

  const isCdStage = currentStage === "campus_director" && isCampusDirectorRole;

  const showAdminSignatoryRow =
    event?.campus_director_action === "endorse" ||
    currentStage === "admin" ||
    event?.approvals?.some(a => a.stage === "admin");

  const findApproval = (stage: string) =>
    event?.approvals?.find(a => a.stage === stage);

  const handleApproveConfirm = () => {
    if (!event) return;
    setShowApproveConfirm(false);
    approveReservation({ reservationId: event.id }, {
      onSuccess: () => { onApprove?.(); onClose(); },
    });
  };

  const handleDeclineConfirm = (reason?: string) => {
    if (!event) return;
    setShowDeclineConfirm(false);
    declineReservation({ reservationId: event.id, reason }, {
      onSuccess: () => { onDecline?.(); onClose(); },
    });
  };

  const handleCdConfirm = (action: "APPROVE" | "ENDORSE") => {
    if (!event) return;
    setShowCdModal(false);
    approveReservation({ reservationId: event.id, action }, {
      onSuccess: () => { onApprove?.(); onClose(); },
    });
  };

  const showSignatoriesCard = !!(
    event?.involves_students ||
    event?.requires_vpaa ||
    event?.requires_vpsas ||
    event?.requires_vpaf ||
    event?.requires_vprde
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-1.5 sm:p-4 overscroll-none">
            <motion.div
              className={`absolute inset-0 bg-black/50 ${showBackdropBlur ? "sm:bg-black/50" : ""}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
              ref={contentRef}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ type: "tween", duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white z-10 p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center rounded-t-xl">
                <div className="flex items-center gap-2">
                  <CalendarClock className="text-gray-800 h-6 w-6" strokeWidth={2.5} />
                  <h2 className="text-xl font-semibold text-gray-800">Event Details</h2>
                </div>
                <Button
                  onClick={onClose}
                  className="p-2 cursor-pointer shadow-none bg-white rounded-full hover:bg-gray-100 focus:outline-none"
                  aria-label="Close"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </Button>
              </div>

              {/* Loading skeleton */}
              {loading && (
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 sm:p-6 space-y-6">
                    <div className="border border-border rounded-lg p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-2/3" />
                          <Skeleton className="h-4 w-1/3" />
                        </div>
                      </div>
                      <div className="border-t border-border" />
                      <div className="flex justify-between gap-4">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="space-y-1.5">
                            <Skeleton className="h-3.5 w-16" />
                            <Skeleton className="h-5 w-20" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="border border-border rounded-lg p-6 space-y-4">
                      <Skeleton className="h-5 w-44" />
                      <div className="border-t border-border" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="space-y-1.5">
                            <Skeleton className="h-3.5 w-20" />
                            <Skeleton className="h-5 w-32" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="border border-border rounded-lg p-6 space-y-4">
                      <Skeleton className="h-5 w-40" />
                      <div className="border-t border-border" />
                      <div className="space-y-2">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Event details body */}
              {!loading && event && (
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 sm:p-6 space-y-6">
                    {/* Moved event notice */}
                    {fromMovedEvents && event.is_moved && (
                      <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                        <MoveRight className="h-4 w-4 shrink-0 text-amber-600" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">This event has been moved</p>
                          <p className="text-xs text-amber-700">
                            Originally scheduled for {formatDate(event.original_date)}, now on {formatDate(event.date)}
                          </p>
                          {event.move_reason && (
                            <p className="text-xs text-amber-700 mt-0.5">Reason: {event.move_reason}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Event summary card */}
                    <div className="bg-white text-card-foreground border border-border rounded-lg">
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg capitalize font-medium">{event.title_name || "Event Title"}</h3>
                            </div>
                            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                              <MapPin className="h-4 w-4" />
                              {assetName}
                              {startedAgoText && ` - ${startedAgoText}`}
                            </p>
                          </div>
                          {role && role !== "public" && status === "APPROVED" && (
                            <div className="relative ml-2">
                              <button
                                onClick={() => setShowDotsMenu(prev => !prev)}
                                className="p-1.5 cursor-pointer rounded-lg hover:bg-gray-100 transition-colors focus:outline-none"
                                aria-label="More options"
                              >
                                <GripVertical className="h-5 w-5 text-gray-500" />
                              </button>
                              {showDotsMenu && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setShowDotsMenu(false)} />
                                  <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                                    <button
                                      onClick={() => { setShowDotsMenu(false); setShowMoveModal(true); }}
                                      className="flex cursor-pointer items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                                    >
                                      <MoveRight className="h-4 w-4" />
                                      Move Reservation
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-gray-200" />

                      <div className="p-6">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Date</p>
                            <p className="font-medium text-base">{formatDate(event.date)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Information Type</p>
                            <p className="font-medium capitalize text-base">{event.info_type}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Capacity</p>
                            <p className="font-medium text-base">{assetCapacity} people</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Category</p>
                            <p className="font-medium capitalize text-base">
                              {event.category === "other" && event.other_category ? event.other_category : event.category}
                            </p>
                          </div>
                          {assetAminities && assetAminities.length > 0 && (
                            <div className="col-span-1 md:col-span-2 lg:col-span-4">
                              <p className="text-sm text-gray-500 mb-2">Venue Facilities</p>
                              <div className="flex flex-wrap gap-2">
                                {assetAminities.map((facility, index) => (
                                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border border-gray-300 text-gray-800 bg-transparent">
                                    {facility}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Reservation details card */}
                    <div className="bg-white text-card-foreground border border-border rounded-lg">
                      <div className="p-6 flex items-center">
                        <NotebookPen className="text-gray-700 mr-2 h-5 w-5" />
                        <h3 className="text-lg font-medium text-gray-700">Reservation Details</h3>
                      </div>
                      <div className="border-t border-gray-200" />
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Reserved By</p>
                            <p className="font-medium text-base">{event.reserve_by_user || "Unknown User"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <div className="flex mt-1 items-center gap-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-md font-medium ${getStatusColor(status)}`}>
                                {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                              </span>
                              {status === "APPROVED" && event.approved_by_user_details && (
                                <span className="text-base text-gray-600">
                                  by: {event.approved_by_user_details.first_name} {event.approved_by_user_details.last_name}
                                </span>
                              )}
                              {status === "DECLINED" && event.declined_by_user_details && (
                                <span className="text-base text-gray-600">
                                  by: {event.declined_by_user_details.first_name} {event.declined_by_user_details.last_name}
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Day(s)</p>
                            <p className="font-medium text-base">{`${eventRange} ${eventRange === 1 ? "day" : "days"}`}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Deadline</p>
                            <p className="font-medium text-base">{formatDate(event.registration_deadline)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Time</p>
                            <p className="font-medium text-base">{`${formatTime(event.time_start)} - ${formatTime(event.time_end)}`}</p>
                          </div>
                          {event.people_tag && event.people_tag.length > 0 && (
                            <div className="md:col-span-2">
                              <p className="text-sm text-gray-500">People Tag</p>
                              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                                {event.people_tag.map((person, idx) => (
                                  <span key={idx} className="inline-flex items-center gap-1 text-base font-medium text-gray-800">
                                    <User className="w-3.5 h-3.5 text-gray-500" />
                                    {person}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Requestor card */}
                    {event.requestor && (
                      <div className="bg-white text-card-foreground border border-border rounded-lg">
                        <div className="p-6 flex items-center">
                          {event.requestor.type === 'student' && <Users className="text-blue-500 mr-2 h-5 w-5" />}
                          {event.requestor.type === 'faculty' && <GraduationCap className="text-green-500 mr-2 h-5 w-5" />}
                          {event.requestor.type === 'office' && <Building2 className="text-amber-500 mr-2 h-5 w-5" />}
                          <h3 className="text-lg font-medium text-gray-700">Requestor</h3>
                        </div>
                        <div className="border-t border-gray-200" />
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Type</p>
                            <p className="font-medium text-base capitalize">{event.requestor.type}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Category</p>
                            <p className="font-medium text-base">
                              {event.requestor.type === 'student' && (() => {
                                const labels: Record<string, string> = { student_org: 'Student Organization/Society', csg: 'College Student Government', lso: 'LSO', sgdc: 'SGDC' };
                                return labels[event.requestor!.student_sub_type ?? ''] ?? 'Student';
                              })()}
                              {event.requestor.type === 'faculty' && 'Faculty'}
                              {event.requestor.type === 'office' && 'Office'}
                            </p>
                          </div>
                          {event.requestor.type === 'student' && event.requestor.student_sub_type === 'student_org' && event.requestor.student_org_name && (
                            <div className="md:col-span-2">
                              <p className="text-sm text-gray-500">Organization / Society Name</p>
                              <p className="font-medium text-base">{event.requestor.student_org_name}</p>
                            </div>
                          )}
                          {event.requestor.type === 'student' && event.requestor.student_sub_type === 'csg' && event.requestor.csg_name && (
                            <div className="md:col-span-2">
                              <p className="text-sm text-gray-500">College Student Government Name</p>
                              <p className="font-medium text-base">{event.requestor.csg_name}</p>
                            </div>
                          )}
                          {(event.requestor.type === 'faculty' || event.requestor.type === 'office') && event.requestor.tagged && event.requestor.tagged.length > 0 && (
                            <div className="md:col-span-2">
                              <p className="text-sm text-gray-500">{event.requestor.type === 'faculty' ? 'Degree Course' : 'Office'}</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {event.requestor.tagged.map((item) => (
                                  <span key={item.id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                    {event.requestor!.type === 'faculty'
                                      ? <GraduationCap className="w-3.5 h-3.5 text-green-600" />
                                      : <Building2 className="w-3.5 h-3.5 text-amber-600" />}
                                    {item.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Equipment card */}
                    <div className="bg-white text-card-foreground border border-border rounded-lg">
                      <div className="p-6 flex items-center">
                        <Package className="text-gray-700 mr-2 h-5 w-5" />
                        <h3 className="text-lg font-medium text-gray-700">Equipment</h3>
                      </div>
                      <div className="border-t border-gray-200" />
                      <div className="p-6">
                        {event.equipment && event.equipment.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {event.equipment.map((item, idx) => (
                              <span key={idx} className="inline-flex items-center px-2.5 py-1.5 rounded-full text-sm font-medium bg-gray-100">
                                {item.name} × {item.quantity}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm">No equipment selected</p>
                        )}
                      </div>
                    </div>

                    {/* Signatories card */}
                    {showSignatoriesCard && (
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
                            <SignatoryRow label="Admin" approval={findApproval("admin")} />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Additional details card */}
                    <div className="bg-white text-card-foreground border border-border rounded-lg">
                      <div className="p-6 flex items-center">
                        <Info className="text-gray-700 mr-2 h-5 w-5" />
                        <h3 className="text-lg font-medium text-gray-700">Additional Details</h3>
                      </div>
                      <div className="border-t border-gray-200" />
                      <div className="p-6 space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Description</p>
                          <p className="mt-1 text-base">{event.description}</p>
                        </div>
                        {event.outsource && (
                          <div>
                            <p className="text-sm text-gray-500">Outsource</p>
                            <p className="mt-1 text-base">{event.outsource}</p>
                          </div>
                        )}
                        {event.guests && event.guests.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-500 mb-2">Guests</p>
                            <div className="flex flex-col gap-2">
                              {event.guests.map((guest, idx) => (
                                <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50">
                                  <User className="w-4 h-4 shrink-0 text-gray-500" />
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-800">{guest.name}</p>
                                    {guest.details && <p className="text-xs text-gray-500">{guest.details}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer — PENDING, Campus Director stage: Approve/Endorse + Decline */}
              {!loading && event && status === "PENDING" && isCdStage && (
                <div className="sticky bottom-0 bg-white z-10 p-4 sm:p-6 border-t border-gray-200 flex justify-center gap-3 rounded-b-xl">
                  <Button
                    onClick={() => setShowCdModal(true)}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 flex-1 px-6 py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    Approve / Endorse
                  </Button>
                  <Button
                    onClick={() => setShowDeclineConfirm(true)}
                    disabled={isDeclining}
                    className="inline-flex w-full cursor-pointer items-center justify-center flex-1 px-6 py-5 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle className="w-4 h-4" />
                    DECLINE
                  </Button>
                </div>
              )}

              {/* Footer — PENDING, non-CD approver: Approve + Decline */}
              {!loading && event && status === "PENDING" && role && role !== "public" && !isCdStage && (
                <div className="sticky bottom-0 bg-white z-10 p-4 sm:p-6 border-t border-gray-200 flex justify-center gap-3 rounded-b-xl">
                  <Button
                    onClick={() => setShowApproveConfirm(true)}
                    disabled={isApproving}
                    className="inline-flex w-full cursor-pointer items-center justify-center flex-1 px-6 py-5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isApproving ? (
                      <><span className="animate-spin"><svg className="h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg></span>APPROVING...</>
                    ) : (
                      <><CircleCheckBig className="w-4 h-4" />APPROVE</>
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowDeclineConfirm(true)}
                    disabled={isDeclining}
                    className="inline-flex w-full cursor-pointer items-center justify-center flex-1 px-6 py-5 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeclining ? (
                      <><span className="animate-spin"><svg className="h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg></span>DECLINING...</>
                    ) : (
                      <><XCircle className="w-4 h-4" />DECLINE</>
                    )}
                  </Button>
                </div>
              )}

              {/* Footer — DECLINED for submitter (Dean/HO): Edit & Resubmit */}
              {!loading && event && isSubmitterDeclined && (
                <div className="sticky bottom-0 bg-white z-10 p-4 sm:p-6 border-t border-gray-200 flex justify-center gap-3 rounded-b-xl">
                  <Button
                    onClick={() => onResubmit?.(event)}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 flex-1 px-6 py-5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Edit &amp; Resubmit
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        onConfirm={handleApproveConfirm}
        event={event}
        type="APPROVE"
      />

      <ConfirmationModal
        isOpen={showDeclineConfirm}
        onClose={() => setShowDeclineConfirm(false)}
        onConfirm={handleDeclineConfirm}
        event={event}
        type="DECLINE"
      />

      <CampusDirectorApprovalModal
        isOpen={showCdModal}
        onClose={() => setShowCdModal(false)}
        onConfirm={handleCdConfirm}
        event={event}
      />

      <MoveReservationModal
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        event={event}
        onMoved={onClose}
      />
    </>
  );
});
