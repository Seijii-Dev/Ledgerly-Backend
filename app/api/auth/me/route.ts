import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return NextResponse.json({ ok: false, message: "Not signed in." }, { status: 401 });

  try {
    const rows = await sql`SELECT id, name, email, budget FROM users WHERE id = ${auth.userId}`;
    const user = rows[0];
    if (!user) return NextResponse.json({ ok: false, message: "Account no longer exists." }, { status: 401 });

    return NextResponse.json({
      ok: true,
      account: { id: user.id, name: user.name, email: user.email, budget: Number(user.budget) },
    });
  } catch (err) {
    console.error("me error", err);
    return NextResponse.json({ ok: false, message: "Something went wrong." }, { status: 500 });
  }
}
