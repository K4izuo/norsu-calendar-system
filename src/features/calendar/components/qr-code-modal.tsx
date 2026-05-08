"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, X, Download } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import QRCode from "react-qr-code";
import { EventDetails } from "@/interface/user-props";

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventDetails;
  baseUrl: string;
}

export function QrCodeModal({ isOpen, onClose, event, baseUrl }: QrCodeModalProps) {
  const eventUrl = `${baseUrl}/?eventId=${event.id}`;

  const handleDownload = () => {
    const svg = document.getElementById("event-qr-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = 300;
    canvas.height = 300;

    img.onload = () => {
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 300, 300);
      ctx.drawImage(img, 0, 0, 300, 300);
      const link = document.createElement("a");
      link.download = `qr-${event.title_name.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "tween", duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <QrCode className="text-gray-800 h-5 w-5" strokeWidth={2.5} />
                <h2 className="text-lg font-semibold text-gray-800">Event QR Code</h2>
              </div>
              <Button
                onClick={onClose}
                className="p-2 cursor-pointer shadow-none bg-white rounded-full hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-600" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col items-center gap-4">
              <p className="text-sm text-gray-500 text-center">
                Scan to view <span className="font-medium text-gray-700">{event.title_name}</span> on the NORSU Calendar
              </p>

              <div className="p-4 bg-white border-2 border-gray-200 rounded-xl">
                <QRCode
                  id="event-qr-svg"
                  value={eventUrl}
                  size={220}
                  bgColor="#ffffff"
                  fgColor="#1a1a1a"
                  level="M"
                />
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={onClose}
              >
                Close
              </Button>
              <Button
                onClick={handleDownload}
                className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-white inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
