import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters").max(200),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const categories = ["Food", "Transport", "School", "Shopping", "Bills", "Fun", "Health", "Other"] as const;
export const payments = ["Cash", "GCash", "Card", "Bank"] as const;

export const expenseSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  category: z.enum(categories),
  payment: z.enum(payments),
  description: z.string().trim().min(1, "Description is required").max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});

export const budgetSchema = z.object({
  budget: z.number().finite().nonnegative("Budget cannot be negative"),
});
