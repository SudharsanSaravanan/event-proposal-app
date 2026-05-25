import { db } from "@/app/firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

/**
 * Get proposals approved by a specific reviewer from reviewerHistory array
 */
export async function GET(_, { params }) {
  try {
    const p = await params;
    const reviewerId = p.id;
    if (!reviewerId) {
      return NextResponse.json(
        { success: false, message: "Reviewer ID missing" },
        { status: 400 },
      );
    }

    const proposalsRef = collection(db, "Proposals");
    const snapshot = await getDocs(proposalsRef);

    const approvedProposals = [];

    snapshot.forEach((docSnap) => {
      const proposalData = docSnap.data();
      const history = proposalData.reviewerHistory || [];

      const match = history.find(
        (entry) =>
          entry.reviewerId === reviewerId &&
          entry.decision?.toLowerCase() === "approved",
      );

      if (match) {
        approvedProposals.push({
          id: docSnap.id,
          title: proposalData.title,
          department: proposalData.department,
          decisionAt: match.reviewedAt,
          reviewerName: match.name,
          comment: match.comments,
          proposalStatus: proposalData.status || "unknown",
        });
      }
    });

    return NextResponse.json({ success: true, proposals: approvedProposals });
  } catch (error) {
    console.error("Error fetching reviewer history:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
