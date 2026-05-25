import { NextRequest, NextResponse } from "next/server";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  addDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/app/firebase/firebase";

/**
 * Update proposal status and manage history entries
 */
export async function PUT(req, { params }) {
  const { id: proposalId } = await params;
  const { newStatus, remarks, userId } = await req.json();

  try {
    const proposalRef = doc(db, "Proposals", proposalId);
    const proposalSnap = await getDoc(proposalRef);

    if (!proposalSnap.exists()) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 },
      );
    }

    const proposalData = proposalSnap.data();
    let newVersion = proposalData.version || 1;

    // Check if the new status is different from the current status, if so,
    // Add the proposal to history and clear the comments and replies.
    if (
      newStatus.toLowerCase() === "reviewed" &&
      proposalData.status?.toLowerCase() !== "reviewed"
    ) {
      newVersion += 1;

      const currentComments = proposalData.comments || [];
      const currentReplies = proposalData.replies || [];

      if (currentComments.length > 0 || currentReplies.length > 0) {
        await addDoc(collection(db, "Proposals", proposalId, "History"), {
          version: proposalData.version || 1,
          comments: currentComments,
          replies: currentReplies,
          updatedAt: serverTimestamp(),
          updatedBy: userId,
        });
      }

      await updateDoc(proposalRef, {
        comments: [],
        replies: [],
      });
    }

    // Update the proposal status and version.
    await updateDoc(proposalRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
      version: newVersion,
      comments: [
        ...(proposalData.comments || []),
        {
          text: remarks || `Status updated to ${newStatus}`,
          reviewerName:
            proposalData.currentReviewer.level === 2
              ? "TCW"
              : (proposalData.currentReviewer.email ?? ""),
          timestamp: new Date().toISOString(),
          status: newStatus,
        },
      ],
    });

    if (newStatus.toLowerCase() !== "reviewed") {
      const proposalForHistory = { ...proposalData };
      delete proposalForHistory.status;
      delete proposalForHistory.version;

      const historyQuery = query(
        collection(db, "Proposals", proposalId, "History"),
        where("version", "==", newVersion),
      );
      const historySnapshot = await getDocs(historyQuery);

      if (!historySnapshot.empty) {
        const historyDoc = historySnapshot.docs[0];
        await updateDoc(
          doc(db, "Proposals", proposalId, "History", historyDoc.id),
          {
            proposalThread: proposalForHistory,
            updatedAt: serverTimestamp(),
            remarks: remarks || `Status updated to ${newStatus}`,
          },
        );
      } else {
        await addDoc(collection(db, "Proposals", proposalId, "History"), {
          proposalThread: proposalForHistory,
          updatedAt: serverTimestamp(),
          remarks: remarks || `Status updated to ${newStatus}`,
          version: newVersion,
          updatedBy: userId,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 },
    );
  }
}
