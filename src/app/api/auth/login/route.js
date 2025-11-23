import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(req) {
  await connectDB();
  
  const { email, password } = await req.json();

  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Email and password required" }), {
      status: 400,
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
      });
    }
    
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return new Response(JSON.stringify({ message: "Login successful", token }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
