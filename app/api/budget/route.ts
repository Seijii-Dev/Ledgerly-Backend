import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";
import { budgetSchema } from "@/lib/validation";

export async function PUT(req: NextRequest) {
  const auth = await getAuthContext(req);
  if (!auth) return NextResponse.json({ ok: false, message: "Not signed in." }, { status: 401 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 }); }
  const parsed = budgetSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  const { error } = await auth.client.from("profiles").update({ budget: parsed.data.budget }).eq("id", auth.user.id);
  if (error) { console.error("budget PUT error", error); return NextResponse.json({ ok: false, message: "Couldn't update your budget." }, { status: 500 }); }
  return NextResponse.json({ ok: true, budget: parsed.data.budget });
}
