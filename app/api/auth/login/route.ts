import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyPassword, signToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const { email, password } = parsed.data;

  try {
    const rows = await sql`SELECT id, name, email, password_hash, budget FROM users WHERE email = ${email}`;
    const user = rows[0];
    // Same generic error whether the email doesn't exist or the password is wrong —
    // avoids leaking which emails are registered.
    if (!user) {
      return NextResponse.json({ ok: false, message: "We couldn't match those details." }, { status: 401 });
    }
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ ok: false, message: "We couldn't match those details." }, { status: 401 });
    }

    const token = signToken({ userId: user.id, email: user.email });
    return NextResponse.json({
      ok: true,
      token,
      account: { id: user.id, name: user.name, email: user.email, budget: Number(user.budget) },
    });
  } catch (err) {
    console.error("login error", err);
    return NextResponse.json({ ok: false, message: "Something went wrong. Please try again." }, { status: 500 });
  }
}
