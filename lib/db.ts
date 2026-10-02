import { neon } from "@neondatabase/serverless";

// DATABASE_URL is set in Vercel project settings (Neon integration adds it automatically).
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Add it in your Vercel project's Environment Variables.");
}

export const sql = neon(process.env.DATABASE_URL);
