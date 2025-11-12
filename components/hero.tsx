import { Cta } from "@/components/cta";
import { Access } from "@/components/access";
import { createClient } from "@/lib/supabase/server";

export async function Hero() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims);
  const getStartedHref = isAuthenticated ? "/dashboard" : "/auth/login";

  return (
    <div className="flex flex-col gap-12 w-4xl py-40 lg:py-60">
        <p className="lg:text-4xl max-w-xl text-muted-foreground">
          A collaborative workspace that is local first and AI-native.
        </p>
        <p className="lg:text-xl max-w-xl">
          Superprism refracts your scattered knowledge into focused, powerful contexts. Organize your information into distinct spaces, ready to work with AI within relevent context. Local-first architecture protects your data. Context isolation keeps your AI sharp and relevant.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Cta />
      </div>
      <div className="items-center">
        <Access />
      </div>
    </div>
  );
}
