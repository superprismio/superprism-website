import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth-helpers";
import { createServiceRoleClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ token: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { token } = await params;
  const supabase = await createClient();
  
  // Check authentication
  const authResult = await requireAuth(supabase);
  if (!authResult.success) {
    return authResult.response;
  }

  const { user, supabase: authenticatedClient } = authResult;

  // Use service role client to get invite details (bypass RLS)
  const serviceClient = await createServiceRoleClient();
  
  // Get invite by token
  const { data: invite, error: inviteError } = await serviceClient
    .from("invites")
    .select("*")
    .eq("token", token)
    .single();

  if (inviteError || !invite) {
    return NextResponse.json(
      { error: "Invite not found" },
      { status: 404 }
    );
  }

  // Check if invite is expired
  const now = new Date();
  const expiresAt = invite.expires_at ? new Date(invite.expires_at) : null;
  if (expiresAt && expiresAt < now) {
    return NextResponse.json(
      { error: "This invite has expired" },
      { status: 400 }
    );
  }

  // Check if invite is already used
  if (invite.used_at) {
    return NextResponse.json(
      { error: "This invite has already been used" },
      { status: 400 }
    );
  }

  // Validate email match if invite has an email
  if (invite.email && user.email) {
    if (invite.email.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json(
        { error: "This invite is for a different email address" },
        { status: 403 }
      );
    }
  }

  // Use the authenticated client to call accept_invite (function uses auth.uid())
  const { data: acceptResult, error: acceptError } = await authenticatedClient.rpc(
    "accept_invite",
    {
      invite_token: token,
    }
  );

  if (acceptError) {
    return NextResponse.json(
      { error: acceptError.message || "Failed to accept invite" },
      { status: 400 }
    );
  }

  return NextResponse.json({ data: acceptResult });
}
