import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  console.log("Login request received");

  await connectDB();
  console.log("Connected to MongoDB");

  const { email, password } = await req.json();
  console.log("Request body:", { email, password: password ? "***" : null }); // hide password in logs

  if (!email || !password) {
    console.log("Missing email or password");
    return new Response(
      JSON.stringify({ error: "Email and password are required" }),
      { status: 400 }
    );
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found for email:", email);
      return new Response(
        JSON.stringify({ error: "Invalid email or password" }),
        { status: 401 }
      );
    }

    console.log("User found:", { email: user.email });

    // Use the model's comparePassword method
    const isMatch = await user.comparePassword(password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      console.log("Password does not match for user:", email);
      return new Response(
        JSON.stringify({ error: "Invalid email or password" }),
        { status: 401 }
      );
    }

    console.log("Login successful for user:", email);

    return new Response(
      JSON.stringify({ message: "Login successful" }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Server error during login:", err);
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500 }
    );
  }
}
