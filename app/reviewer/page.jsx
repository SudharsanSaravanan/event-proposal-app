"use client";

import { useRouter } from "next/navigation";
import ReviewerDashboard from "../_components/ReviewerPages/ReviewerDashboard";

export default function ReviewerPage() {
  const router = useRouter();

  const handleNavigate = (view, proposalId = null) => {
    if (view === "view-proposals") {
      router.push("/reviewer/proposals");
    }
    if (view === "view-proposal-details" && proposalId) {
      router.push(`/reviewer/proposals/${proposalId}`);
    }
  };

  return <ReviewerDashboard onNavigate={handleNavigate} />;
}
