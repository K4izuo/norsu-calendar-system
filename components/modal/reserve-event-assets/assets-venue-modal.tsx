"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPinned, X, CalendarClock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRoleColors, UserRole } from "@/utils/role-colors";

interface Asset {
  id: number;
  asset_name: string;
  capacity: number;
  asset_type: string;
  location: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  onAssetSelect: (asset: Asset) => void;
  loading?: boolean;
  role?: UserRole;
}

export const AssetsVenueModal = React.memo(function AssetsVenueModal({
  isOpen,
  onClose,
  assets,
  onAssetSelect,
  loading = false,
  role,
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const roleColors = useMemo(() => getRoleColors(role), [role]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-1.5 sm:p-4 overscroll-none">
        <motion.div
          className="absolute inset-0 bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.25,
            ease: [0.22, 1, 0.36, 1]
          }}
        />

        <motion.div
          ref={contentRef}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{
            type: "tween",
            duration: 0.25,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="relative max-w-[700px] max-h-[92vh] bg-white rounded-lg shadow-xl w-[94%] sm:w-xl sm:mx-4 overflow-hidden flex flex-col"
          style={{
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
            transformOrigin: "center",
            willChange: "transform, opacity",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white z-10 p-4 sm:p-6 pb-4 sm:pb-6 border-b border-gray-200 shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                  Assets Venue Information
                </h2>
              </div>
              <Button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="p-2 bg-white cursor-pointer rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </Button>
            </div>
          </div>

          <div className="overflow-y-auto custom-scrollbar p-4 sm:p-6 pt-4 sm:pt-6 flex-1 min-h-0 max-h-[65vh]">
            {loading ? (
              <motion.div
                className="flex items-center justify-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
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
            ) : (
              <div className="space-y-6">
                {assets.length === 0 ? (
                  <div className="text-center text-gray-500 text-base">
                    No venue assets available.
                  </div>
                ) : (
                  assets.map((asset) => (
                    <Button
                      key={asset.id}
                      type="button"
                      variant="ghost"
                      className={`w-full border border-gray-100 cursor-pointer text-left bg-gray-50 shadow-sm rounded-lg p-5 mb-4 ${roleColors.hoverBg} transition h-auto justify-start`}
                      onClick={() => { onAssetSelect(asset); onClose(); }}
                    >
                      <div className="w-full">
                        <div className="flex items-center mb-3">
                          <MapPinned className="text-gray-500 mr-2 h-5 w-5" />
                          {/^https?:\/\//.test(asset.location) ? (
                            <a
                              href={asset.location}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-lg font-medium text-gray-700 hover:underline transition"
                              onClick={e => e.stopPropagation()} // Prevent modal close on link click
                            >
                              {asset.asset_name}
                            </a>
                          ) : (
                            <span className="text-lg font-medium text-gray-700">
                              {asset.asset_name}
                            </span>
                          )}
                        </div>
                        <div className="border-b border-gray-300 mb-5" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-base text-gray-500 flex items-center gap-1">
                              <Users className="w-4 h-4 mr-1 text-gray-500" />
                              Capacity
                            </p>
                            <p className="font-medium text-base">
                              {asset.capacity ? `${asset.capacity} seats` : "N/A"}
                            </p>
                          </div>
                          {/* <div>
                            <p className="text-base text-gray-500 flex items-center gap-1">
                              <MapPinned className="w-4 h-4 mr-1 text-gray-500" />
                              Location
                            </p>
                            <p className="font-medium text-base">
                              {asset.location || "N/A"}
                            </p>
                          </div> */}
                          {/* {asset.facilities && (
                            <div>
                              <p className="text-base text-gray-500">Facilities</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {asset.facilities.map((facility, idx) => (
                                  <span
                                    key={idx}
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${roleColors.badgeColor} ${roleColors.todayText}`}
                                  >
                                    {facility}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )} */}
                        </div>
                      </div>
                    </Button>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});