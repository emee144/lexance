// models/P2POffer.js
import mongoose from "mongoose";

const P2POfferSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["buy", "sell"], required: true }, // sell = merchant wants NGN, gives USDT
  coin: { type: String, default: "USDT" },
  fiat: { type: String, default: "NGN" },
  price: { type: Number, required: true },        // e.g. 1620 NGN per USDT
  availableAmount: { type: Number, required: true }, // in USDT
  minOrder: { type: Number, default: 5000 },      // min NGN
  maxOrder: { type: Number, required: true },
  paymentMethods: [{ type: String }],             // ["Bank Transfer", "Opay"]
  completionTime: { type: String, default: "15 min" },
  isActive: { type: Boolean, default: true },
  completedOrders: { type: Number, default: 0 },
  completionRate: { type: Number, default: 100 }, // %
}, { timestamps: true });

P2POfferSchema.index({ type: 1, isActive: 1, coin: 1 });

export default mongoose.models.P2POffer || mongoose.model("P2POffer", P2POfferSchema);