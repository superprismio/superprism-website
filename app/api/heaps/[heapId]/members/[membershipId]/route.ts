import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireHeapMember } from "@/lib/auth-helpers";

type Params = { params: Promise<{ heapId: string; membershipId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { heapId, membershipId } = await params;
  const body = await request.json().catch(() => ({}));
  const { display_name, member_bio } = body ?? {};

  const updates: Record<string, unknown> = {};
  if (display_name !== undefined) updates.display_name = display_name;
  if (member_bio !== undefined) updates.member_bio = member_bio;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Verify user is authenticated and is a heap member
  const authResult = await requireHeapMember(
    supabase,
    heapId,
    "You must be a member of this heap to update membership"
  );
  if (!authResult.success) {
    return authResult.response;
  }

  const { user } = authResult;

  // Get the membership to verify ownership
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

  // Users can only update their own membership
  if (membership.user_id !== user.id) {
    return NextResponse.json(
      { error: "You can only update your own membership" },
      { status: 403 }
    );
  }

  // Update the membership
  const { data, error } = await serviceClient
    .from("memberships")
    .update(updates)
    .eq("id", membershipId)
    .eq("heap_id", heapId)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}

