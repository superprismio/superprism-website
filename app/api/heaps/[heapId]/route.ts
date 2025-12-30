import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { requireHeapMember, requireHeapOwner } from "@/lib/auth-helpers";

type Params = { params: Promise<{ heapId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { heapId } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("heaps")
    .select("*")
    .eq("id", heapId)
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PATCH(request: Request, { params }: Params) {
  const { heapId } = await params;
  const body = await request.json().catch(() => ({}));
  const {
    name,
    description,
    avatar_url,
    visibility,
    allowed_group_ids,
    config,
  } = body ?? {};

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (avatar_url !== undefined) updates.avatar_url = avatar_url;
  if (visibility !== undefined) updates.visibility = visibility;
  if (allowed_group_ids !== undefined)
    updates.allowed_group_ids = allowed_group_ids;
  if (config !== undefined) updates.config = config;

  const supabase = await createClient();

  // Verify user is authenticated and is a heap owner
  const authResult = await requireHeapOwner(
    supabase,
    heapId,
    "You must be a member of this heap to add tags"
  );
  if (!authResult.success) {
    return authResult.response;
  }

  const serviceClient = await createServiceRoleClient();

  const { data, error } = await serviceClient
    .from("heaps")
    .update(updates)
    .eq("id", heapId)
    .select("*")
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { heapId } = await params;
  const supabase = await createClient();
  const { error } = await supabase.from("heaps").delete().eq("id", heapId);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
