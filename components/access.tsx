import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/server";

export async function Access() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims);
  const getStartedHref = isAuthenticated ? "/dashboard" : "/auth/login";

  return (
        <div className="flex flex-col max-w-4xl mb-16">
          <h4 className="text-lg mb-6">Join the Waitlist to get early access.</h4>
          <div className="flex flex-row w-lg">
            <Input className="lg:w-2/3"name="Email Address" placeholder="Email Address"/>
            <Button type="submit">Submit</Button>
          </div>
        </div>
  );
}
