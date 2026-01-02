import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  pair: {
    type: String,
    required: true,
    default: "BTC/USDT",
  },
  side: {
    type: String,
    enum: ["buy", "sell"],
    required: true,
  },
  type: {
    type: String,
    enum: ["market", "limit"],
    default: "market",
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["filled", "pending", "cancelled"],
    default: "filled",
  },
  filledAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);