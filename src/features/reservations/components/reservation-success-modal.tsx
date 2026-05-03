"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, ArrowRight } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface ReservationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReservationSuccessModal({ isOpen, onClose }: ReservationSuccessModalProps) {
  const [countdown, setCountdown] = useState(3);
  const router = useRouter();
  const pathname = usePathname();
  const role = pathname.split("/")[1];

  useEffect(() => {
    if (!isOpen) return;
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4"
      style={{ pointerEvents: isOpen ? "auto" : "none" }}
    >
      <motion.div
        className="absolute inset-0 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: isOpen ? 1 : 0, scale: isOpen ? 1 : 0.96 }}
        transition={{ type: "tween", duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
        style={{ pointerEvents: isOpen ? "auto" : "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center px-6 pt-8 pb-6 gap-3">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100">
            <BadgeCheck className="w-11 h-11 text-green-500" strokeWidth={1.5} />
          </div>

          <h2 className="text-xl font-bold text-gray-900 text-center leading-tight mt-1">
            Event Reservation Sent Successfully!
          </h2>

          <p className="text-sm text-gray-500 text-center leading-relaxed">
            Your request has been submitted. You will be notified once your admin reviews and approves it.
          </p>

          <button
            onClick={() => { onClose(); router.push(`/${role}/reservations`); }}
            disabled={countdown > 0}
            className="mt-3 w-full h-12 rounded-xl bg-gray-900 text-white font-semibold text-sm transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {countdown > 0 ? `Go to Reservations (${countdown})` : "Go to Reservations"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
