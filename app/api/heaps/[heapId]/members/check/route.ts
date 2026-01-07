import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth-helpers";

type Params = { params: Promise<{ heapId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { heapId } = await params;
  const supabase = await createClient();
  
  // Check authentication
  const authResult = await requireAuth(supabase);
  if (!authResult.success) {
    return authResult.response;
  }

  // Check heap membership using RPC
  const { data: isMember, error: memberError } = await supabase.rpc(
    "is_heap_member",
    {
      p_heap_id: heapId,
    }
  );

  if (memberError) {
    return NextResponse.json(
      { error: memberError.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ data: { isMember: Boolean(isMember) } });
}

