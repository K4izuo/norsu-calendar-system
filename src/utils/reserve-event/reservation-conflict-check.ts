import { ReservationWithRelations } from "@/interface/user-props";

interface ConflictCheckParams {
  assetId: number;
  date: string;
  timeStart: string;
  timeEnd: string;
  reservations: ReservationWithRelations[];
  excludeId?: number;
}

export interface ConflictingReservation {
  id: number;
  title_name: string;
  time_start: string;
  time_end: string;
  reserved_by_user: string;
  conflictType: 'start' | 'end' | 'both';
}

export const checkReservationConflicts = ({
  assetId,
  date,
  timeStart,
  timeEnd,
  reservations,
  excludeId
}: ConflictCheckParams): ConflictingReservation[] => {
  const normalizeTime = (time: string): string => {
    if (!time) return "00:00";
    const parts = time.split(":");
    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
  };

  const normalizeDate = (dateStr: string): string => {
    if (!dateStr) return "";
    
    // Extract date portion from ISO string or datetime string
    // This prevents timezone conversion issues
    const datePart = dateStr.split('T')[0].split(' ')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      return datePart;
    }
    
    // Fallback: parse as UTC to avoid timezone shifts
    const date = new Date(dateStr + 'T00:00:00Z');
    if (isNaN(date.getTime())) return "";
    
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const newStart = normalizeTime(timeStart);
  const newEnd = normalizeTime(timeEnd);
  const normalizedDate = normalizeDate(date);

  const relevantReservations = reservations.filter(r => {
    if (excludeId && r.id === excludeId) return false;

    const reservationDate = normalizeDate(r.date);

    if (r.asset_id !== assetId || reservationDate !== normalizedDate) return false;

    const status = r.status?.toUpperCase();
    return status === 'APPROVED';
  });

  const conflicts: ConflictingReservation[] = [];

  for (const reservation of relevantReservations) {
    const existingStart = normalizeTime(reservation.time_start);
    const existingEnd = normalizeTime(reservation.time_end);

    const startOverlaps = existingStart <= newStart && newStart < existingEnd;
    const endOverlaps = existingStart < newEnd && newEnd <= existingEnd;
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