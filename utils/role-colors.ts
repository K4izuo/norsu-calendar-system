// Role type definition
export type UserRole = "dean" | "staff" | "admin" | "public";

// Color mapping function - Defaults to public
export const getRoleColors = (role?: UserRole) => {
  const colorMap = {
    public: {
      spinner: "border-teal-500",
      icon: "text-teal-500",
      todayText: "text-teal-600",
      todayBorder: "border-teal-500",
      badgeColor: "bg-teal-50",
      eventDayBg: "bg-teal-50",
      eventDayBorder: "border-teal-300",
      hoverBg: "hover:bg-teal-50",
      activeBg: "active:bg-teal-100",
    },
    dean: {
      spinner: "border-blue-500",
      icon: "text-blue-500",
      todayText: "text-blue-600",
      todayBorder: "border-blue-500",
      badgeColor: "bg-blue-50",
      eventDayBg: "bg-blue-50",
      eventDayBorder: "border-blue-300",
      hoverBg: "hover:bg-blue-50",
      activeBg: "active:bg-blue-100",
    },
    staff: {
      spinner: "border-purple-500",
      icon: "text-purple-500",
      todayText: "text-purple-600",
      todayBorder: "border-purple-500",
      badgeColor: "bg-purple-50",
      eventDayBg: "bg-purple-50",
      eventDayBorder: "border-purple-300",
      hoverBg: "hover:bg-purple-50",
      activeBg: "active:bg-purple-100",
    },
    admin: {
      spinner: "border-gray-800",
      icon: "text-gray-800",
      todayText: "text-gray-800",
      todayBorder: "border-gray-800",
      badgeColor: "bg-gray-100",
      eventDayBg: "bg-gray-100",
      eventDayBorder: "border-gray-400",
      hoverBg: "hover:bg-gray-100",
      activeBg: "active:bg-gray-100",
    },
  };

  return colorMap[role || "public"]; // Default to public colors if role is undefined
};