import { startSession } from "mongoose";
import Account from "../models/account.js";
import User from "../models/user.js";
import IdempotencyKey from "../models/idempotency.js";
import crypto from "crypto";

// Money helpers: store in paise, expose rupees via API
const toPaise = (rupees) => Math.round(Number(rupees) * 100);
const fromPaise = (paise) => Number(paise) / 100;

export const transactions = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(400).json({ message: "userId is required" });
    const account = await Account.findOne({ userId }).lean();
    if (!account) return res.status(404).json({ message: "Account not found" });
    const transactions = (account.transactions ?? []).map((t) => ({
      ...t,
      amount: fromPaise(t.amount),
    }));
    return res.json({
      walletBalance: fromPaise(account.walletBalance),
      transactions,
    });
  } catch (err) {
    console.error("/api/transactions error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const balance = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(400).json({ message: "userId is required" });
    const account = await Account.findOne({ userId }).lean();
    if (!account) return res.status(404).json({ message: "Account not found" });
    return res.json({
      walletBalance: fromPaise(account.walletBalance),
    });
  } catch (err) {
    console.error("/api/balance error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const transfer = async (req, res) => {
  const session = await startSession();
  let idempKey;
  let userId;
  try {
    session.startTransaction();
    const { to, amount } = req.body; // validated by Zod (amount coerced to number, rupees)
    userId = req.userId;
    if (!to) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Receiver phone number is required" });
    }
    const amountPaise = toPaise(amount);

    // Idempotency: if client provides an Idempotency-Key, use it to ensure at-most-once
    idempKey = req.header("Idempotency-Key");
    if (idempKey) {
      const payloadDigest = crypto
        .createHash("sha256")
        .update(JSON.stringify({ userId, to, amountPaise }))
        .digest("hex");
      try {
        await IdempotencyKey.create(
          [{ userId, key: idempKey, payloadDigest, status: "processing" }],
          { session }
        );
      } catch (e) {
        const existing = await IdempotencyKey.findOne({
          userId,
          key: idempKey,
        }).session(session);
        if (existing) {
          if (existing.payloadDigest !== payloadDigest) {
            await session.abortTransaction();
            return res
              .status(409)
              .json({ message: "Idempotency key conflict: payload mismatch" });
          }
          if (existing.status === "succeeded" && existing.referenceId) {
            await session.abortTransaction();
            return res.status(200).json({
              message: "Transfer successful",
              referenceId: existing.referenceId,
              idempotent: true,
            });
          }
          if (existing.status === "processing") {
            await session.abortTransaction();
            return res
              .status(409)
              .json({ message: "Transfer already in progress" });
          }
          // failed -> allow retry with same key+same payload; set back to processing
          if (existing.status === "failed") {
            await IdempotencyKey.updateOne(
              { userId, key: idempKey },
              { $set: { status: "processing", error: undefined } }
            ).session(session);
          }
        }
      }
    }

    // Find sender and receiver accounts
    // Fetch sender (for phone in tx logs); don't rely on its balance for checks
    const senderAccount = await Account.findOne({ userId })
      .select("userId phone walletBalance __v")
      .session(session);
    const receiverAccount = await Account.findOne({ phone: to }).session(
      session
    );

    if (!senderAccount || !receiverAccount) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ message: "Sender or receiver account not found" });
    }

    if (String(senderAccount.userId) === String(receiverAccount.userId)) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Cannot transfer to self" });
    }

    const referenceId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    // Debit sender atomically only if balance is sufficient (prevents negatives)
    const debitRes = await Account.updateOne(
      { userId, walletBalance: { $gte: amountPaise }, __v: senderAccount.__v },
      {
        $inc: { walletBalance: -amountPaise, __v: 1 },
        $push: {
          transactions: {
            type: "debit",
            amount: amountPaise,
            to,
            date: new Date(),
            referenceId,
          },
        },
      },
      { runValidators: true }
    ).session(session);

    if (debitRes.modifiedCount !== 1) {
      // Determine whether it's insufficient funds or a version conflict
      const fresh = await Account.findOne({ userId })
        .select("walletBalance")
        .session(session);
      await session.abortTransaction();
      if (!fresh || fresh.walletBalance < amountPaise) {
        return res.status(400).json({ message: "Insufficient funds" });
      }
      return res
        .status(409)
        .json({ message: "Conflict: account modified, please retry" });
    }

    // Credit receiver and append transaction
    await Account.updateOne(
      { userId: receiverAccount.userId },
      {
        $inc: { walletBalance: amountPaise },
        $push: {
          transactions: {
            type: "credit",
            amount: amountPaise,
            from: senderAccount.phone,
            date: new Date(),
            referenceId,
          },
        },
      },
      { runValidators: true }
    ).session(session);

    // Mark idempotency success if used
    if (idempKey) {
      await IdempotencyKey.updateOne(
        { userId, key: idempKey },
        { $set: { status: "succeeded", referenceId } }
      ).session(session);
    }

    await session.commitTransaction();
    return res
      .status(200)
      .json({ message: "Transfer successful", referenceId });
  } catch (err) {
    console.error("/api/transfer error:", err);
    try {
      await session.abortTransaction();
    } catch {}
    // Attempt to mark idempotency failure
    try {
      if (idempKey) {
        await IdempotencyKey.updateOne(
          { userId: req.userId, key: idempKey },
          {
            $set: {
              status: "failed",
              error: err?.message?.toString() || "error",
            },
          }
        );
      }
    } catch {}
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    session.endSession();
  }
};
