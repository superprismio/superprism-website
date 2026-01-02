import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireHeapMember, requireHeapOwner } from "@/lib/auth-helpers";

type Params = { params: Promise<{ heapId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { heapId } = await params;
  const supabase = await createClient();

  // Check if user is a heap member
  const authResult = await requireHeapMember(supabase, heapId);
  if (!authResult.success) {
    return authResult.response;
  }

  // Use service role client to bypass RLS for getting invites
  // const serviceClient = await createServiceRoleClient();
  const { data, error } = await supabase.rpc("get_heap_invites", {
    target_heap_id: heapId,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request, { params }: Params) {
  const { heapId } = await params;
  const supabase = await createClient();

  // Check if user is a heap member
  const authResult = await requireHeapOwner(supabase, heapId);
  if (!authResult.success) {
    return authResult.response;
  }

  const body = await request.json();
  const { email, role, expiresInDays } = body;

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Use authenticated client to create invite (RPC function uses auth.uid())
  const { data, error } = await authResult.supabase.rpc("create_invite", {
    target_heap_id: heapId,
    invite_email: email,
    invite_role: role || "member",
    expires_in_days: expiresInDays || 7,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}
