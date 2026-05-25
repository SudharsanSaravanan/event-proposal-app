import { db } from "@/app/firebase/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  // Note: Here the level is the level of reviewers you wish to find
  // whereas the department is the department of the reviewer (same as department of the proposer)
  // If department is not provided, then it is essential to provide the userId of proposer so that we can derive the department from it
  const levelParam = searchParams.get("level");
  const deptParam = searchParams.get("department");
  const userIdParam = searchParams.get("userId"); // Proposer ID

  if (!levelParam) {
    return NextResponse.json(
      { error: "Missing level parameter" },
      { status: 400 },
    );
  }

  const level = parseInt(levelParam);
  if (isNaN(level)) {
    return NextResponse.json(
      { error: "Level must be a number" },
      { status: 400 },
    );
  }

  try {
    let department = deptParam;

    // Infer department if userId is given and department is not
    if (!department && userIdParam) {
      const userSnap = await getDocs(
        query(collection(db, "Auth"), where("uid", "==", userIdParam)),
      );

      if (userSnap.empty) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const userData = userSnap.docs[0].data();
      department = userData.department;

      if (!department) {
        return NextResponse.json(
          { error: "User has no department info" },
          { status: 400 },
        );
      }
    }

    const baseQuery = query(
      collection(db, "Auth"),
      where("role", "==", "reviewer"),
      where("level", "==", level),
    );
    const reviewersSnap = await getDocs(baseQuery);
    let reviewers = reviewersSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Apply department filter only if department is known
    if (department) {
      reviewers = reviewers.filter((reviewer) => {
        const dept = reviewer.department;
        return (
          (typeof dept === "string" && dept === department) ||
          (Array.isArray(dept) && dept.includes(department))
        );
      });
    }

    return NextResponse.json(reviewers);
  } catch (error) {
    console.error("Error fetching reviewers:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviewers" },
      { status: 500 },
    );
  }
}
