import { AccountUser } from "./types";

export function formatMemberSince(dateStr?: string): string {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function getFullName(user: AccountUser): string {
  const parts = [user.first_name, user.middle_name, user.last_name].filter(Boolean);
  return parts.join(" ") || "—";
}

export function InfoRow({
  icon: Icon,
  label,
  value,
  loading,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  loading?: boolean;
  badge?: "active";
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          {label}
        </span>
        {loading ? (
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mt-0.5" />
        ) : badge === "active" ? (
          <span className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            <span className="text-sm font-semibold text-gray-800">{value}</span>
          </span>
        ) : (
          <span className="text-sm font-semibold text-gray-800 truncate">{value}</span>
        )}
      </div>
    </div>
  );
}
