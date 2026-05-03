import React from "react";
import { Package } from "lucide-react";
import { EventDetails } from "@/interface/user-props";

interface EquipmentCardProps {
  equipment: EventDetails["equipment"];
}

export function EquipmentCard({ equipment }: EquipmentCardProps) {
  return (
    <div className="bg-white text-card-foreground border border-border rounded-lg">
      <div className="p-6 flex items-center">
        <Package className="text-gray-700 mr-2 h-5 w-5" />
        <h3 className="text-lg font-medium text-gray-700">Equipment</h3>
      </div>
      <div className="border-t border-gray-200" />
      <div className="p-6">
        {equipment && equipment.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {equipment.map((item, idx) => (
              <span key={idx} className="inline-flex items-center px-2.5 py-1.5 rounded-full text-sm font-medium bg-gray-100">
                {item.name} × {item.quantity}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No equipment selected</p>
        )}
      </div>
    </div>
  );
}
