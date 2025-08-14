import { z } from "zod";

export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number");

export const emailSchema = z.string().email().optional().nullable();

export const signupSchema = z.object({
  name: z.string().min(1).max(100),
  phone: phoneSchema,
  email: emailSchema,
  password: z.string().min(8),
});

export const signinSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(8),
});

export const transferSchema = z.object({
  to: phoneSchema,
  // Rupees, allow up to 2 decimal places; controllers convert to paise
  amount: z.coerce
    .number()
    .positive()
    .refine((n) => Number.isFinite(n) && Math.round(n * 100) === n * 100, {
      message: "Amount must have at most 2 decimal places",
    }),
});

// Search users by name (partial, case-insensitive) or phone (exact 10-digit)
export const userSearchSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/i, "Invalid Indian mobile number")
      .optional(),
  })
  .refine((d) => d.name || d.phone, {
    message: "Provide either name or phone",
    path: ["name"],
  });
