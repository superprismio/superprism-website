import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function Dashboard() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-10 py-10 items-center">
      <h2 className="font-bold text-2xl mb-4">User data</h2>
      <pre className="text-xs font-mono p-3 rounded border max-h-48 overflow-auto">
        {JSON.stringify(data.claims, null, 2)}
      </pre>

      <Link href="/heaps">Heaps</Link>
    </div>
  );
}
