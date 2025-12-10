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
    return NextResponse.json({ data: false });
  }

  const { user } = authResult;

  // Check if user is heap owner/admin
  const { data: isAdmin, error } = await supabase.rpc("is_heap_admin", {
    p_heap_id: heapId,
    p_user_id: user.id,
  });

  if (error) {
    return NextResponse.json({ data: false });
  }

  return NextResponse.json({ data: isAdmin === true });
}
