import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth-helpers";

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { name } = body ?? {};

  const supabase = await createClient();

  // Verify user is authenticated
  const authResult = await requireAuth(supabase);
  if (!authResult.success) {
    return authResult.response;
  }

  const { user } = authResult;

  // Build updates object
  const updates: Record<string, unknown> = {};
  if (name !== undefined) {
    updates.name = name === "" ? null : name.trim() || null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  // Update the user profile
  const serviceClient = await createServiceRoleClient();
  const { data, error } = await serviceClient
    .from("user_profiles")
    .update(updates)
    .eq("user_id", user.id)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data) {
    // Profile doesn't exist, create it
    const { data: newProfile, error: createError } = await serviceClient
      .from("user_profiles")
      .insert({
        user_id: user.id,
        ...updates,
      })
      .select("*")
      .single();

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    return NextResponse.json({ data: newProfile });
  }

  return NextResponse.json({ data });
}

