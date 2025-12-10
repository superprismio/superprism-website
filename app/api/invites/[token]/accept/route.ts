import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth-helpers";

type Params = { params: Promise<{ token: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { token } = await params;
  const supabase = await createClient();

  // Check authentication
  const authResult = await requireAuth(supabase);
  if (!authResult.success) {
    return authResult.response;
  }

  const { user } = authResult;

  if (!user.email) {
    return NextResponse.json(
      { error: "User email is required" },
      { status: 400 }
    );
  }

  // Get invite details to validate
  const { data: invites, error: inviteError } = await supabase
    .from("invites")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (inviteError) {
    return NextResponse.json(
      { error: inviteError.message },
      { status: 400 }
    );
  }

  if (!invites) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  // Check if invite is already used
  if (invites.used_at) {
    return NextResponse.json(
      { error: "This invite has already been used" },
      { status: 400 }
    );
  }

  // Check if invite is expired
  if (invites.expires_at) {
    const expiresAt = new Date(invites.expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This invite has expired" },
        { status: 400 }
      );
    }
  }

  // Check if email matches
  if (invites.email && invites.email.toLowerCase() !== user.email.toLowerCase()) {
    return NextResponse.json(
      { error: "This invite is for a different email address" },
      { status: 403 }
    );
  }

  // Accept invite using the database function
  const { data, error } = await supabase.rpc("accept_invite", {
    invite_token: token,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}
