import { db } from "@/app/firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req) {
  try {
    let { departments } = await req.json();

    if (!departments || departments.length === 0) {
      return NextResponse.json(
        { success: false, message: "Departments not provided" },
        { status: 400 },
      );
    }

    // Normalize departments
    if (!Array.isArray(departments)) {
      if (typeof departments === "object") {
        departments = Object.values(departments);
      } else {
        departments = [departments];
      }
    }

    const proposalsRef = collection(db, "Proposals");
    const proposalsSnap = await getDocs(proposalsRef);

    const proposals = [];
    proposalsSnap.forEach((doc) => {
      const data = doc.data();
      if (
        departments.includes(data.department) &&
        data?.currentReviewer?.level === 2
      ) {
        proposals.push({ id: doc.id, ...data });
      }
    });

    return NextResponse.json({ success: true, proposals });
  } catch (error) {
    console.error("Error fetching reviewer proposals:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
