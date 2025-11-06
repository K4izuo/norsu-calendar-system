// Role type definition
export type UserRole = "student" | "faculty" | "staff" | "admin";

// Color mapping function - Updated to handle undefined role
export const getRoleColors = (role?: UserRole) => {
  const colorMap = {
    student: {
      spinner: "border-green-500",
      icon: "text-green-500",
      todayText: "text-green-600",
      todayBorder: "border-green-500",
      badgeColor: "bg-green-50",
      eventDayBg: "bg-green-50",
      eventDayBorder: "border-green-300",
      hoverBg: "hover:bg-green-50",
      activeBg: "active:bg-green-100",
    },
    faculty: {
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
      badgeColor: "bg-gray-50",
      eventDayBg: "bg-gray-100",
      eventDayBorder: "border-gray-400",
      hoverBg: "hover:bg-gray-50",
      activeBg: "active:bg-gray-100",
    },
  };

  return colorMap[role || "student"]; // Default to student colors if role is undefined
};