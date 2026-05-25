"use client";

import EditProposalContent from "@/app/_components/ProposalPages/EditProposal";
import { useRouter, useParams } from "next/navigation";

export default function EditProposalPage() {
  const router = useRouter();
  const { id } = useParams();

  return (
    <div className="h-full max-h-full overflow-y-auto">
      <EditProposalContent
        proposalId={id}
        onBack={() => router.push("/user/proposals")}
      />
    </div>
  );
}
