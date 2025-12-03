// utils/getCurrentUser.js (or wherever you keep it)
import jwt from "jsonwebtoken";
import User from "@/models/User";

export async function getCurrentUser(req) {
  try {
    // 1. Get the httpOnly cookie (no more Authorization header!)
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader) return null;

   
    const tokenMatch = cookieHeader.match(/access_token=([^;]+)/);
    if (!tokenMatch) return null;

    const token = tokenMatch[1];

    // 2. Verify JWT (same as before)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) return null;

    const user = await User.findById(decoded.id).lean();
    return user || null;

  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}