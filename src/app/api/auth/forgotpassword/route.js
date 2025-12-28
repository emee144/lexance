import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req) {
  await connectDB();

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { message: "If your email is registered, you will receive a reset link shortly." },
        { status: 200 }
      );
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ADMIN_EMAIL,        
        pass: process.env.GMAIL_APP_PASSWORD, 
      },
    });

    await transporter.sendMail({
      from: `"Lexance" <${process.env.ADMIN_EMAIL}>`,
      to: email,
      subject: "Lexance - Reset Your Password",
      text: `
Hello ${user.name || "User"},

You requested a password reset for your Lexance account.

Click the link below to reset your password (valid for 1 hour):

${resetLink}

If you didn't request this, please ignore this email.

— The Lexance Team
      `.trim(),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #1e40af;">Lexance Password Reset</h2>
          <p>Hello ${user.name || "there"},</p>
          <p>You requested a password reset for your Lexance account.</p>
          <p>Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
          </div>
          <p><small>This link expires in 1 hour.</small></p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">— The Lexance Team</p>
        </div>
      `,
    });

    return NextResponse.json(
      { message: "If your email is registered, you will receive a reset link shortly." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}