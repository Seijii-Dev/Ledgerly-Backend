import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await getAuthContext(req);
  if (!auth) return NextResponse.json({ ok: false, message: "Not signed in." }, { status: 401 });
  try {
    const { data: profile, error } = await auth.client.from("profiles").select("name, budget").eq("id", auth.user.id).maybeSingle();
    if (error) throw error;
    return NextResponse.json({ ok: true, account: { id: auth.user.id, name: profile?.name ?? auth.user.user_metadata?.name ?? "", email: auth.user.email ?? "", budget: Number(profile?.budget ?? 5000) } });
  } catch (err) {
    console.error("me error", err);
    return NextResponse.json({ ok: false, message: "Something went wrong." }, { status: 500 });
  }
}
