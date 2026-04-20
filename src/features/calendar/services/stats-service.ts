import { useQuery } from "@tanstack/react-query";
import { fetchReservations } from "./reservation-service";

export type AboutStats = {
  eventsScheduled: string;
  eventsFinished: string;
  holidays: string;
  unscheduledDays: string;
};

const computeStats = (reservations: Awaited<ReturnType<typeof fetchReservations>>): AboutStats => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Events Scheduled — total reservations in the system
  const eventsScheduled = reservations.length;

  // Events Finished — APPROVED reservations
  const eventsFinished = reservations.filter((r) => r.status === "APPROVED").length;

  // Holidays — events whose category or info_type contains "holiday"
  const holidays = reservations.filter((r) => {
    const cat = (r.category ?? "").toLowerCase();
    const info = (r.info_type ?? "").toLowerCase();
    return cat.includes("holiday") || info.includes("holiday");
  }).length;

  // Unscheduled Days — days in the current month that have no scheduled event
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const scheduledDates = new Set(
    reservations
      .filter((r) => {
        const d = new Date(r.date);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .map((r) => new Date(r.date).getDate()),
  );
  const unscheduledDays = daysInMonth - scheduledDates.size;

  const fmt = (n: number) => (n >= 100 ? `${Math.floor(n / 10) * 10}+` : String(n));

  return {
    eventsScheduled: fmt(eventsScheduled),
    eventsFinished: fmt(eventsFinished),
    holidays: String(holidays),
    unscheduledDays: String(unscheduledDays),
  };
};

export const useAboutStats = () => {
  const { data, isFetching, error } = useQuery({
    queryKey: ["public-reservations"],
    queryFn: fetchReservations,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
    select: computeStats,
  });

  return {
    stats: data ?? null,
    loading: isFetching,
    error: error?.message ?? null,
  };
};
