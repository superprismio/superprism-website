import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: { heapId: string } };

export async function GET(_request: Request, { params }: Params) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_heap_members", {
    target_heap_id: params.heapId,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}


