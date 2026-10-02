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

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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
    // The WHERE clause scopes to user_id so one account can never edit another account's expense,
    // even if it guesses a valid expense id.
    const rows = await sql`
      UPDATE expenses
      SET amount = ${amount}, category = ${category}, payment = ${payment},
          description = ${description}, date = ${date}, updated_at = now()
      WHERE id = ${params.id} AND user_id = ${auth.userId}
      RETURNING id, amount, category, payment, description, date
    `;
    if (rows.length === 0) {
      return NextResponse.json({ ok: false, message: "Expense not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, expense: serialize(rows[0]) });
  } catch (err) {
    console.error("expenses PUT error", err);
    return NextResponse.json({ ok: false, message: "Couldn't update that expense." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthUser(req);
  if (!auth) return NextResponse.json({ ok: false, message: "Not signed in." }, { status: 401 });

  try {
    const rows = await sql`
      DELETE FROM expenses WHERE id = ${params.id} AND user_id = ${auth.userId} RETURNING id
    `;
    if (rows.length === 0) {
      return NextResponse.json({ ok: false, message: "Expense not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("expenses DELETE error", err);
    return NextResponse.json({ ok: false, message: "Couldn't delete that expense." }, { status: 500 });
  }
}
