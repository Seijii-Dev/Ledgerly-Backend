import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";
import { googleTokenSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }
  const parsed = googleTokenSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Google sign-in token is required." }, { status: 400 });

  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: parsed.data.idToken,
    });
    if (error || !data.user || !data.session) {
      console.error("google sign-in error", error);
      return NextResponse.json({ ok: false, message: "Google sign-in could not be completed." }, { status: 401 });
    }

    const sessionClient = createSupabaseClient(data.session.access_token);
    const { data: profile } = await sessionClient.from("profiles").select("name, budget").eq("id", data.user.id).maybeSingle();
    return NextResponse.json({
      ok: true,
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      account: {
        id: data.user.id,
        name: profile?.name ?? data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? "",
        email: data.user.email ?? "",
        budget: Number(profile?.budget ?? 5000),
      },
    });
  } catch (err) {
    console.error("google sign-in exception", err);
    return NextResponse.json({ ok: false, message: "Google sign-in could not be completed." }, { status: 500 });
  }
}
