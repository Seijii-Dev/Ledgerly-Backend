import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const { name, email, password } = parsed.data;

  try {
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return NextResponse.json({ ok: false, message: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const rows = await sql`
      INSERT INTO users (name, email, password_hash)
      VALUES (${name}, ${email}, ${passwordHash})
      RETURNING id, name, email, budget
    `;
    const user = rows[0];
    const token = signToken({ userId: user.id, email: user.email });

    return NextResponse.json({
      ok: true,
      token,
      account: { id: user.id, name: user.name, email: user.email, budget: Number(user.budget) },
    });
  } catch (err) {
    console.error("register error", err);
    return NextResponse.json({ ok: false, message: "We couldn't create your account. Please try again." }, { status: 500 });
  }
}
