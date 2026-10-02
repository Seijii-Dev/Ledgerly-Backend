import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { expenseSchema } from "@/lib/validation";

function serialize(row: any) {
  return {
    id: row.id,
    amount: Number(row.amount),
    category: row.category,
    payment: row.payment,
    description: row.description,
    date: row.date,
  };
}

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return NextResponse.json({ ok: false, message: "Not signed in." }, { status: 401 });

  try {
    const rows = await sql`
      SELECT id, amount, category, payment, description, date
      FROM expenses
      WHERE user_id = ${auth.userId}
      ORDER BY date DESC, created_at DESC
    `;
    return NextResponse.json({ ok: true, expenses: rows.map(serialize) });
  } catch (err) {
    console.error("expenses GET error", err);
    return NextResponse.json({ ok: false, message: "Couldn't load your expenses." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return NextResponse.json({ ok: false, message: "Not signed in." }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  const parsed = expenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const { amount, category, payment, description, date } = parsed.data;

  try {
    const rows = await sql`
      INSERT INTO expenses (user_id, amount, category, payment, description, date)
      VALUES (${auth.userId}, ${amount}, ${category}, ${payment}, ${description}, ${date})
      RETURNING id, amount, category, payment, description, date
    `;
    return NextResponse.json({ ok: true, expense: serialize(rows[0]) }, { status: 201 });
  } catch (err) {
    console.error("expenses POST error", err);
    return NextResponse.json({ ok: false, message: "Couldn't save that expense." }, { status: 500 });
  }
}
