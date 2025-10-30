import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: { heapId: string } };

export async function GET(_request: Request, { params }: Params) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("heaps")
    .select("*")
    .eq("id", params.heapId)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PATCH(request: Request, { params }: Params) {
  const body = await request.json().catch(() => ({}));
  const { name, description, avatar_url, visibility, allowed_group_ids, config } = body ?? {};

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (avatar_url !== undefined) updates.avatar_url = avatar_url;
  if (visibility !== undefined) updates.visibility = visibility;
  if (allowed_group_ids !== undefined) updates.allowed_group_ids = allowed_group_ids;
  if (config !== undefined) updates.config = config;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("heaps")
    .update(updates)
    .eq("id", params.heapId)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

export async function DELETE(_request: Request, { params }: Params) {
  const supabase = await createClient();
  const { error } = await supabase.from("heaps").delete().eq("id", params.heapId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}


