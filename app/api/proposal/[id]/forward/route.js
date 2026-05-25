import { db } from "@/app/firebase/firebase";
import { forwardProposalSchema } from "@/schemas/proposal.schema";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { NextResponse } from "next/server";

// POST /api/proposal/[id]/forward
export async function POST(req, { params }) {
  const proposalId = params.id;
  try {
    const body = await req.json();
    console.log("Body", body);
    const parseResult = forwardProposalSchema.safeParse(body);
    console.log("Parsed Body", parseResult);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.flatten() },
        { status: 400 },
      );
    }
    const { decision, comments, nextReviewer, currentReviewer } =
      parseResult.data;

    if (!proposalId || !decision || !nextReviewer) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (decision != "approved" && decision != "rejected") {
      return NextResponse.json(
        { error: "Decision can only be approved or rejected" },
        { status: 400 },
      );
    }

    const proposalRef = doc(db, "Proposals", proposalId);
    const proposalSnap = await getDoc(proposalRef);

    if (!proposalSnap.exists()) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 },
      );
    }

    const proposalData = proposalSnap.data();
    const prevReviewer = proposalData.currentReviewer;

    console.log("CC", prevReviewer);

    console.log("Current Reviewer", currentReviewer);

    const { reviewerId, name, email } = currentReviewer || {};
    if (!reviewerId || !name || !email) {
      return NextResponse.json(
        { error: "Invalid currentReviewer data" },
        { status: 400 },
      );
    }

    if (!currentReviewer) {
      return NextResponse.json(
        { error: "Current reviewer info missing in proposal" },
        { status: 400 },
      );
    }
    console.log("##########", comments);

    const historyEntry = {
      reviewerId,
      name,
      email,
      level: currentReviewer.level,
      decision,
      comments: comments,
      reviewedAt: new Date(),
    };

    console.log(historyEntry);

    await updateDoc(proposalRef, {
      reviewerHistory: arrayUnion(historyEntry),
      currentReviewer: { ...nextReviewer },
      updatedAt: serverTimestamp(),
      ...(nextReviewer.level >= 3 &&
        decision == "approved" && { status: "approved" }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error forwarding proposal:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
