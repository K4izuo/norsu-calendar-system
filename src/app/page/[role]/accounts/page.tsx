"use client";

import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import { useParams } from "next/navigation";

export default function AccountsPage() {
  const params = useParams();
  const role = params.role as string;

  return (
    <div className="flex flex-col">
      {/* Breadcrumb */}
      <PageBreadcrumb
        items={[
          { label: "Dashboard", href: `/page/${role}/dashboard` },
          { label: "Accounts" }
        ]}
      />

      <div>User Accounts</div>
    </div>
  );
}