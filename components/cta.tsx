import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export async function Cta() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims);
  const getStartedHref = isAuthenticated ? "/dashboard" : "/auth/login";

  return (
        <div className="flex flex-row items-center w-full mt-8 gap-12">
          <Button asChild>
            <Link href={getStartedHref}>Get Started</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/discord">Join Community</Link>
          </Button> 
          <Button asChild  variant="outline">
            <Link href="/docs">Read Documentation</Link>
          </Button>
        </div>
  );
}
