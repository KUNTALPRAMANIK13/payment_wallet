import { Router } from "express";
import { validate } from "../middleware/validate.js";

import authmiddleware from "../middleware/authmiddleware.js";
import {
  transactions,
  balance,
  transfer,
} from "../controllers/accountController.js";
import { transferSchema } from "../schemas/index.js";
const router = Router();

// GET /api/transactions?userId=...
// Note: In real apps, protect with auth middleware and derive userId from token
router.get("/transactions", authmiddleware, transactions);
router.get("/balance", authmiddleware, balance);
// Transfer money: body { to: phone, amount: number }
router.post("/transfer", authmiddleware, validate(transferSchema), transfer);

export default router;
