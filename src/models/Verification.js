import mongoose from "mongoose";

const VerificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  idType: { type: String, required: true },
  idFront: { type: String }, 
  idBack: { type: String },
  selfie: { type: String },
  status: {
    type: String,
    enum: ["unverified", "pending", "verified", "rejected"],
    default: "unverified",
  },
  submittedAt: { type: Date },
  reviewedAt: { type: Date },
});

export default mongoose.models.Verification || mongoose.model("Verification", VerificationSchema);