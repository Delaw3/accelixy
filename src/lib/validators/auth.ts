import { z } from "zod";

export const registerSchema = z.object({
  firstname: z.string().trim().min(1, "First name is required"),
  lastname: z.string().trim().min(1, "Last name is required"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9._-]+$/, "Username contains invalid characters")
    .transform((value) => value.toLowerCase()),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .transform((value) => value.toLowerCase()),
  country: z.string().trim().min(1, "Country is required"),
  phone: z.string().trim().min(5, "Phone is required"),
  password: z
    .string()
    .min(6, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
  referralCode: z
    .string()
    .trim()
    .max(32, "Referral code is too long")
    .optional()
    .or(z.literal("")),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegisterInput = z.infer<typeof registerSchema>;
