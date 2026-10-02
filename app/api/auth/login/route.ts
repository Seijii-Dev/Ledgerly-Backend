import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";
import { loginSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });

  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error || !data.user || !data.session) return NextResponse.json({ ok: false, message: "We couldn't match those details." }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("name, budget").eq("id", data.user.id).maybeSingle();
    return NextResponse.json({
      ok: true,
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      account: { id: data.user.id, name: profile?.name ?? data.user.user_metadata?.name ?? "", email: data.user.email ?? parsed.data.email, budget: Number(profile?.budget ?? 5000) },
    });
  } catch (err) {
    console.error("login error", err);
    return NextResponse.json({ ok: false, message: "Something went wrong. Please try again." }, { status: 500 });
  }
}
