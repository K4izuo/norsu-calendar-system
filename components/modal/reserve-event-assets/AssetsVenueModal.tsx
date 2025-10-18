"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Asset {
  id: string;
  name: string;
  capacity: string;
  facilities?: string[];
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  onAssetSelect: (asset: Asset) => void;
  loading?: boolean; // add loading prop
}

export const AssetsVenueModal = React.memo(function AssetsVenueModal({
  isOpen,
  onClose,
  assets,
  onAssetSelect,
  loading = false, // default to false
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-1.5 sm:p-4 overscroll-none"
          onClick={onClose}
        >
          {/* Animated backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.25,
              ease: [0.22, 1, 0.36, 1],
            }}
          />

          {/* Modal content */}
          <motion.div
            ref={contentRef}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{
              type: "tween",
              duration: 0.25,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative max-w-[700px] max-h-[92vh] bg-white rounded-lg shadow-xl w-[94%] sm:w-full sm:mx-4 overflow-hidden"
            style={{
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
              transformOrigin: "center",
              willChange: "transform, opacity",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky header with title and X button */}
            <div className="sticky top-0 bg-white z-10 p-4 sm:p-6 pb-4 sm:pb-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                    Assets Venue Information
                  </h2>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="p-2 bg-white cursor-pointer rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </Button>
              </div>
            </div>

            <div
              className="overflow-y-auto custom-scrollbar p-4 sm:p-6 pt-4 sm:pt-6"
              style={{ maxHeight: "calc(80vh - 85px)" }}
            >
              {loading ? (
                <motion.div
                  className="flex items-center justify-center py-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative h-16 w-16 flex items-center justify-center">
                    <motion.div
                      className="absolute inset-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-blue-500"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1.5,
                        ease: "linear",
                        repeat: Infinity,
                      }}
                    />
                    <CalendarClock className="absolute inset-0 m-auto h-7 w-7 text-blue-500" />
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {assets.length === 0 ? (
                    <div className="text-center text-gray-500">
                      No venue assets available.
                    </div>
                  ) : (
                    assets.map((asset) => (
                      <button
                        key={asset.id}
                        type="button"
                        className="w-full text-left bg-gray-50 shadow-sm rounded-lg p-4 mb-4 hover:bg-blue-50 transition"
                        onClick={() => {
                          onAssetSelect(asset);
                          onClose();
                        }}
                      >
                        <div className="flex items-center mb-3">
                          <MapPin className="text-gray-500 mr-2 h-5 w-5" />
                          <h3 className="text-md font-medium text-gray-700">
                            {asset.name}
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Capacity</p>
                            <p className="font-medium">
                              {asset.capacity || "N/A"}
                            </p>
                          </div>
                          {asset.facilities && (
                            <div>
                              <p className="text-sm text-gray-500">Facilities</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {asset.facilities.map((facility, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {facility}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});