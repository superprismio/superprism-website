import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { requireHeapMember } from "@/lib/auth-helpers";

type Params = { params: Promise<{ heapId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { heapId } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("heap_id", heapId)
    .or("archived.is.null,archived.eq.false")
    .order("created_at", { ascending: false });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

export async function POST(request: Request, { params }: Params) {
  const { heapId } = await params;
  const body = await request.json().catch(() => ({}));
  const { title, meta, filter } = body ?? {};

  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const supabase = await createClient();

  // Verify user is authenticated and is a heap member
  const authResult = await requireHeapMember(
    supabase,
    heapId,
    "You must be a member of this heap to create projects"
  );
  if (!authResult.success) {
    return authResult.response;
  }

  const { user } = authResult;

  const serviceClient = await createServiceRoleClient();

  const finalFilter =
    filter !== undefined
      ? filter
      : meta?.file_id && Array.isArray(meta.file_id) && meta.file_id.length > 0
        ? {
            in: { file_id: meta.file_id },
          }
        : null;

  const { data, error } = await serviceClient
    .from("chat_sessions")
    .insert({
      id: crypto.randomUUID(),
      heap_id: heapId,
      title,
      created_by: user.id,
      meta: meta ?? { isProject: true, file_id: [] },
      filter: finalFilter,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ data });
}
