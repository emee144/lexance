import jwt from "jsonwebtoken";
import User from "@/models/User";

export async function getCurrentUser(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;

    const token = authHeader.split(" ")[1];
    if (!token) return null;

    // Decode and verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) return null;

    // Fetch user from DB
    const user = await User.findById(decoded.id).lean();
    return user || null;
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null; 
  }
}
