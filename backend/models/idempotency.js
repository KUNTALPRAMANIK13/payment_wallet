import mongoose, { Schema } from "mongoose";

const IdempotencyKeySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    key: { type: String, required: true },
    payloadDigest: { type: String, required: true },
    status: {
      type: String,
      enum: ["processing", "succeeded", "failed"],
      default: "processing",
    },
    referenceId: { type: String },
    error: { type: String },
  },
  { timestamps: true }
);

IdempotencyKeySchema.index({ userId: 1, key: 1 }, { unique: true });
// Auto-expire keys after 24 hours
IdempotencyKeySchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 }
);

export const IdempotencyKey = mongoose.model(
  "IdempotencyKey",
  IdempotencyKeySchema
);
export default IdempotencyKey;
