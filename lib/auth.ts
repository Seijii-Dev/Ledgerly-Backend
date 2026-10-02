import { NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createSupabaseClient } from "./supabase";

export type AuthContext = {
  user: User;
  token: string;
  client: ReturnType<typeof createSupabaseClient>;
};

export async function getAuthContext(req: NextRequest): Promise<AuthContext | null> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  if (!token) return null;

  try {
    const client = createSupabaseClient(token);
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) return null;
    return { user: data.user, token, client };
  } catch {
    return null;
  }
}
