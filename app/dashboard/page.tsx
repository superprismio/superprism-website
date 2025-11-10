import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { SpaceRoot } from "@/components/spaces/space-root";

export default async function Dashboard() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col">
      <SpaceRoot />
    </div>
  );
}
