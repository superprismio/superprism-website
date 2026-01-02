import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mine = searchParams.get("mine");

  const supabase = await createClient();

  if (mine) {
    const { data: memberships, error } = await supabase.rpc(
      "get_my_memberships"
    );
    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data: memberships });
  }

  const { data, error } = await supabase.from("heaps").select("*");
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { name, description, avatar_url, visibility, config } = body ?? {};

  if (!name)
    return NextResponse.json({ error: "name is required" }, { status: 400 });

  console.log("config", config);

  const supabase = await createClient();

  const { data: inserted, error } = await supabase.rpc("create_heap", {
    heap_name: name,
    description,
    avatar_url: avatar_url,
    heap_visibility: visibility || "public",
  });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data: inserted }, { status: 201 });
}
