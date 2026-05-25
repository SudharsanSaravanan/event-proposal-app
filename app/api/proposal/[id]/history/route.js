import { NextRequest, NextResponse } from "next/server";
import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/app/firebase/firebase";
import { getProposalById } from "../../../proposalService";
import { getProposalHistory } from "../../../proposalHistoryService";

/**
 * Get proposal history
 */
export async function GET(request, { params }) {
  const { id: proposalId } = await params;

  try {
    const proposal = await getProposalById(proposalId);

    if (!proposal) {
      return new NextResponse(JSON.stringify({ error: "Proposal not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

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

    const proposalWithHistory = {
      ...proposal,
      versionDetails: versionDetails,
    };

    return NextResponse.json(proposalWithHistory);
  } catch (error) {
    console.error(`Error fetching proposal ${proposalId}:`, error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch proposal" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

/**
 * Add an entry to the proposal history
 */
export async function POST(req, { params }) {
  const proposalId = await params.id;
  try {
    const body = await req.json();
    const { userId, ...historyData } = body;

    if (historyData.proposalThread) {
      delete historyData.proposalThread.status;
      delete historyData.proposalThread.version;
    }

    await addDoc(collection(db, "Proposals", proposalId, "History"), {
      ...historyData,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
      timestamp: serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding history:", error);
    return NextResponse.json(
      { error: "Failed to add history" },
      { status: 500 },
    );
  }
}

/**
 * Create or update a history entry when updating a proposal
 */
export async function PUT(req, { params }) {
  const proposalId = await params.id;
  const { proposalData, version } = await req.json();

  try {
    const proposalForHistory = { ...proposalData };
    delete proposalForHistory.status;
    delete proposalForHistory.version;

    const historyQuery = query(
      collection(db, "Proposals", proposalId, "History"),
      where("version", "==", version),
    );

    const historySnapshot = await getDocs(historyQuery);

    if (!historySnapshot.empty) {
      const historyDoc = historySnapshot.docs[0];
      await updateDoc(
        doc(db, "Proposals", proposalId, "History", historyDoc.id),
        {
          proposalThread: proposalForHistory,
          updatedAt: serverTimestamp(),
          remarks: "Proposal updated",
        },
      );
    } else {
      await addDoc(collection(db, "Proposals", proposalId, "History"), {
        proposalThread: proposalForHistory,
        updatedAt: serverTimestamp(),
        remarks: "Proposal updated",
        version,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating history:", error);
    return NextResponse.json(
      { error: "Failed to update history" },
      { status: 500 },
    );
  }
}
