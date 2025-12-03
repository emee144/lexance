import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import Withdrawal from "@/models/Withdrawal";

export async function GET(req) {
  await connectDB();

  const user = await getCurrentUser(req);
  if (!user) return new Response(JSON.stringify([]), { status: 401 });

  const withdrawals = await Withdrawal.find({ user: user._id })
    .sort({ createdAt: -1 })
    .lean();

  return new Response(JSON.stringify(withdrawals), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
