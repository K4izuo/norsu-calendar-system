"use client";

import { motion } from "framer-motion";
import { CalendarClock } from "lucide-react";
import { getRoleColors, UserRole } from "@/utils/role-colors";
import { useParams } from "next/navigation";
import { useMemo } from "react";

export default function Loading() {
  const params = useParams();
  const role = (params?.role as UserRole) || "admin";
  const roleColors = useMemo(() => getRoleColors(role), [role]);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-50 bg-white"
    >
      <div className="relative h-16 w-16 flex items-center justify-center">
        <motion.div
          className={`absolute inset-0 h-16 w-16 rounded-full border-t-4 border-b-4 ${roleColors.spinner}`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
        />
        <CalendarClock className={`absolute inset-0 m-auto h-7 w-7 ${roleColors.icon}`} />
      </div>
    </motion.div>
  );
}
