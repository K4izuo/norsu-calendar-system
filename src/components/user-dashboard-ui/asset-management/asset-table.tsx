"use client";

// import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarClock } from "lucide-react"
import { motion } from "framer-motion";
import { UserRole } from "@/utils/role-colors"
import { Asset } from "@/services/asset-service"

const getRoleLoadingColors = (role: UserRole) => {
  const colorMap = {
    dean: {
      spinner: "border-blue-500",
      icon: "text-blue-500",
    },
    staff: {
      spinner: "border-purple-500",
      icon: "text-purple-500",
    },
    admin: {
      spinner: "border-gray-800",
      icon: "text-gray-800",
    },
    public: {
      spinner: "border-teal-500",
      icon: "text-teal-500",
    },
  };

  return colorMap[role || "public"];
};

interface AssetsTableProps {
  assets: Asset[];
  isLoading?: boolean;
  role: UserRole;
  onAssetClick?: (asset: Asset) => void;
}

export function AssetsTable({ assets, isLoading = false, role, onAssetClick }: AssetsTableProps) {
  const roleLoadingColors = getRoleLoadingColors(role);

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800'; // ← Add this check
    const statusUpper = status.toUpperCase();
    if (statusUpper === 'AVAILABLE') return 'bg-green-100 text-green-800';
    if (statusUpper === 'IN_USE') return 'bg-blue-100 text-blue-800';
    if (statusUpper === 'MAINTENANCE') return 'bg-yellow-100 text-yellow-800';
    if (statusUpper === 'UNAVAILABLE') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getConditionColor = (condition: string) => {
    if (!condition) return 'text-gray-600'; // ← Add this check too
    const conditionLower = condition.toLowerCase();
    if (conditionLower === 'excellent') return 'text-green-600';
    if (conditionLower === 'good') return 'text-blue-600';
    if (conditionLower === 'fair') return 'text-yellow-600';
    if (conditionLower === 'poor') return 'text-orange-600';
    if (conditionLower === 'needs_repair') return 'text-red-600';
    return 'text-gray-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full rounded-md">
      <div className="rounded-md text-card-foreground border shadow overflow-hidden">
        {isLoading ? (
          <motion.div
            className="flex items-center justify-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative h-16 w-16 flex items-center justify-center">
              <motion.div
                className={`absolute inset-0 h-16 w-16 rounded-full border-t-4 border-b-4 ${roleLoadingColors.spinner}`}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1.5,
                  ease: "linear",
                  repeat: Infinity,
                }}
              />
              <CalendarClock className={`absolute inset-0 m-auto h-7 w-7 ${roleLoadingColors.icon}`} />
            </div>
          </motion.div>
        ) : assets.length === 0 ? (
          <div className="flex items-center justify-center py-20 bg-white">
            <div className="text-center">
              <p className="text-gray-500 text-lg">No assets found</p>
              <p className="text-gray-400 text-sm mt-2">Register your first asset to get started</p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f1f2f4] hover:bg-gray-100">
                <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">
                  Asset Name
                </TableHead>
                <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">
                  Type
                </TableHead>
                <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">
                  Location
                </TableHead>
                <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">
                  Capacity
                </TableHead>
                <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">
                  Status
                </TableHead>
                <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">
                  Condition
                </TableHead>
                <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">
                  Acquisition Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {assets.map((asset) => (
                <TableRow
                  key={asset.id}
                  onClick={() => onAssetClick?.(asset)}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="px-6 py-4 text-sm font-medium text-foreground">
                    {asset.asset_name}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-foreground capitalize">
                    {asset.asset_type}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-foreground">
                    {asset.location}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-foreground">
                    {asset.capacity}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-foreground">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(asset.availability_status)}`}>
                      {asset.availability_status?.replace('_', ' ') || 'Unknown'}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm font-medium capitalize">
                    <span className={getConditionColor(asset.condition)}>
                      {asset.condition?.replace('_', ' ') || 'Unknown'}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-foreground">
                    {formatDate(asset.acquisition_date)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}