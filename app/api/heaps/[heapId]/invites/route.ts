import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth-helpers";

type Params = { params: Promise<{ heapId: string }> };

export async function POST(request: Request, { params }: Params) {
  const { heapId } = await params;
  const supabase = await createClient();

  // Check authentication
  const authResult = await requireAuth(supabase);
  if (!authResult.success) {
    return authResult.response;
  }

  const { user } = authResult;

  // Check if user is heap owner/admin
  const { data: isAdmin, error: adminError } = await supabase.rpc(
    "is_heap_admin",
    {
      p_heap_id: heapId,
      p_user_id: user.id,
    }
  );

  if (adminError || !isAdmin) {
    return NextResponse.json(
      { error: "Only heap owners can create invites" },
      { status: 403 }
    );
  }

  // Parse request body
  const body = await request.json().catch(() => ({}));
  const { email, role = "member" } = body ?? {};

  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { error: "email is required" },
      { status: 400 }
    );
  }

  if (role !== "member" && role !== "owner") {
    return NextResponse.json(
      { error: "role must be 'member' or 'owner'" },
      { status: 400 }
    );
  }

  // Create invite using the database function
  const { data, error } = await supabase.rpc("create_invite", {
    target_heap_id: heapId,
    invite_email: email,
    invite_role: role,
    expires_in_days: 2,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Extract token from the response
  const inviteData = data as { token?: string; invite_id?: string } | null;
  if (!inviteData || !inviteData.token) {
    return NextResponse.json(
      { error: "Failed to create invite" },
      { status: 500 }
    );
  }

  // Generate invite link
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://superprism.io");
  const inviteLink = `${baseUrl}/invite/${inviteData.token}`;

  return NextResponse.json({
    data: {
      ...inviteData,
      invite_link: inviteLink,
    },
  });
}

export async function GET(_request: Request, { params }: Params) {
  const { heapId } = await params;
  const supabase = await createClient();

  // Check authentication
  const authResult = await requireAuth(supabase);
  if (!authResult.success) {
    return authResult.response;
  }

  const { user } = authResult;

  // Check if user is heap owner/admin
  const { data: isAdmin, error: adminError } = await supabase.rpc(
    "is_heap_admin",
    {
      p_heap_id: heapId,
      p_user_id: user.id,
    }
  );

  if (adminError || !isAdmin) {
    return NextResponse.json(
      { error: "Only heap owners can view invites" },
      { status: 403 }
    );
  }

  // Get invites using the database function
  const { data, error } = await supabase.rpc("get_heap_invites", {
    target_heap_id: heapId,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Filter to only pending invites (not expired and not used)
  const pendingInvites = (data || []).filter(
    (invite: {
      is_expired: boolean;
      is_used: boolean;
    }) => !invite.is_expired && !invite.is_used
  );

  return NextResponse.json({ data: pendingInvites });
}
