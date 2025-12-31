import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import Verification from "@/models/Verification"; 

export async function GET(request) {
  await connectDB();

  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const verification = await Verification.findOne({ user: user._id }).lean();

    if (!verification) {
      return NextResponse.json(
        { status: "unverified" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        status: verification.status, 
        submittedAt: verification.submittedAt,
        reviewedAt: verification.reviewedAt || null,
        idType: verification.idType || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verification status error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}