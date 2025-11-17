// import { Cta } from "@/components/cta";
// import { createClient } from "@/lib/supabase/server";
import { EarlyAccessForm } from "./early-access-form";

export async function Hero() {
  // const supabase = await createClient();
  // const { data } = await supabase.auth.getClaims();
  // const isAuthenticated = Boolean(data?.claims);
  // const getStartedHref = isAuthenticated ? "/dashboard" : "/auth/login";

  return (
    <div className="flex flex-col gap-6 lg:gap-12 w-full max-w-4xl px-4 lg:px-0 py-20 lg:py-40 xl:py-60">
      <p className="text-2xl lg:text-4xl max-w-xl text-muted-foreground">
        A collaborative workspace that is local first and AI-native.
      </p>
      <p className="text-base lg:text-xl max-w-xl">
        Superprism refracts your scattered knowledge into focused, powerful
        contexts. Organize your information into distinct spaces, ready to work
        with AI within relevent context. Local-first architecture protects your
        data. Context isolation keeps your AI sharp and relevant.
      </p>
      {/* <div className="flex flex-wrap justify-center gap-4">
        <Cta />
      </div> */}
      <div className="items-center w-full">
        <EarlyAccessForm className="mx-auto w-full max-w-3xl" />
      </div>
    </div>
  );
}
