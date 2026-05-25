import { NextResponse } from "next/server";
import { getProposalsByUserId } from "../../../proposalService";
import { getProposalHistory } from "../../../proposalHistoryService";

export async function GET(request, { params }) {
  const { id: userId } = params;

  try {
    const proposals = await getProposalsByUserId(userId);

    const proposalsWithHistory = await Promise.all(
      proposals.map(async (proposal) => {
        const history = await getProposalHistory(proposal.id);

        let versionDetails = [];

        history.forEach((historyData) => {
          versionDetails.push({
            version: historyData.version || "1",
            timestamp: historyData.updatedAt,
            updatedBy: historyData.updatedBy || "System",
            status: historyData.proposalThread?.status || "Reviewed",
            remarks: historyData.remarks || "Proposal updated",
            comments: historyData.comments || [],
            ...historyData.proposalThread,
          });
        });

        // Add current version as the first item
        versionDetails.unshift({
          ...proposal,
          version: proposal.version || "1",
          timestamp: proposal.updatedAt || proposal.createdAt,
          updatedBy: proposal.updatedBy || "You",
          status: proposal.status,
          remarks: "Current version",
          comments: proposal.comments || [],
        });

        return {
          ...proposal,
          versionDetails: versionDetails,
        };
      }),
    );

    return NextResponse.json(proposalsWithHistory);
  } catch (error) {
    console.error(`Error fetching proposals for user ${userId}:`, error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch proposals" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
