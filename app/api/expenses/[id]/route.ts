import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";
import { expenseSchema } from "@/lib/validation";

function serialize(row: Record<string, unknown>) {
  return { id: row.id, amount: Number(row.amount), category: row.category, payment: row.payment, description: row.description, date: row.date };
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthContext(req);
  if (!auth) return NextResponse.json({ ok: false, message: "Not signed in." }, { status: 401 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 }); }
  const parsed = expenseSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  const { data, error } = await auth.client.from("expenses").update(parsed.data).eq("id", params.id).eq("user_id", auth.user.id).select("id, amount, category, payment, description, date").maybeSingle();
  if (error) { console.error("expenses PUT error", error); return NextResponse.json({ ok: false, message: "Couldn't update that expense." }, { status: 500 }); }
  if (!data) return NextResponse.json({ ok: false, message: "Expense not found." }, { status: 404 });
  return NextResponse.json({ ok: true, expense: serialize(data) });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthContext(req);
  if (!auth) return NextResponse.json({ ok: false, message: "Not signed in." }, { status: 401 });
  const { data, error } = await auth.client.from("expenses").delete().eq("id", params.id).eq("user_id", auth.user.id).select("id").maybeSingle();
  if (error) { console.error("expenses DELETE error", error); return NextResponse.json({ ok: false, message: "Couldn't delete that expense." }, { status: 500 }); }
  if (!data) return NextResponse.json({ ok: false, message: "Expense not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
