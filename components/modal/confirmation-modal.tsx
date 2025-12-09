"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventDetails } from "@/interface/user-props";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  event?: EventDetails;
  type: "approve" | "decline";
};

const typeConfig = {
  approve: {
    icon: CheckCircle,
    iconColor: "text-emerald-500",
    title: "Approve Reservation",
    message: "Are you sure you want to approve this reservation?",
    confirmButton: "bg-emerald-600 hover:bg-emerald-500",
    confirmText: "Yes, Approve",
  },
  decline: {
    icon: AlertCircle,
    iconColor: "text-rose-500",
    title: "Decline Reservation",
    message: "Are you sure you want to decline this reservation?",
    confirmButton: "bg-rose-600 hover:bg-rose-500",
    confirmText: "Yes, Decline",
  },
};

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  event,
  type,
}) => {
  const config = typeConfig[type];
  const Icon = config.icon;
  const [countdown, setCountdown] = useState(3);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (isOpen) {
      setCountdown(3);
      setReason("");
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
  }, [isOpen]);

  const handleConfirm = () => {
    if (type === "decline") {
      onConfirm(reason);
    } else {
      onConfirm();
    }
    // onClose();
  };

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
            className="relative max-w-lg w-full bg-white rounded-lg shadow-xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Icon className={`${config.iconColor} h-5 w-5`} />
                <h2 className="text-lg font-semibold text-gray-800">{config.title}</h2>
              </div>
              <Button
                onClick={onClose}
                className="p-2 cursor-pointer shadow-none bg-white rounded-full hover:bg-gray-100 focus:outline-none"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </Button>
            </div>

            <div className="flex-1 p-6">
              <div className="space-y-4">
                <p className="text-gray-700 text-center text-base">{config.message}</p>

                {event && (
                  <div className="bg-gray-100 shadow-sm rounded-lg p-4">
                    <div className="mb-3">
                      <p className="text-sm text-gray-500">Event Title</p>
                      <p className="font-medium text-gray-800">{event.title_name}</p>
                    </div>
                    <div className="border-b border-gray-300 mb-4" />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Date</p>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="font-medium text-gray-900">{event.date}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Time</p>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="font-medium text-gray-900">
                            {event.time_start} - {event.time_end}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {type === "decline" && (
                  <div>
                    <Label
                      htmlFor="decline-reason"
                      className="inline-block text-sm font-medium text-gray-700 mb-1"
                    >
                      Reason for Declining (Optional)
                    </Label>
                    <Textarea
                      id="decline-reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Provide a reason for declining this reservation..."
                      className="w-full min-h-[120px] text-base border-2 rounded-lg focus:border-ring transition-all duration-150"
                      rows={4}
                    />
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={onClose}
                    className="flex-1 h-10 cursor-pointer py-2.5"
                  >
                    {/* <XCircle strokeWidth={2.5} className="w-5 h-5 text-gray-500" /> */}
                    Cancel
                  </Button>
                  {countdown > 0 ? (
                    <Button
                      disabled
                      className={`flex-1 h-10 ${config.confirmButton} cursor-not-allowed text-white py-2.5`}
                    >
                      {/* <Clock strokeWidth={2.5} className="w-5 h-5 text-white" /> */}
                      {config.confirmText} ({countdown})
                    </Button>
                  ) : (
                    <Button
                      onClick={handleConfirm}
                      className={`flex-1 h-10 ${config.confirmButton} cursor-pointer text-white py-2.5`}
                    >
                      {/* <CircleCheckBig strokeWidth={2.5} className="w-5 h-5 text-white" /> */}
                      {config.confirmText}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};