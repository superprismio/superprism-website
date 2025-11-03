import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ heapId: string; sessionId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { heapId, sessionId } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("heap_id", heapId)
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}


