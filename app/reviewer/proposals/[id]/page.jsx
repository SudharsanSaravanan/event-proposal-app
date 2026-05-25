"use client";

import ReviewerViewProposal from "@/app/_components/ReviewerPages/ReviewerViewProposal";
import { useRouter, useParams } from "next/navigation";

export default function ViewProposalDetailsPage() {
  const router = useRouter();
  const { id } = useParams();

  return (
    <div className="h-full max-h-full overflow-y-auto">
      <ReviewerViewProposal
        proposalId={id}
        onBack={() => router.push("/reviewer/proposals")}
      />
    </div>
  );
}
