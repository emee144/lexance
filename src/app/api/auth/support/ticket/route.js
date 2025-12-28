import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SupportTicket from "@/models/SupportTicket";

export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();
    const { name, email, subject, message } = body;
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: "Message too long (max 5000 characters)" },
        { status: 400 }
      );
    }

    const ticket = await SupportTicket.create({
      name,
      email,
      subject,
      message,
      status: "open",
      createdAt: new Date(),
    });

    const nodemailer = (await import("nodemailer")).default;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ADMIN_EMAIL,        
        pass: process.env.GMAIL_APP_PASSWORD, 
      },
    });

    await transporter.sendMail({
      from: `"Lexance Support" <${process.env.ADMIN_EMAIL}>`,
      to: process.env.ADMIN_EMAIL, 
      replyTo: email,            
      subject: `[New Ticket #${ticket._id}] ${subject}`,
      text: `
New support ticket from ${name} (${email})

Subject: ${subject}

Message:
${message}

Ticket ID: ${ticket._id}
Created: ${new Date().toLocaleString()}
      `.trim(),
      html: `
        <h2>New Support Ticket</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${message}</p>
        <hr>
        <p><strong>Ticket ID:</strong> ${ticket._id}</p>
        <p><strong>Created:</strong> ${new Date().toLocaleString()}</p>
      `,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thank you! Your ticket has been submitted. We'll reply within 24 hours.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Support ticket error:", error);
    return NextResponse.json(
      { error: "Failed to submit ticket. Please try again later." },
      { status: 500 }
    );
  }
}