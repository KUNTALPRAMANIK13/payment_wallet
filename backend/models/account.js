import mongoose, { Schema } from "mongoose";

// Monetary values are stored as integer paise to avoid floating point issues.
// API inputs/outputs remain in rupees; controllers convert at the boundary.
const AccountSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  phone: { type: String, required: true, unique: true },
  // Non-negative integer (paise)
  walletBalance: {
    type: Number,
    default: 0,
    min: 0,
    validate: {
      validator: Number.isInteger,
      message: "walletBalance must be an integer (paise)",
    },
  },
  transactions: [
    {
      type: { type: String, enum: ["credit", "debit"], required: true },
      // Positive integer (paise)
      amount: {
        type: Number,
        required: true,
        min: 1,
        validate: {
          validator: Number.isInteger,
          message: "transaction amount must be an integer (paise)",
        },
      },
      to: { type: String },
      from: { type: String },
      date: { type: Date, default: Date.now },
      referenceId: {
        type: String,
        default: () => `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      },
    },
  ],
});

AccountSchema.index({ userId: 1 });

export const Account = mongoose.model("Account", AccountSchema);
export default Account;
