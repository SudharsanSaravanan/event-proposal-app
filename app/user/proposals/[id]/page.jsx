"use client";

import ProposalTrackingContent from "@/app/_components/ProposalPages/ProposalTracking";
import { useRouter, useParams } from "next/navigation";

export default function ViewProposalDetailsPage() {
  const router = useRouter();
  const { id } = useParams();

  return (
    <div className="h-full max-h-full overflow-y-auto">
      <ProposalTrackingContent
        proposalId={id}
        onBack={() => router.push("/user/proposals")}
      />
    </div>
  );
}
