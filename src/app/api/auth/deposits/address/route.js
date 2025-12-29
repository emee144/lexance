import { NextResponse } from "next/server";
import DepositAddress from "@/models/DepositAddress";
import { connectDB } from "@/lib/mongodb";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;
function getUserFromCookie(request) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const tokenMatch = cookieHeader.match(/access_token=([^;]+)/);
  if (!tokenMatch) return null;

  const token = tokenMatch[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return { _id: payload.id };  
  } catch (err) {
    console.error("Invalid or expired token:", err.message);
    return null;
  }
}

export async function GET(request) {
  try {
    await connectDB();

    const user = getUserFromCookie(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const addresses = await DepositAddress.find({
      user: user._id,
    })
      .select("coin network address memo")
      .sort({ coin: 1, network: 1 })
      .lean();

    return NextResponse.json(addresses, { status: 200 });

  } catch (error) {
    console.error("Deposit address fetch error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}