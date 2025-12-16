import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { SpaceRoot } from "@/components/spaces/space-root";

type Params = { params: Promise<{ heapId: string }> };

export default async function DashboardSpace({ params }: Params) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const { heapId } = await params;

  return (
    <div className="flex-1 w-full flex flex-col">
      <SpaceRoot heapId={heapId} />
    </div>
  );
}

