import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { SpaceRoot } from "@/components/spaces/space-root";

function normalizeSpace(entry: Record<string, unknown>) {
  if ("heap_id" in entry && "heap_name" in entry) {
    return {
      id: String(entry.heap_id),
      name: String(entry.heap_name ?? ""),
    };
  }

  if ("id" in entry && "name" in entry) {
    return {
      id: String(entry.id),
      name: String(entry.name ?? ""),
    };
  }

  return null;
}

export default async function Dashboard() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  // Fetch user's spaces
  const { data: memberships, error: membershipsError } = await supabase.rpc(
    "get_my_memberships"
  );

  if (membershipsError) {
    // If there's an error, still show the component which will handle it
    return (
      <div className="h-screen w-full flex flex-col overflow-hidden">
        <SpaceRoot />
      </div>
    );
  }

  const spaces = Array.isArray(memberships)
    ? memberships
        .map((entry) =>
          entry && typeof entry === "object" ? normalizeSpace(entry) : null
        )
        .filter((item): item is { id: string; name: string } => item !== null)
    : [];

  // If user has spaces, redirect to the first one
  if (spaces.length > 0) {
    redirect(`/dashboard/${spaces[0].id}`);
  }

  // No spaces - show the empty state with space creation
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <SpaceRoot />
    </div>
  );
}
