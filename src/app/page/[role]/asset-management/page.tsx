"use client";

import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AssetRegistrationModal } from "@/components/modal/asset-register-modal";
import { AssetRegistrationPayload } from "@/interface/user-props";
import { AssetsTable } from "@/components/user-dashboard-ui/asset-management/asset-table";
import { 
  campusesQueryOptions, 
  officesQueryOptions 
} from "@/services/academicDataService";
import { useAssets, useCreateAsset, Asset } from "@/services/asset-service";
import { Search, Calendar, Filter, PackagePlus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loading from "../loading";

export default function AssetsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const queryClient = useQueryClient();

  // ✅ Prefetch data on mount
  useEffect(() => {
    queryClient.prefetchQuery(campusesQueryOptions);
    queryClient.prefetchQuery(officesQueryOptions);
  }, [queryClient]);

  const { assets, loading, error, refetch } = useAssets();
  const { mutateAsync: createAsset } = useCreateAsset();

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

  const handleAssetClick = (asset: Asset) => {
    console.log("Asset clicked:", asset);
  };

  return (
    <div className="flex flex-col w-full min-w-0">
      {loading && <Loading />}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Assets Management</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between mb-6 gap-y-4">
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

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2 h-11 px-4 bg-white cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            Date Range
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 h-11 px-4 bg-white cursor-pointer"
            onClick={() => refetch()}
          >
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 h-11 px-4 cursor-pointer"
          >
            <PackagePlus className="w-4 h-4" />
            Add new asset
          </Button>
        </div>
      </div>

      <AssetsTable
        assets={filteredAssets}
        role="admin"
        isLoading={loading}
        onAssetClick={handleAssetClick}
      />

      <AssetRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAssetSubmit}
      />
    </div>
  );
}