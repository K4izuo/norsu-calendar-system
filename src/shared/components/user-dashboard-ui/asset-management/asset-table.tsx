"use client";

import React, { memo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Asset } from "@/features/assets/services/asset-service"

interface AssetsTableProps {
  assets: Asset[];
  isLoading?: boolean;
  onAssetClick?: (asset: Asset) => void;
}

export const AssetsTable = memo(function AssetsTable({ assets, onAssetClick }: AssetsTableProps) {
  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    const statusUpper = status.toUpperCase();
    if (statusUpper === 'AVAILABLE') return 'bg-green-100 text-green-800';
    if (statusUpper === 'IN_USE') return 'bg-blue-100 text-blue-800';
    if (statusUpper === 'MAINTENANCE') return 'bg-yellow-100 text-yellow-800';
    if (statusUpper === 'UNAVAILABLE') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getConditionColor = (condition: string) => {
    if (!condition) return 'text-gray-600';
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
      <div className="rounded-md text-card-foreground border shadow overflow-hidden overflow-x-auto">
        {assets.length === 0 ? (
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
                    {asset.location
                      ? asset.location.length > 30
                        ? `${asset.location.slice(0, 30)}...`
                        : asset.location
                      : "Not specified"}
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
})
