import mongoose from "mongoose";
const SupportTicketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // Optional: link to user
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ["open", "in-progress", "resolved", "closed"],
    default: "open",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.SupportTicket ||
  mongoose.model("SupportTicket", SupportTicketSchema);