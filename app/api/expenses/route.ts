import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";
import { expenseSchema } from "@/lib/validation";

function serialize(row: Record<string, unknown>) {
  return { id: row.id, amount: Number(row.amount), category: row.category, payment: row.payment, description: row.description, date: row.date };
}

export async function GET(req: NextRequest) {
  const auth = await getAuthContext(req);
  if (!auth) return NextResponse.json({ ok: false, message: "Not signed in." }, { status: 401 });
  const { data, error } = await auth.client.from("expenses").select("id, amount, category, payment, description, date").eq("user_id", auth.user.id).order("date", { ascending: false }).order("created_at", { ascending: false });
  if (error) { console.error("expenses GET error", error); return NextResponse.json({ ok: false, message: "Couldn't load your expenses." }, { status: 500 }); }
  return NextResponse.json({ ok: true, expenses: (data ?? []).map(serialize) });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthContext(req);
  if (!auth) return NextResponse.json({ ok: false, message: "Not signed in." }, { status: 401 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 }); }
  const parsed = expenseSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  const { data, error } = await auth.client.from("expenses").insert({ user_id: auth.user.id, ...parsed.data }).select("id, amount, category, payment, description, date").single();
  if (error) { console.error("expenses POST error", error); return NextResponse.json({ ok: false, message: "Couldn't save that expense." }, { status: 500 }); }
  return NextResponse.json({ ok: true, expense: serialize(data) }, { status: 201 });
}
