"use client";

import { Boxes } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export default function AdminAssetsChart() {
  return (
    <div className="flex-1 flex flex-col rounded-md shadow-sm p-6 bg-white min-h-[180px]">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Boxes className="w-6 h-6 text-gray-800" />
          <h1 className="text-lg font-semibold text-gray-800">Assets Overview</h1>
        </div>
          <Select defaultValue="assets">
            <SelectTrigger className="w-[120px] cursor-pointer h-8 border-gray-300">
              <span className="flex items-center gap-2">
                <SelectValue placeholder="Select type" />
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="assets" className="cursor-pointer">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  Assets
                </span>
              </SelectItem>
              <SelectItem value="liabilities" className="cursor-pointer">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  Liabilities
                </span>
              </SelectItem>
              <SelectItem value="inventory" className="cursor-pointer">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  Inventory
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
      </div>
      {/* Chart goes here */}
    </div>
  );
}