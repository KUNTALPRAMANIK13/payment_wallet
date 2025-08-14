import "dotenv/config";
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI not set");
  process.exit(1);
}

const AccountSchema = new mongoose.Schema({
  walletBalance: Number,
  transactions: [{ amount: Number }],
});
const Account = mongoose.model("Account", AccountSchema, "accounts");

const toPaise = (v) => (typeof v === "number" ? Math.round(v * 100) : v);

(async () => {
  try {
    await mongoose.connect(uri);
    const cursor = Account.find({}).cursor();
    let updated = 0;
    for await (const doc of cursor) {
      const wb = doc.walletBalance || 0;
      // Skip if it already looks like paise (heuristic: large and divisible by 1)
      const newWb = toPaise(wb);
      const tx = (doc.transactions || []).map((t) => ({
        ...(t.toObject?.() ?? t),
        amount: toPaise(t.amount),
      }));
      await Account.updateOne(
        { _id: doc._id },
        { $set: { walletBalance: newWb, transactions: tx } }
      );
      updated += 1;
    }
    console.log(`Migration complete. Updated ${updated} accounts.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error("Migration failed:", e);
    process.exit(1);
  }
})();
