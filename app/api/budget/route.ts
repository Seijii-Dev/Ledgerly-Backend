import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { budgetSchema } from "@/lib/validation";

export async function PUT(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return NextResponse.json({ ok: false, message: "Not signed in." }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  const parsed = budgetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  try {
    await sql`UPDATE users SET budget = ${parsed.data.budget} WHERE id = ${auth.userId}`;
    return NextResponse.json({ ok: true, budget: parsed.data.budget });
  } catch (err) {
    console.error("budget PUT error", err);
    return NextResponse.json({ ok: false, message: "Couldn't update your budget." }, { status: 500 });
  }
}
