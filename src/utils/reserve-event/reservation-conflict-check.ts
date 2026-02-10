import { ReservationWithRelations } from "@/interface/user-props";

interface ConflictCheckParams {
  assetId: number;
  date: string; // YYYY-MM-DD format
  timeStart: string; // HH:mm format
  timeEnd: string; // HH:mm format
  reservations: ReservationWithRelations[];
  excludeId?: number; // For edit mode, exclude the current reservation
}

export interface ConflictingReservation {
  id: number;
  title_name: string;
  time_start: string;
  time_end: string;
  reserved_by_user: string;
  conflictType: 'start' | 'end' | 'both';
}

/**
 * Two-step conflict checking as per boss requirements:
 * Check 1: Does the START TIME overlap with any approved events on the same date and venue?
 * Check 2: If Check 1 passes, does the END TIME overlap with any approved events on the same date and venue?
 * 
 * @returns Array of conflicting reservations with conflict type
 */
export const checkReservationConflicts = ({
  assetId,
  date,
  timeStart,
  timeEnd,
  reservations,
  excludeId
}: ConflictCheckParams): ConflictingReservation[] => {
  // Normalize time format to HH:mm for comparison
  const normalizeTime = (time: string): string => {
    if (!time) return "00:00";
    // Remove seconds if present (HH:mm:ss -> HH:mm)
    const parts = time.split(":");
    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
  };

  // ✅ NEW: Normalize date to YYYY-MM-DD format (remove time if present)
  const normalizeDate = (dateStr: string): string => {
    if (!dateStr) return "";
    // Extract just YYYY-MM-DD part (remove time if present)
    return dateStr.split('T')[0].split(' ')[0];
  };

  const newStart = normalizeTime(timeStart);
  const newEnd = normalizeTime(timeEnd);
  const normalizedDate = normalizeDate(date); // ✅ Normalize the input date

  // Filter to get only relevant reservations (same date, same venue, approved status)
  const relevantReservations = reservations.filter(r => {
    // Skip if it's the same reservation (edit mode)
    if (excludeId && r.id === excludeId) return false;

    // ✅ CRITICAL FIX: Normalize reservation date before comparison
    const reservationDate = normalizeDate(r.date);

    // Must be same asset (venue) and date
    if (r.asset_id !== assetId || reservationDate !== normalizedDate) return false;

    // Only check APPROVED reservations (not PENDING or DECLINED)
    const status = r.status?.toUpperCase();
    return status === 'APPROVED';
  });

  const conflicts: ConflictingReservation[] = [];

  for (const reservation of relevantReservations) {
    const existingStart = normalizeTime(reservation.time_start);
    const existingEnd = normalizeTime(reservation.time_end);

    // CHECK 1: Does the START TIME of the new event overlap with this approved event?
    // Start time overlaps if: existingStart <= newStart < existingEnd
    const startOverlaps = existingStart <= newStart && newStart < existingEnd;

    // CHECK 2: Does the END TIME of the new event overlap with this approved event?
    // End time overlaps if: existingStart < newEnd <= existingEnd
    const endOverlaps = existingStart < newEnd && newEnd <= existingEnd;

    // ADDITIONAL CHECK: Does the new event completely contain the existing event?
    // This happens when: newStart <= existingStart && newEnd >= existingEnd
    const completelyContains = newStart <= existingStart && newEnd >= existingEnd;

    if (startOverlaps || endOverlaps || completelyContains) {
      let conflictType: 'start' | 'end' | 'both';

      if (completelyContains) {
        conflictType = 'both';
      } else if (startOverlaps && endOverlaps) {
        conflictType = 'both';
      } else if (startOverlaps) {
        conflictType = 'start';
      } else {
        conflictType = 'end';
      }

      conflicts.push({
        id: reservation.id,
        title_name: reservation.title_name,
        time_start: reservation.time_start,
        time_end: reservation.time_end,
        reserved_by_user: reservation.reserved_by_user
          ? `${reservation.reserved_by_user.first_name} ${reservation.reserved_by_user.last_name}`
          : "Unknown User",
        conflictType
      });
    }
  }

  return conflicts;
};