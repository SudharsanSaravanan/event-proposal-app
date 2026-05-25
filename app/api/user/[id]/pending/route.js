import { NextRequest, NextResponse } from "next/server";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase/firebase";

export async function GET(_, { params }) {
  try {
    const { id: userId } = await params;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID required" },
        { status: 400 },
      );
    }

    const q = query(
      collection(db, "Proposals"),
      where("proposerId", "==", userId),
      where("status", "in", ["Pending", "pending"]),
    );
    const snapshot = await getDocs(q);

    const proposals = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json({ success: true, proposals });
  } catch (error) {
    console.error("Error fetching pending proposals:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
