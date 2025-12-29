import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ heapId: string }> };

const PAGE_SIZE = 10;

export async function GET(request: Request, { params }: Params) {
  const { heapId } = await params;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const offset = (page - 1) * PAGE_SIZE;

  const supabase = await createClient();
  const { data, error, count } = await supabase
    .from("data_rows")
    .select("*", { count: "exact" })
    .eq("heap_id", heapId)
    .eq("source_type", "heap_activities")
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 0;

  return NextResponse.json({
    data: data || [],
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total: count || 0,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
}
