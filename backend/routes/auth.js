import { Router } from "express";
import { validate } from "../middleware/validate.js";
import {
  signupSchema,
  signinSchema as loginSchema,
  userSearchSchema,
} from "../schemas/index.js";
import { signup, login, getUsers } from "../controllers/authController.js";
import authmiddleware from "../middleware/authmiddleware.js";
const router = Router();

// POST /api/signup
router.post("/signup", validate(signupSchema), signup);

// POST /api/login
router.post("/login", validate(loginSchema), login);

// GET /api/transactions?userId=...
// Note: In real apps, protect with auth middleware and derive userId from token
// GET /api/v1/users?name=... or ?phone=...
router.get(
  "/users",
  authmiddleware,
  validate(userSearchSchema, "query"),
  getUsers
);

export default router;
