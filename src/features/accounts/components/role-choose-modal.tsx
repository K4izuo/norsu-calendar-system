"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Briefcase, X, ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useModalBehavior } from "@/features/reservations/hooks/useModalBehavior";

interface RoleChooseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDean: () => void;
}

export function RoleChooseModal({ isOpen, onClose, onSelectDean }: RoleChooseModalProps) {
  useModalBehavior({ isOpen, onClose });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overscroll-none">
        <motion.div
          className="absolute inset-0 bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ type: "tween", duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-lg sm:mx-4 mx-px bg-white rounded-xl shadow-xl overflow-hidden flex flex-col"
          style={{
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
            transformOrigin: "center",
            willChange: "transform, opacity",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 p-4 sm:p-6 pb-4 sm:pb-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 leading-tight">
                  Add Account
                </h2>
                <span className="text-sm sm:text-base font-medium text-gray-500 mt-0.5">
                  Select a role to create a new account
                </span>
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                size="sm"
                className="p-2 shadow-none bg-white cursor-pointer rounded-full hover:bg-gray-100 transition-colors shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-500" />
              </Button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4">
            {/* Dean card */}
            <button
              type="button"
              onClick={onSelectDean}
              className="flex-1 flex flex-col items-center gap-3 rounded-xl border-2 border-blue-200 bg-blue-50 p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-100 transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                <GraduationCap className="w-7 h-7 text-blue-600" strokeWidth={2} />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-base font-semibold text-blue-800">Dean</span>
                <span className="text-xs text-blue-600 text-center">
                  College dean or department head
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-blue-600 group-hover:text-blue-700 mt-1">
                Select <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Staff card — disabled/coming soon */}
            <div className="flex-1 flex flex-col items-center gap-3 rounded-xl border-2 border-gray-200 bg-gray-50 p-6 opacity-50 cursor-not-allowed relative">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-purple-100">
                <Briefcase className="w-7 h-7 text-purple-500" strokeWidth={2} />
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-gray-700">Staff</span>
                  <span className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-500 leading-none">
                    Coming Soon
                  </span>
                </div>
                <span className="text-xs text-gray-500 text-center">
                  Administrative or support staff
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
