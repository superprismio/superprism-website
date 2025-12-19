import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ heapId: string }> };

export async function GET(request: Request, { params }: Params) {
  const { heapId } = await params;
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("ids");

  if (!idsParam) {
    return NextResponse.json({ error: "ids parameter is required" }, { status: 400 });
  }

  // Support both comma-separated and array formats
  const ids = idsParam.split(",").filter((id) => id.trim().length > 0);

  if (ids.length === 0) {
    return NextResponse.json({ data: [] });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("files")
    .select("*")
    .eq("heap_id", heapId)
    .in("id", ids)
    .is("deleted_at", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}

