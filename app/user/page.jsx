"use client";

import DashboardContent from "@/app/_components/ProposalPages/Dashboard";
import { useRouter } from "next/navigation";

export default function UserPage() {
  const router = useRouter();

  const handleNavigate = (view) => {
    if (view === "view-proposals") {
      router.push("/user/proposals");
    } else if (view === "add-proposal") {
      router.push("/user/proposals/add");
    }
  };

  return <DashboardContent onNavigate={handleNavigate} />;
}
