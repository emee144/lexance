import mongoose from "mongoose";
const withdrawalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  coin: { type: String, required: true },
  network: { type: String, required: true },
  amount: { type: Number, required: true },
  fee: { type: Number, required: true },
  netAmount: { type: Number, required: true },
  withdrawAddress: { type: String, required: true },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Withdrawal = mongoose.models.Withdrawal || mongoose.model("Withdrawal", withdrawalSchema);
export default Withdrawal;