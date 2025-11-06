"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, X } from "lucide-react";
import { Button } from "../ui/button";

type TermsAndConditionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
  agreed?: boolean; // <-- Add this
  color?: "emerald" | "indigo" | "purple";
};

const colorMap = {
  emerald: {
    icon: "text-emerald-500",
    button: "bg-emerald-600 hover:bg-emerald-700",
    underline: "text-emerald-600",
  },
  indigo: {
    icon: "text-indigo-500",
    button: "bg-indigo-600 hover:bg-indigo-700",
    underline: "text-indigo-600",
  },
  purple: {
    icon: "text-purple-500",
    button: "bg-purple-500 hover:bg-purple-600",
    underline: "text-purple-500",
  },
};

export const TermsAndConditionModal: React.FC<TermsAndConditionModalProps> = ({
  isOpen,
  onClose,
  onAgree,
  agreed = false, // <-- Use prop
  color = "emerald",
}) => {
  const colors = colorMap[color] || colorMap.emerald;
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (isOpen && !agreed) {
      setCountdown(2);
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
    }
  }, [isOpen, agreed]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-1.5 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ type: "tween", duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-w-3xl w-full max-h-[80vh] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Info className={`${colors.icon} h-5 w-5`} />
                <h2 className="text-lg font-semibold text-gray-800">Terms & Conditions</h2>
              </div>
              <Button
                onClick={onClose}
                className="p-2 cursor-pointer shadow-none bg-white rounded-full hover:bg-gray-100 focus:outline-none"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </Button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-4 text-gray-700 text-base">
                <p>
                  By registering, you agree to abide by the university’s policies and procedures. Your personal information will be used solely for event management and will not be shared with third parties except as required by law.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>You confirm that all information provided is accurate and truthful.</li>
                  <li>You agree to follow all event rules and respect other participants.</li>
                  <li>Any violation may result in removal from the event and further disciplinary action.</li>
                  <li>For questions, contact the university administration.</li>
                </ul>
                <p>
                  Please read these terms carefully before proceeding. You must agree to continue registration.
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                {!agreed && countdown > 0 ? (
                  <Button
                    disabled
                    className={`${colors.button} cursor-not-allowed text-white px-6 py-2 rounded-md transition`}
                  >
                    Agree ({countdown})
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => {
                      onAgree();
                      onClose();
                    }}
                    className={`${colors.button} cursor-pointer text-white px-6 py-2 rounded-md transition`}
                  >
                    Agree
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};