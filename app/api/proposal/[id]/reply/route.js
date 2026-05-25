import { NextResponse } from "next/server";
import { addProposalReply } from "../../../proposalService";

export async function POST(request, { params }) {
  const { id: proposalId } = await params;
  const replyData = await request.json();

  try {
    const result = await addProposalReply(proposalId, replyData);

    if (result === true) {
      return NextResponse.json({ message: "Reply added successfully" });
    } else {
      return new NextResponse(
        JSON.stringify({ error: result.error || "Failed to add reply" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  } catch (error) {
    console.error(`Error adding reply to proposal ${proposalId}:`, error);
    return new NextResponse(JSON.stringify({ error: "Failed to add reply" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
