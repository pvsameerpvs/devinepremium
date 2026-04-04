"use client";

import { useSearchParams } from "next/navigation";
import { StaffProfileDashboardPage } from "@/components/dashboard/pages/StaffProfileDashboardPage";

export default function AdminDashboardStaffProfilePage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") || "";
  const id = searchParams.get("id") || "";

  return <StaffProfileDashboardPage staffSlug={slug} staffId={id} />;
}
