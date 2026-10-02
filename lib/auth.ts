import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set. Add it in your Vercel project's Environment Variables.");
}

export type TokenPayload = { userId: string; email: string };

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload) {
  // Token is long-lived (90 days) since this is a personal finance app on trusted personal devices,
  // not a high-security banking app. Adjust if you want shorter sessions.
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: "90d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET!) as TokenPayload;
  } catch {
    return null;
  }
}

// Extracts and verifies the Bearer token from an incoming request.
// Returns the authenticated user's payload, or null if missing/invalid.
export function getAuthUser(req: NextRequest): TokenPayload | null {
  const header = req.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  if (!token) return null;
  return verifyToken(token);
}
