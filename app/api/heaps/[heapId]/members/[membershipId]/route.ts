import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireHeapOwner } from "@/lib/auth-helpers";

type Params = { params: Promise<{ heapId: string; membershipId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { heapId, membershipId } = await params;
  const body = await request.json().catch(() => ({}));
  const { role } = body ?? {};

  // Validate role
  if (!role || !["member", "admin", "owner"].includes(role)) {
    return NextResponse.json(
      { error: "Invalid role. Must be 'member', 'admin', or 'owner'" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Verify user is authenticated and is a heap admin/owner
  const authResult = await requireHeapOwner(
    supabase,
    heapId,
    "You must be an admin or owner of this heap to update member roles"
  );
  if (!authResult.success) {
    return authResult.response;
  }

  const { user } = authResult;

  // Get the membership to verify it exists
  const serviceClient = await createServiceRoleClient();
  const { data: membership, error: fetchError } = await serviceClient
    .from("memberships")
    .select("*")
    .eq("id", membershipId)
    .eq("heap_id", heapId)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 400 });
  }

  if (!membership) {
    return NextResponse.json({ error: "Membership not found" }, { status: 404 });
  }

  // Prevent users from setting themselves to 'member'
  if (membership.user_id === user.id && role === "member") {
    return NextResponse.json(
      { error: "You cannot set your own role to 'member'" },
      { status: 403 }
    );
  }

  // Update the membership role
  const { data, error } = await serviceClient
    .from("memberships")
    .update({ role })
    .eq("id", membershipId)
    .eq("heap_id", heapId)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}

