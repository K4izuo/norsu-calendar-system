"use client";

import { Loader2, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface ModalFooterProps {
  activeTab: string;
  isSubmitting: boolean;
  isCheckingConflict: boolean;
  editMode: boolean;
  setActiveTab: (tab: string) => void;
  handleFormTabNext: () => void;
  handleEquipmentTabNext: () => void;
  handleAdditionalTabNext: () => void;
}

export function ModalFooter({ activeTab, isSubmitting, isCheckingConflict, editMode, setActiveTab, handleFormTabNext, handleEquipmentTabNext, handleAdditionalTabNext }: ModalFooterProps) {
  return (
    <div className="sticky bottom-0 bg-white z-10 p-4 sm:p-6 border-t border-gray-200 flex justify-end">
      {activeTab === "form" && (
        <Button
          type="button"
          onClick={handleFormTabNext}
          variant="default"
          className="text-base cursor-pointer py-2.5"
          disabled={isCheckingConflict} // ✅ Disable during conflict check
        >
          {isCheckingConflict ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking for conflicts...
            </div>
          ) : (
            <div className="flex items-center">
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          )}
        </Button>
      )}
      {activeTab === "equipment" && (
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={() => setActiveTab("form")}
            variant="outline"
            className="text-base cursor-pointer py-2.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            type="button"
            onClick={handleEquipmentTabNext}
            variant="default"
            className="text-base cursor-pointer py-2.5"
          >
            <div className="flex items-center">
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </Button>
        </div>
      )}
      {activeTab === "additional" && (
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={() => setActiveTab("equipment")}
            variant="outline"
            className="text-base cursor-pointer py-2.5"
            disabled={isSubmitting}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            type="button"
            onClick={handleAdditionalTabNext}
            variant="default"
            className="text-base cursor-pointer py-2.5"
          >
            <div className="flex items-center">
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </Button>
        </div>
      )}
      {activeTab === "summary" && (
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={() => setActiveTab("additional")}
            variant="outline"
            className="text-base cursor-pointer py-2.5"
            disabled={isSubmitting}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            type="submit"
            variant="default"
            disabled={isSubmitting}
            className="text-base cursor-pointer py-2.5"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <span className="animate-spin mr-2">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </span>
                Processing...
              </div>
            ) : (
              <div className="flex items-center">
                <Check className="w-4 h-4 mr-2" />
                {editMode ? "Update" : "Submit"}
              </div>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
