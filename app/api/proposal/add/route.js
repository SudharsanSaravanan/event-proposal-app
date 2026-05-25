import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/app/firebase/firebase";
import { createProposalSchema } from "@/schemas/proposal.schema";

export async function POST(req) {
  try {
    const json = await req.json();
    const validatedData = createProposalSchema.parse(json);

    const { id, currentReviewer, ...dataToStore } = validatedData;

    if (!currentReviewer || !currentReviewer.reviewerId) {
      return NextResponse.json(
        { error: "Missing current reviewer information" },
        { status: 400 },
      );
    }

    const enrichedProposal = {
      ...dataToStore,
      version: 1,
      currentReviewer, // level of reviewer can be inferred from currentReviewer information
      reviewerHistory: [],
      comments: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "Proposals"), enrichedProposal);

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error("Error adding proposal:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
