import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ token: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { token } = await params;
  const supabase = await createClient();

  // Get invite details (no auth required for validation)
  const { data: invite, error } = await supabase
    .from("invites")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  // Check if invite is already used
  if (invite.used_at) {
    return NextResponse.json(
      { error: "This invite has already been used" },
      { status: 400 }
    );
  }

  // Check if invite is expired
  if (invite.expires_at) {
    const expiresAt = new Date(invite.expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This invite has expired" },
        { status: 400 }
      );
    }
  }

  // Return invite details (without sensitive info)
  return NextResponse.json({
    data: {
      email: invite.email,
      role: invite.role,
      heap_id: invite.heap_id,
    },
  });
}
