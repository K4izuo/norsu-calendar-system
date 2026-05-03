import React from "react";
import { Info, User } from "lucide-react";
import { EventDetails } from "@/interface/user-props";

interface AdditionalDetailsCardProps {
  event: EventDetails;
}

export function AdditionalDetailsCard({ event }: AdditionalDetailsCardProps) {
  return (
    <div className="bg-white text-card-foreground border border-border rounded-lg">
      <div className="p-6 flex items-center">
        <Info className="text-gray-700 mr-2 h-5 w-5" />
        <h3 className="text-lg font-medium text-gray-700">Additional Details</h3>
      </div>
      <div className="border-t border-gray-200" />
      <div className="p-6 space-y-4">
        <div>
          <p className="text-sm text-gray-500">Description</p>
          <p className="mt-1 text-base">{event.description}</p>
        </div>
        {event.outsource && (
          <div>
            <p className="text-sm text-gray-500">Outsource</p>
            <p className="mt-1 text-base">{event.outsource}</p>
          </div>
        )}
        {event.guests && event.guests.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 mb-2">Guests</p>
            <div className="flex flex-col gap-2">
              {event.guests.map((guest, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50">
                  <User className="w-4 h-4 shrink-0 text-gray-500" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">{guest.name}</p>
                    {guest.details && <p className="text-xs text-gray-500">{guest.details}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
