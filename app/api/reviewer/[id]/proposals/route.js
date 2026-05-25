import { NextRequest, NextResponse } from "next/server";
import {
  collection,
  query,
  where,
  getDocs,
  or,
  collectionGroup,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/app/firebase/firebase";

export async function GET(_, { params }) {
  try {
    const { id: reviewerId } = await params;

    if (!reviewerId) {
      return NextResponse.json(
        { success: false, message: "Reviewer ID is required" },
        { status: 400 },
      );
    }

    // Fetch reviewer data.
    const reviewerRef = doc(db, "Auth", reviewerId);
    const reviewerSnap = await getDoc(reviewerRef);
    const reviewerData = reviewerSnap.data();

    if (reviewerData.level === 2) {
      const proposalsRef = collection(db, "Proposals");
      const q = query(
        proposalsRef,
        where("department", "in", reviewerData.department),
      );
      const snapshot = await getDocs(q);
      const proposals = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return NextResponse.json({ success: true, uniqueProposals: proposals });
    }

    // Query all proposals where currentReviewer.reviewerId == reviewerId
    const proposalsRef = collection(db, "Proposals");

    const q = query(
      proposalsRef,
      where("currentReviewer.reviewerId", "==", reviewerId),
    );
    const snapshot = await getDocs(q);

    const proposals = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Check subcollections for history.
    const q2 = query(
      collectionGroup(db, "History"),
      where("proposalThread.currentReviewer.reviewerId", "==", reviewerId),
    );
    const snapshot2 = await getDocs(q2);
    const history = snapshot2.docs.map((doc) => ({
      id: doc.id,
      ...doc.data().proposalThread,
    }));

    // Collect unique id from history.
    const uniqueIds = new Set();
    history.forEach((item) => {
      uniqueIds.add(item.id);
    });

    // Fetch the latest version of the proposal with doc id.
    // use getDoc to fetch the latest version of the proposal.
    const latestProposals = await Promise.all(
      Array.from(uniqueIds).map(async (id) => {
        const docRef = doc(db, "Proposals", id);
        const docSnap = await getDoc(docRef);
        const data = docSnap.data();
        data.id = docSnap.id;

        if (data) {
          const reviewerData = data.reviewerHistory.find(
            (item) => item.reviewerId === reviewerId,
          );
          if (reviewerData) {
            data.status = reviewerData.decision;
          }
        }

        return data;
      }),
    );

    // Merge proposals and history.
    const allProposals = [...proposals, ...latestProposals];

    // Remove duplicates.
    const uniqueProposals = allProposals.filter(
      (proposal, index, self) =>
        index === self.findIndex((t) => t.id === proposal.id),
    );

    return NextResponse.json({
      success: true,
      uniqueProposals: uniqueProposals,
    });
  } catch (error) {
    console.error("Error fetching proposals for reviewer:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch proposals" },
      { status: 500 },
    );
  }
}
