"use client";

import { PageBreadcrumb } from "@/shared/components/ui/page-breadcrumb";
import { useParams } from "next/navigation";

export default function ProfilePage() {
  const params = useParams();
  const role = params.role as string;

  return (
    <div className="flex flex-col">
      {/* Breadcrumb */}
      <PageBreadcrumb
        items={[
          { label: "Dashboard", href: `/${role}/dashboard` },
          { label: "Profile" },
        ]}
      />

      <div>Profile</div>
    </div>
  );
}
