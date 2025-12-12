import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ token: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { token } = await params;
  const serviceClient = await createServiceRoleClient();

  // Get invite by token
  const { data: invite, error } = await serviceClient
    .from("invites")
    .select("*")
    .eq("token", token)
    .single();

  if (error || !invite) {
    return NextResponse.json(
      { error: "Invite not found" },
      { status: 404 }
    );
  }

  console.log('invite', invite);

  // Check if invite is expired
  const now = new Date();
  const expiresAt = invite.expires_at ? new Date(invite.expires_at) : null;
  const isExpired = expiresAt && expiresAt < now;

  // Check if invite is already used
  const isUsed = !!invite.used_at;

  // Get heap details
  const { data: heap } = await serviceClient
    .from("heaps")
    .select("id, name, description")
    .eq("id", invite.heap_id)
    .single();

  return NextResponse.json({
    data: {
      ...invite,
      isExpired,
      isUsed,
      heap: heap || null,
    },
  });
}
