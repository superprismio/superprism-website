import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ heapId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { heapId } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_heap_members", {
    target_heap_id: heapId,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}


