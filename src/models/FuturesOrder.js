import mongoose from "mongoose";

const FuturesOrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  pair: { type: String, default: "BTCUSDT" },
  side: { type: String, required: true }, 
  type: { type: String, default: "limit" },
  quantity: { type: Number, required: true },
  price: { type: Number },
  status: { type: String, default: "open" }, 
  filledQuantity: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.FuturesOrder || mongoose.model("FuturesOrder", FuturesOrderSchema);