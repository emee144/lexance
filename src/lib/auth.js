import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function getCurrentUser() {
  try {
    await connectDB();

    const cookieStore = await cookies(); 
    const token = cookieStore.get("access_token")?.value;
    if (!token) return null;

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not set");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) return null;

    const user = await User.findById(decoded.id).lean();
    return user || null;

  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}
