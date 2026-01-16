"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PackagePlus } from "lucide-react";
import { AssetRegistrationModal } from "@/components/modal/asset-register-modal";
import { AssetRegistrationPayload } from "@/interface/user-props";

export default function AssetsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAssetSubmit = async (data: AssetRegistrationPayload) => {
    console.log("Asset submitted:", data);
    // TODO: Add API call here
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Assets Management</h1>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
        >
          <PackagePlus className="w-5 h-5" />
          Register Asset
        </Button>
      </div>

      <AssetRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAssetSubmit}
      />
    </div>
  );
}