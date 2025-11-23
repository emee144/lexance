import mongoose from "mongoose";

const P2POrderSchema = new mongoose.Schema({
  offer: { type: mongoose.Schema.Types.ObjectId, ref: "P2POffer", required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amountUSDT: { type: Number, required: true },
  amountNGN: { type: Number, required: true },
  price: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "paid", "released", "completed", "disputed", "cancelled"],
    default: "pending"
  },
  expiresAt: { type: Date },
}, { timestamps: true });

export default mongoose.models.P2POrder || mongoose.model("P2POrder", P2POrderSchema);