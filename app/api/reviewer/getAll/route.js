import { db } from "@/app/firebase/firebase";
import { NextResponse } from "next/server";
import { getDocs, collection } from "firebase/firestore";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const dept = url.searchParams.get("dept");

    const authRef = collection(db, "Auth");
    const snapshot = await getDocs(authRef);

    const reviewers = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((user) => user.role === "Reviewer")
      .filter((user) => {
        if (!dept) return true;
        if (Array.isArray(user.department)) {
          return user.department.includes(dept);
        }
        return user.department === dept;
      });

    return NextResponse.json({ reviewers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching reviewers:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviewers" },
      { status: 500 },
    );
  }
}
