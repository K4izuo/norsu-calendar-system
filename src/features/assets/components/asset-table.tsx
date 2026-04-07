"use client";

import React, { memo, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Asset } from "@/features/assets/services/asset-service"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu"
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ChevronDown,
} from "lucide-react"
import { TableSkeleton } from "@/shared/components/ui/skeleton"

interface AssetsTableProps {
  assets: Asset[];
  isLoading?: boolean;
  onAssetClick?: (asset: Asset) => void;
}

const ROWS_OPTIONS = [5, 10, 20, 25, 50];

const navBtnClass =
  "inline-flex items-center justify-center h-7 w-7 rounded border border-gray-200 bg-white text-gray-600 " +
  "hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors";

function PaginationBar({
  total,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: {
  total: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

  return (
    <div className="flex items-center justify-between px-2 py-2 shrink-0">
      <span className="text-xs text-gray-500">0 of {total} row(s) selected.</span>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Rows per page</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-1.5 rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300 cursor-pointer">
                {rowsPerPage}
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="min-w-15">
              {ROWS_OPTIONS.map((n) => (
                <DropdownMenuItem
                  key={n}
                  className={`cursor-pointer justify-center text-xs ${n === rowsPerPage ? "font-semibold" : ""}`}
                  onSelect={() => {
                    onRowsPerPageChange(n);
                    onPageChange(1);
                  }}
                >
                  {n}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <span className="text-xs text-gray-500">
          Page {page} of {totalPages}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button className={navBtnClass} onClick={() => onPageChange(1)} disabled={page === 1} aria-label="First page">
          <ChevronsLeft className="h-3.5 w-3.5" />
        </button>
        <button className={navBtnClass} onClick={() => onPageChange(page - 1)} disabled={page === 1} aria-label="Previous page">
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <button className={navBtnClass} onClick={() => onPageChange(page + 1)} disabled={page === totalPages} aria-label="Next page">
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <button className={navBtnClass} onClick={() => onPageChange(totalPages)} disabled={page === totalPages} aria-label="Last page">
          <ChevronsRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export const AssetsTable = memo(function AssetsTable({ assets, isLoading, onAssetClick }: AssetsTableProps) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const pagedAssets = assets.slice((page - 1) * rowsPerPage, page * rowsPerPage);

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

  if (isLoading && assets.length === 0) {
    return <TableSkeleton rows={5} />;
  }

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Table card — no internal scrollbar */}
      <div className="rounded-md text-card-foreground border shadow-xs overflow-x-auto">
        {assets.length === 0 ? (
          <div className="flex items-center justify-center py-20 bg-white">
            <div className="text-center">
              <p className="text-gray-500 text-lg">No assets found</p>
              <p className="text-gray-400 text-sm mt-2">Register your first asset to get started</p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-[#f1f2f4] hover:bg-gray-100">
                <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">Asset Name</TableHead>
                <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">Type</TableHead>
                <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">Location</TableHead>
                <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">Capacity</TableHead>
                <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">Status</TableHead>
                <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">Condition</TableHead>
                <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">Acquisition Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {pagedAssets.map((asset) => (
                <TableRow
                  key={asset.id}
                  onClick={() => onAssetClick?.(asset)}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="px-6 py-4 text-sm font-medium text-foreground">{asset.asset_name}</TableCell>
                  <TableCell className="px-6 py-4 text-sm text-foreground capitalize">{asset.asset_type}</TableCell>
                  <TableCell className="px-6 py-4 text-sm text-foreground">
                    {asset.location
                      ? asset.location.length > 30
                        ? `${asset.location.slice(0, 30)}...`
                        : asset.location
                      : "Not specified"}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-foreground">{asset.capacity}</TableCell>
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
                  <TableCell className="px-6 py-4 text-sm text-foreground">{formatDate(asset.acquisition_date)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination bar — below the table card */}
      {assets.length > 0 && (
        <PaginationBar
          total={assets.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
        />
      )}
    </div>
  );
})
