import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { requireHeapMember } from "@/lib/auth-helpers";

type Params = { params: Promise<{ heapId: string; sessionId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { heapId, sessionId } = await params;
  const body = await request.json().catch(() => ({}));
  const { title, meta } = body ?? {};

  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (meta !== undefined) updates.meta = meta;

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
    "You must be a member of this heap to update projects"
  );
  if (!authResult.success) {
    return authResult.response;
  }

  const serviceClient = await createServiceRoleClient();

  const { data, error } = await serviceClient
    .from("chat_sessions")
    .update(updates)
    .eq("id", sessionId)
    .eq("heap_id", heapId)
    .select("*")
    .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data });
}

