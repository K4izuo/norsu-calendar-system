"use client";

import { Edit, CalendarDays, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface ModalHeaderProps {
  editMode: boolean;
  displayDate: string;
  onClose: () => void;
}

export function ModalHeader({ editMode, displayDate, onClose }: ModalHeaderProps) {
  return (
    <div className="sticky top-0 bg-white z-10 p-4 sm:p-6 pb-4 sm:pb-6 border-b border-gray-200">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            {editMode ? (
              <Edit
                strokeWidth={2.5}
                className="w-8 h-8 text-gray-800 shrink-0"
              />
            ) : (
              <CalendarDays
                strokeWidth={2.5}
                className="w-8 h-8 text-gray-800 shrink-0"
              />
            )}
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 leading-tight">
              {editMode ? "Update Reservation Form" : "Reservation Form"}
            </h2>
          </div>
          {displayDate && !editMode && (
            <span className="text-sm sm:text-base font-medium text-gray-600 ml-10">
              Date: {displayDate}
            </span>
          )}
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
  );
}
