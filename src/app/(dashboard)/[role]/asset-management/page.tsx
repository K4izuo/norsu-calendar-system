"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { AssetRegistrationModal } from "@/features/assets/components/asset-register-modal";
import { AssetRegistrationPayload } from "@/interface/user-props";
import { AssetsTable } from "@/features/assets/components/asset-table";
import {
  campusesQueryOptions,
  officesQueryOptions
} from "@/features/calendar/services/academicDataService";
import { useAssets, useCreateAsset } from "@/features/assets/services/asset-service";
import { usePageReady } from "@/shared/components/context/page-loading-context";
import { Search, PackagePlus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { PageBreadcrumb } from "@/shared/components/ui/page-breadcrumb";
import { PageStatCard } from "@/shared/components/ui/page-stat-card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Package, CircleCheck, Activity, Wrench } from "lucide-react";
import { useParams } from "next/navigation";
import { getRouteParam } from "@/core/lib/route-params";

export default function AssetsPage() {
  const params = useParams();
  const role = getRouteParam(params, "role");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isPending, startTransition] = useTransition();

  const queryClient = useQueryClient();

  // Prefetch data on mount
  useEffect(() => {
    startTransition(() => {
      queryClient.prefetchQuery(campusesQueryOptions);
      queryClient.prefetchQuery(officesQueryOptions);
    });
  }, [queryClient]);

  // Data fetching - TanStack Query handles caching
  const { assets, error, loading, isFetching } = useAssets();
  usePageReady(loading, isFetching);
  const { mutateAsync: createAsset } = useCreateAsset();

  const totalAssets = assets.length;
  const available = assets.filter((a) => a.availability_status?.toUpperCase() === "AVAILABLE").length;
  const inUse = assets.filter((a) => a.availability_status?.toUpperCase() === "IN_USE").length;
  const maintenance = assets.filter((a) => a.availability_status?.toUpperCase() === "MAINTENANCE").length;

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch = asset.asset_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || asset.availability_status === statusFilter.toUpperCase();
      const matchesType = typeFilter === "all" || asset.asset_type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [assets, searchQuery, statusFilter, typeFilter]);

  const handleAssetSubmit = async (data: AssetRegistrationPayload) => {
    try {
      await createAsset(data);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create asset:", error);
    }
  };

  return (
    <div className="flex flex-col items-start self-stretch h-full">
      <PageBreadcrumb
        items={[
          { label: "Dashboard", href: `/${role}/dashboard` },
          { label: "Assets" },
        ]}
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 w-full">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="flex flex-col items-start gap-6 flex-1 self-stretch min-h-0">
        {loading && assets.length === 0 ? (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-27.5 w-full" />
            ))}
          </div>
        ) : (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PageStatCard title="Total Assets" value={totalAssets} subLabel="All registered assets" icon={Package} color="gray" />
            <PageStatCard title="Available" value={available} subLabel="Ready for reservation" icon={CircleCheck} color="green" />
            <PageStatCard title="In Use" value={inUse} subLabel="Currently occupied" icon={Activity} color="blue" />
            <PageStatCard title="Maintenance" value={maintenance} subLabel="Under maintenance" icon={Wrench} color="amber" />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-y-4 w-full">
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32.5 shadow-xs h-11 cursor-pointer bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className="cursor-pointer" value="all">All Status</SelectItem>
                <SelectItem className="cursor-pointer" value="available">Available</SelectItem>
                <SelectItem className="cursor-pointer" value="in_use">In Use</SelectItem>
                <SelectItem className="cursor-pointer" value="maintenance">Maintenance</SelectItem>
                <SelectItem className="cursor-pointer" value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32.5 shadow-xs h-11 cursor-pointer bg-white">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className="cursor-pointer" value="all">All Types</SelectItem>
                <SelectItem className="cursor-pointer" value="venue">Venue</SelectItem>
                <SelectItem className="cursor-pointer" value="vehicle">Vehicle</SelectItem>
                <SelectItem className="cursor-pointer" value="equipment">Equipment</SelectItem>
                <SelectItem className="cursor-pointer" value="facility">Facility</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white h-11 pr-4 py-2 w-64 border border-border rounded-md text-sm"
              />
            </div>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 h-11 px-4 cursor-pointer"
          >
            <PackagePlus className="w-4 h-4" />
            Add new asset
          </Button>
        </div>

        <div className="flex-1 min-h-0 w-full">
          <AssetsTable
            assets={filteredAssets}
            isLoading={loading || isPending}
          />
        </div>
      </div>

      <AssetRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAssetSubmit}
      />
    </div>
  );
}
