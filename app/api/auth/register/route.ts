import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";
import { registerSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });

  const { name, email, password } = parsed.data;
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      const duplicate = /already registered|already exists/i.test(error.message);
      return NextResponse.json({ ok: false, message: duplicate ? "An account with this email already exists." : error.message }, { status: duplicate ? 409 : 400 });
    }
    if (!data.user) return NextResponse.json({ ok: false, message: "We couldn't create your account. Please try again." }, { status: 500 });

    const account = { id: data.user.id, name, email: data.user.email ?? email, budget: 5000 };
    return NextResponse.json({
      ok: true,
      token: data.session?.access_token ?? "",
      refreshToken: data.session?.refresh_token ?? "",
      requiresEmailConfirmation: !data.session,
      account,
    }, { status: 201 });
  } catch (err) {
    console.error("register error", err);
    return NextResponse.json({ ok: false, message: "We couldn't create your account. Please try again." }, { status: 500 });
  }
}
