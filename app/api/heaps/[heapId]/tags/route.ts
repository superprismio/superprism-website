import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: { heapId: string } };

export async function GET(_request: Request, { params }: Params) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kb_tags")
    .select("*")
    .eq("heap_id", params.heapId)
    .order("label", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

export async function POST(request: Request, { params }: Params) {
  const body = await request.json().catch(() => ({}));
  const { label, slug, description, is_active, synonyms } = body ?? {};
  if (!label || !slug)
    return NextResponse.json({ error: "label and slug are required" }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kb_tags")
    .insert({ label, slug, description, is_active, synonyms, heap_id: params.heapId })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data }, { status: 201 });
}


