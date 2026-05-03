"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { useUpdateMultimediaComment } from "@/features/calendar/services/reservation-service";
import { EventDetails } from "@/interface/user-props";
import toast from "react-hot-toast";

interface MultimediaCommentSectionProps {
  event: EventDetails;
}

export function MultimediaCommentSection({ event }: MultimediaCommentSectionProps) {
  const [comment, setComment] = useState(event.multimedia_comment ?? "");
  const { mutate: saveComment, isPending } = useUpdateMultimediaComment();

  const handleSave = () => {
    saveComment(
      { reservationId: event.id, comment },
      { onSuccess: () => toast.success("Equipment comment saved") },
    );
  };

  return (
    <div className="bg-white text-card-foreground border border-border rounded-lg">
      <div className="p-6">
        <h3 className="text-base font-medium text-gray-700 mb-3">Equipment Remarks</h3>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add equipment remarks or notes..."
          rows={4}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
          maxLength={2000}
        />
        <div className="flex justify-end mt-2">
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium rounded-md disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
